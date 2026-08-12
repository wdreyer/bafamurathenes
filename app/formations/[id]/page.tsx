import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { Formation } from "@/lib/types";
import {
  getFormationLegacySlugs,
  getFormationSlug,
  normalizeSlugSegment,
} from "@/lib/formationSlugs";
import { cleanFormationTitle } from "@/lib/formationTitles";
import FormationDetailPageClient from "@/components/public/formations/FormationDetailPageClient";
import { getSiteUrl } from "@/lib/siteUrl";

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
  nullValue?: null;
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
};

type PageParams = {
  params: Promise<{ id: string }> | { id: string };
};

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/formations`;

function readFirestoreValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue ?? "";
  if ("integerValue" in value) return Number(value.integerValue ?? 0);
  if ("doubleValue" in value) return value.doubleValue ?? 0;
  if ("booleanValue" in value) return value.booleanValue ?? false;
  if ("timestampValue" in value) return value.timestampValue ?? "";
  if ("arrayValue" in value) return (value.arrayValue?.values ?? []).map(readFirestoreValue);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue?.fields ?? {}).map(([key, nestedValue]) => [
        key,
        readFirestoreValue(nestedValue),
      ]),
    );
  }
  return null;
}

function normalizeDate(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function mapFirestoreDocument(document: FirestoreDocument): Formation {
  const id = document.name.split("/").pop() ?? "";
  const data = Object.fromEntries(
    Object.entries(document.fields ?? {}).map(([key, value]) => [key, readFirestoreValue(value)]),
  ) as Record<string, unknown>;

  return {
    ...data,
    id,
    startDate: normalizeDate(data.startDate),
    endDate: normalizeDate(data.endDate),
  } as Formation;
}

async function fetchFirestoreDocument(id: string): Promise<Formation | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(`${FIRESTORE_BASE_URL}/${encodeURIComponent(id)}?key=${apiKey}`, {
    cache: "no-store",
  });

  if (!response.ok) return null;

  return mapFirestoreDocument((await response.json()) as FirestoreDocument);
}

async function fetchAllFormations(): Promise<Formation[]> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return [];

  const response = await fetch(`${FIRESTORE_BASE_URL}?key=${apiKey}`, {
    cache: "no-store",
  });

  if (!response.ok) return [];

  const data = (await response.json()) as FirestoreListResponse;
  return (data.documents ?? []).map(mapFirestoreDocument);
}

async function resolveFormation(idOrSlug: string): Promise<Formation | null> {
  const directFormation = await fetchFirestoreDocument(idOrSlug);
  if (directFormation) return directFormation;

  const normalizedSlug = normalizeSlugSegment(idOrSlug);
  const formations = await fetchAllFormations();
  return (
    formations.find((formation) =>
      [getFormationSlug(formation), ...getFormationLegacySlugs(formation)].includes(normalizedSlug),
    ) ?? null
  );
}

function formatDateLabel(startDate?: string, endDate?: string): string {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }

  return `du ${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const formation = await resolveFormation(id);

  if (!formation) {
    return {
      title: "Formation introuvable",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = `/formations/${getFormationSlug(formation)}`;
  const dateLabel = formatDateLabel(formation.startDate, formation.endDate);
  const formationTitle = cleanFormationTitle(formation.title);
  const title = `${formationTitle} | BAFA Murathènes`;
  const description = [
    formationTitle,
    dateLabel,
    formation.price ? `tarif plein ${formation.price} €` : "",
    "formation BAFA avec Murathènes en Auvergne.",
  ].filter(Boolean).join(" - ");

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}${canonical}`,
      title,
      description,
      siteName: "BAFA Murathènes",
      images: [
        {
          url: "/hero-bafa.jpg",
          width: 1200,
          height: 630,
          alt: "Formation BAFA Murathènes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/hero-bafa.jpg`],
    },
  };
}

export default async function FormationDetailPage({ params }: PageParams) {
  const { id } = await params;
  const formation = await resolveFormation(id);

  if (!formation) {
    return (
      <main style={{ minHeight: "100vh", background: "#fefcf5" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
          <p style={{ color: "#B13A4A", marginBottom: 16 }}>Formation introuvable.</p>
          <Link href="/formations" style={{ color: "#792BB9", textDecoration: "underline", fontSize: 14 }}>
            ← Revenir au calendrier des formations
          </Link>
        </div>
      </main>
    );
  }

  const canonicalSlug = getFormationSlug(formation);
  if (normalizeSlugSegment(id) !== canonicalSlug) {
    redirect(`/formations/${canonicalSlug}`);
  }

  return <FormationDetailPageClient formation={formation} />;
}
