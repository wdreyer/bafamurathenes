import type { TrainingTimeScope } from "@/lib/types";
import { guideCategories, trainerResources } from "@/lib/trainerGuide";

export const guidePalette = ["emerald", "sky", "rose", "amber", "violet", "slate"] as const;
export type GuidePaletteColor = typeof guidePalette[number];

export type GuideFileType = "pdf" | "docx" | "pptx" | "xlsx" | "image" | "other";

export const GUIDE_FILE_ACCEPT = ".pdf,.doc,.docx,.odt,.ppt,.pptx,.odp,.xls,.xlsx,.ods,image/jpeg,image/png,image/webp,image/gif";
export const GUIDE_FILE_MAX_SIZE = 20 * 1024 * 1024;

export function guideFileType(fileName: string): GuideFileType | null {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  if (extension === "pdf") return "pdf";
  if (["doc", "docx", "odt"].includes(extension)) return "docx";
  if (["ppt", "pptx", "odp"].includes(extension)) return "pptx";
  if (["xls", "xlsx", "ods"].includes(extension)) return "xlsx";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) return "image";
  return null;
}

export const guideFileLabel: Record<GuideFileType, string> = {
  pdf: "PDF", docx: "Document texte", pptx: "Présentation", xlsx: "Tableur", image: "Image", other: "Document",
};

export const isPublishedResource = (resource: Pick<GuideResourceRecord, "status">) => !resource.status || resource.status === "published";

export type GuideCategoryRecord = {
  id: string;
  title: string;
  subtitle: string;
  color: GuidePaletteColor;
  order: number;
  hidden?: boolean;
};

export type GuideResourceRecord = {
  id: string;
  title: string;
  summary: string;
  useWhen: string;
  categoryId: string;
  scope: TrainingTimeScope;
  bodyHtml: string;
  coverImageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: GuideFileType;
  hidden?: boolean;
  /** Proposals from trainers stay out of the guide until an admin publishes them. Missing means published. */
  status?: "pending" | "published" | "rejected";
  proposedBy?: string;
  proposedByName?: string;
  reviewNote?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const categoryColor: Record<string, GuidePaletteColor> = {
  repere: "emerald",
  animation: "rose",
  cooperation: "violet",
  organisation: "amber",
  posture: "sky",
};

export const defaultGuideCategories: GuideCategoryRecord[] = guideCategories.map((category, index) => ({
  ...category,
  color: categoryColor[category.id] || "slate",
  order: index,
}));

export const defaultGuideResources: GuideResourceRecord[] = trainerResources.map((resource) => ({
  id: resource.id,
  title: resource.title,
  summary: resource.description,
  useWhen: resource.useWhen,
  categoryId: resource.category,
  scope: resource.scope,
  bodyHtml: `<h2>Présentation</h2><p>${resource.description}</p><h2>Quand l’utiliser ?</h2><p>${resource.useWhen}</p>`,
  fileUrl: resource.href,
  fileName: resource.href.split("/").pop(),
  fileType: resource.kind,
}));

export function mergeGuideCategories(custom: GuideCategoryRecord[]) {
  const merged = new Map(defaultGuideCategories.map((item) => [item.id, item]));
  custom.forEach((item) => merged.set(item.id, { ...merged.get(item.id), ...item }));
  return Array.from(merged.values()).filter((item) => !item.hidden)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "fr"));
}

export function mergeGuideResources(custom: GuideResourceRecord[]) {
  const merged = new Map(defaultGuideResources.map((item) => [item.id, item]));
  custom.filter(isPublishedResource).forEach((item) => merged.set(item.id, { ...merged.get(item.id), ...item }));
  return Array.from(merged.values()).filter((item) => !item.hidden)
    .sort((a, b) => a.title.localeCompare(b.title, "fr"));
}

export function guideColorClasses(color: GuidePaletteColor) {
  return {
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    sky: "bg-sky-100 text-sky-800 border-sky-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
    amber: "bg-amber-100 text-amber-900 border-amber-200",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[color];
}

export function sanitizeGuideHtml(html: string) {
  if (typeof window === "undefined") return html;
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("script,style,iframe,object,embed,form,input,button").forEach((node) => node.remove());
  document.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      if (attribute.name.startsWith("on")) node.removeAttribute(attribute.name);
      if ((attribute.name === "href" || attribute.name === "src") && /^javascript:/i.test(attribute.value)) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return document.body.innerHTML;
}
