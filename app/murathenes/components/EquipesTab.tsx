export default function EquipesTab() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Équipes
          </p>
          <h2 className="mt-1 font-display text-xl md:text-2xl font-semibold text-slate-900">
            Des formateur·rices engagé·es, proches du terrain
          </h2>
        </div>

        <div className="px-5 py-5 text-sm leading-6 text-slate-700 space-y-3">
          <p>
            Murathènes forme et accompagne des formatrices et formateurs
            engagé.es, aux expériences riches et diversifiées.
          </p>
          <p>
            Elles ont une connaissance du terrain des mobilités, d’une variété
            de publics et de types de séjours, et sont toujours actives dans
            l'animation.
          </p>
          <p>
            Leur engagement en éducation populaire est actuel. Les équipes de
            formation sont proches de l’association et de son réseau partenarial,
            et participent à leurs activités et projets. Un jour formateur.rice,
            collègue le lendemain ?
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pôle de formation
          </p>
          <h3 className="mt-1 font-display text-lg md:text-xl font-semibold text-slate-900">
            Coordination
          </h3>
        </div>

        <div className="px-5 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lorette */}
            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-4 bg-[#6666C6] text-[#F5EEDA]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-95">
                  Coordination
                </p>
                <h4 className="mt-1 font-display text-xl font-semibold">
                  Lorette Kuc
                </h4>
              </div>

              <div className="px-5 py-5 text-sm leading-6 text-slate-700 space-y-3">
                {/* TROU PHOTO */}
                <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-slate-500">
                    Placeholder photo Lorette
                  </div>
                </div>

                <ul className="list-disc pl-5 space-y-1">
                  <li>Formatrice BAFA depuis 2018</li>
                  <li>Directrice des séjours et échanges de jeunes Erasmus+ Murathènes</li>
                  <li>Responsable des activités européennes de Murathènes</li>
                  <li>Animatrice socio-culturelle</li>
                  <li>Ancienne éducatrice spécialisée pour Mineurs Non-Accompagnés</li>
                </ul>

                <p>
                  Lorette s’engage depuis la création de l’association pour
                  l’accessibilité des loisirs et spécifiquement de la pratique
                  musicale collective comme un outil d’émancipation et d’action
                  sociale.
                </p>

                <p>
                  Elle a travaillé en tant qu’animatrice et directrice dans des
                  accueils de loisirs sans hébergement ainsi que dans divers
                  séjours de vacances. Depuis 2019, elle spécialise ses
                  interventions auprès de publics mineurs isolés aux situations
                  sociales et administratives coercitives et précarisantes
                  (demandeurs d’asile, réfugiés, précarité économiques,
                  protection de l’enfance...).
                </p>
              </div>
            </div>

            {/* 2e coord (trou) */}
            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-4 bg-[#F5EEDA] text-[#6666C6]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-95">
                  Coordination
                </p>
                <h4 className="mt-1 font-display text-xl font-semibold">
                  À compléter
                </h4>
              </div>

              <div className="px-5 py-5 text-sm leading-6 text-slate-700 space-y-3">
                {/* TROU PHOTO */}
                <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-slate-500">
                    Placeholder photo
                  </div>
                </div>

                <p className="text-slate-600">
                  Ajoute ici la deuxième personne (nom, rôle, bullet points, bio).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
