import { InscriptionsTable } from "@/components/admin/inscriptions/InscriptionsTable";

export default function InscriptionsPage() {
  return (
    <main className="space-y-6">
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <h1 className="text-2xl font-semibold tracking-tight">Inscriptions</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
          Deux tableaux pour piloter les dossiers validés et ceux en cours, avec paiements, virements, échéances et CAF.
        </p>
      </div>

      <InscriptionsTable />
    </main>
  );
}
