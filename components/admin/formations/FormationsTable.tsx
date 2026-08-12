"use client";

import Link from "next/link";
import type { Formation } from "@/lib/types";
import { cleanFormationTitle } from "@/lib/formationTitles";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

type Props = {
  formations: Formation[];
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

export function FormationsTable({ formations }: Props) {
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
          {sortedFormations.map((formation) => (
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
                <Link href={`/admin/formations/${formation.id}`}>
                  <Button variant="secondary" className="h-8 px-2 text-xs">
                    Modifier
                  </Button>
                </Link>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
