import { InscriptionsTable } from "@/components/admin/inscriptions/InscriptionsTable";

export default function InscriptionsPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inscriptions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Suivi des inscrits valides, paiements, aides CAF, echeanciers et reste a payer.
        </p>
      </div>

      <InscriptionsTable />
    </main>
  );
}
