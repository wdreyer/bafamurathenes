"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Formation, Inscription } from "@/lib/types";
import { cleanFormationTitle } from "@/lib/formationTitles";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

type Props = {
  formations: Formation[];
  inscriptions: Inscription[];
};

const typeLabel: Record<string, string> = {
  formation_generale: "Formation générale",
  approfondissement_sejour_etranger:
    "Étape 3 · Approfondissement - Séjour à l'étranger / échange de jeunes",
};

const parseDateToTime = (value: string | undefined | null): number => {
  if (!value) return 0;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

const formatDateFr = (value: string | undefined | null): string => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const splitEmails = (value?: string) =>
  (value || "")
    .split(/[;,\s]+/)
    .map((email) => email.trim())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

function getFormationEmails(formation: Formation, inscriptions: Inscription[]): string[] {
  const formationTitle = cleanFormationTitle(formation.title).toLowerCase();
  const matchingInscriptions = inscriptions.filter((inscription) =>
    inscription.formationId === formation.id
      || (!inscription.formationId
        && cleanFormationTitle(inscription.formationTitle).toLowerCase() === formationTitle),
  );

  const emails = matchingInscriptions.flatMap((inscription) => [
    ...splitEmails(inscription.email),
    ...splitEmails(inscription.responsibleEmail),
  ]);

  return Array.from(new Map(emails.map((email) => [email.toLowerCase(), email])).values())
    .sort((a, b) => a.localeCompare(b, "fr"));
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function FormationsTable({ formations, inscriptions }: Props) {
  const [copiedFormationId, setCopiedFormationId] = useState<string | null>(null);

  const copyFormationEmails = async (formation: Formation) => {
    const emails = getFormationEmails(formation, inscriptions);
    if (!emails.length) return;

    await copyText(emails.join(", "));
    setCopiedFormationId(formation.id);
    window.setTimeout(() => setCopiedFormationId(null), 2000);
  };

  if (!formations.length) {
    return (
      <div className="border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        Aucune formation pour l&apos;instant.
        <br />
        <span className="text-slate-400">
          Cliquez sur &laquo; Nouvelle formation &raquo; pour commencer.
        </span>
      </div>
    );
  }

  const sortedFormations = [...formations].sort(
    (a, b) => parseDateToTime(a.startDate) - parseDateToTime(b.startDate),
  );

  return (
    <div className="overflow-hidden border border-slate-200 bg-white">
      <Table>
        <THead>
          <TR>
            <TH className="w-[34%]">Titre</TH>
            <TH className="w-[20%]">Type</TH>
            <TH className="w-[20%]">Dates</TH>
            <TH>Prix</TH>
            <TH>Inscriptions</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {sortedFormations.map((formation) => {
            const emailCount = getFormationEmails(formation, inscriptions).length;
            const copied = copiedFormationId === formation.id;

            return (
              <TR key={formation.id}>
              <TD className="w-[34%]">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">
                    {cleanFormationTitle(formation.title)}
                  </span>
                  <span className="line-clamp-1 text-xs text-slate-500">
                    {formation.description}
                  </span>
                </div>
              </TD>
              <TD className="w-[20%]">
                <span className="text-xs text-slate-700">
                  {typeLabel[formation.type] ?? formation.type}
                </span>
              </TD>
              <TD className="w-[20%] whitespace-nowrap text-xs text-slate-600">
                {formatDateFr(formation.startDate)} → {formatDateFr(formation.endDate)}
              </TD>
              <TD>
                <div className="flex flex-col text-sm">
                  <span>{formation.price} €</span>
                  <span className="text-[11px] text-slate-500">
                    hors transport
                  </span>
                </div>
              </TD>
              <TD>{formation.inscriptionsCount ?? 0}</TD>
              <TD className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-8 gap-1.5 px-2 text-xs"
                    disabled={!emailCount}
                    title={emailCount
                      ? `Copier ${emailCount} email${emailCount > 1 ? "s" : ""}`
                      : "Aucun email à copier"}
                    onClick={() => void copyFormationEmails(formation)}
                  >
                    {copied
                      ? <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    {copied ? "Copié" : `Copier les emails (${emailCount})`}
                  </Button>
                  <Link href={`/admin/formations/${formation.id}`}>
                    <Button variant="secondary" className="h-8 px-2 text-xs">
                      Modifier
                    </Button>
                  </Link>
                </div>
              </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
