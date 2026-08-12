import { InscriptionsTable } from "@/components/admin/inscriptions/InscriptionsTable";

export default function InscriptionsPage() {
  return (
    <main className="space-y-6">
      <div
        className="border-2 px-5 py-5"
        style={{ borderColor: "#1a1530", background: "#1a1530", color: "#fefcf5", boxShadow: "5px 5px 0 #f5ef72" }}
      >
        <p className="mura-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#f5ef72" }}>
          Suivi administratif
        </p>
        <h1 className="ed mt-2 text-4xl font-semibold italic leading-none">Inscriptions</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: "rgba(254,252,245,.78)" }}>
          Deux tableaux pour piloter les dossiers validés et ceux en cours, avec paiements, virements, échéances et CAF.
        </p>
      </div>

      <InscriptionsTable />
    </main>
  );
}
