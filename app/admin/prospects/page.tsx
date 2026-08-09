import { ProspectsTracker } from "@/components/admin/prospects/ProspectsTracker";

export default function ProspectsPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prospects</h1>
        <p className="mt-1 text-sm text-slate-500">
          Suivi des contacts issus des formulaires, des demandes d&apos;aides et des ouvertures Yapla.
        </p>
      </div>

      <ProspectsTracker />
    </main>
  );
}
