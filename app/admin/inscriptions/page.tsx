export default function InscriptionsPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inscriptions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ici, vous afficherez bientôt la liste des inscriptions, avec le suivi des paiements.
        </p>
      </div>

      <div className="border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        On pourra brancher cette page sur la collection <code>inscriptions</code> de Firestore :
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Nom / prénom / email / téléphone</li>
          <li>Formation associée</li>
          <li>Mode de paiement et statut (payé / non payé)</li>
        </ul>
      </div>
    </main>
  );
}
