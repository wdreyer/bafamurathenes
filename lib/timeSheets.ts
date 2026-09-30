/**
 * Sheets of the built-in training times, transcribed from the former PDF resources so they can be edited like any
 * other time. Admin edits (trainingTimes/{id}.sheetHtml) take precedence over these.
 */

type Summary = { objectives: string; skills: string; duration: string; material: string };

const summary = ({ objectives, skills, duration, material }: Summary) => `<h2>Fiche synthétique</h2>
<table><thead><tr><th>Rubrique</th><th>Contenu</th></tr></thead><tbody>
<tr><td>Objectifs</td><td>${objectives}</td></tr>
<tr><td>Compétences développées</td><td>${skills}</td></tr>
<tr><td>Durée</td><td>${duration}</td></tr>
<tr><td>Matériel / espace</td><td>${material}</td></tr>
</tbody></table>`;

const list = (items: string[]) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

export const builtInTimeSheets: Record<string, string> = {
  "violence-maltraitance": `<p><em>Écoute collective et réflexion autour d'un podcast.</em></p>
${summary({
  objectives: "Sensibiliser les stagiaires à la question de la maltraitance des enfants. Prendre conscience des différentes formes de violences possibles. Développer une posture professionnelle de vigilance, d'écoute et de protection. Découvrir des ressources concrètes pour agir et alerter.",
  skills: "Identifier des situations de maltraitance. Adopter une posture adaptée : écoute, recul, non-jugement, respect de son rôle. Connaître les ressources et dispositifs existants (119, cadre légal, rôle du directeur·ice). Être capable de débattre et d'échanger sur un sujet sensible avec recul et respect.",
  duration: "1h30 à 2h (écoute : 30–35 min + échanges et retours : 45–60 min).",
  material: "Salle calme et confortable (coussins, chaises, possibilité de s'allonger). Accès au podcast via ordinateur ou téléphone + enceinte. Feuilles et crayons pour dessiner pendant l'écoute. Document ressource imprimé (définitions, signes de maltraitance, comment agir). Vidéo 119 projetée ou envoyée aux stagiaires.",
})}
<h2>Déroulement détaillé</h2>
<h3>Introduction et mise en garde</h3>
<p>Le formateur présente le cadre et précise le caractère sensible du sujet. Il explique que les stagiaires peuvent quitter la salle s'ils se sentent mal à l'aise ou trop touchés. Il insiste sur l'importance d'avoir écouté le podcast en amont pour bien maîtriser les propos. Le ton doit être posé, neutre et respectueux, même si le contenu est militant.</p>
<h3>Écoute du podcast</h3>
<p>Le podcast est diffusé pendant environ 30 à 35 minutes. Les stagiaires s'installent comme ils le souhaitent : assis, allongés, en dessinant, les yeux fermés… L'idée est de se concentrer sur l'ouïe, sens rarement sollicité seul dans les temps pédagogiques.</p>
<h3>Retour et échanges</h3>
<p>Une fois l'écoute terminée, plusieurs modalités sont possibles selon l'énergie et la dynamique du groupe :</p>
${list(["<strong>Retour libre :</strong> un échange à chaud, chacun réagit spontanément.", "<strong>Discussion par groupes :</strong> les stagiaires discutent d'un thème précis lié au podcast, avant de partager en plénière."])}
<h3>Clôture</h3>
<p>Le formateur recentre la discussion sur les faits concrets : rappel des différentes formes de maltraitance (physiques, psychiques, sanitaires, affectives…), des signes d'alerte et des moyens d'agir. Le rôle des animateurs : écouter, noter, prévenir, signaler, mais ne pas surréagir ni se substituer aux professionnels compétents. Un document ressource est distribué et la vidéo du 119 est diffusée pour ancrer les savoirs.</p>
<h2>Variantes et améliorations</h2>
${list([
  "Adapter le temps de diffusion du podcast selon l'attention du groupe.",
  "Tester différentes méthodes de retour : cercle de parole, écriture libre, production collective (dessin, nuage de mots).",
  "Utiliser un autre support complémentaire (extrait vidéo, témoignage écrit).",
  "Organiser une mise en situation autour du rôle de l'animateur face à un enfant en souffrance.",
])}
<h2>Fiche réflexe – Maltraitance</h2>
<h3>Définition</h3>
<p><em>Un enfant maltraité est un enfant victime de violences physiques, d'abus sexuels, d'actes de cruauté mentale ou de négligences lourdes pouvant avoir des conséquences sur son développement physique et psychologique.</em></p>
<h3>Exemples de maltraitance</h3>
<table><thead><tr><th>Domaine</th><th>Exemples</th></tr></thead><tbody>
<tr><td>Alimentaire</td><td>Pas de dessert, « dépêche-toi, mange vite », « si tu ne manges pas tes épinards, tu n'auras pas d'amis ».</td></tr>
<tr><td>Sanitaire</td><td>Négligence de soins : « c'est rien, ça va passer », retarder un traitement, ignorer l'hygiène (brossage des dents, douche).</td></tr>
<tr><td>Affectif</td><td>Privation d'objets rassurants (« tant pis pour ton doudou »), refus d'affection, dénigrement des peurs (« le noir ça ne fait pas peur »).</td></tr>
<tr><td>Psychique</td><td>Humiliations publiques, moqueries, menaces, propos anxiogènes.</td></tr>
<tr><td>Physique</td><td>Gifles, tirages de bras, coups, secousses, cris, brûlures.</td></tr>
</tbody></table>
<h3>Signes d'alerte</h3>
${list(["Tristesse, repli, silence, pleurs fréquents.", "Désintérêt, décrochage, fatigue chronique.", "Hyperactivité, agressivité, vocabulaire provocateur.", "Dessins inquiétants.", "Hygiène négligée, vêtements sales, blessures non expliquées."])}
<h3>Comment agir ?</h3>
<ol><li><strong>Écouter</strong> l'enfant sans insister.</li><li><strong>Ne pas juger</strong> ni dramatiser.</li><li><strong>Prévenir</strong> l'enfant que ce sera signalé.</li><li><strong>Noter</strong> les propos ou observations factuelles.</li><li><strong>Transmettre</strong> à la direction (directeur·ice).</li><li><strong>Respecter son rôle</strong> : ne pas enquêter soi-même, mais alerter.</li></ol>
<p>Révéler une situation n'est <strong>jamais pire que le silence</strong>.</p>
<h2>Ressources utiles</h2>
${list(["Numéro d'urgence enfance en danger : <strong>119</strong>", "Vidéo pédagogique : 119 – Spot de sensibilisation"])}`,

  "gestion-conflits": `<p><em>Communication non violente (Marshall Rosenberg – Thomas d'Ansembourg).</em></p>
${summary({
  objectives: "Découvrir et expérimenter la Communication Non Violente. Développer des outils concrets pour exprimer ses besoins sans agressivité. Expérimenter l'écoute active et la reformulation avec le « petit pont de la communication ».",
  skills: "Identifier et exprimer ses sentiments. Clarifier et formuler ses besoins. Faire des demandes concrètes, négociables et respectueuses. Accueillir la parole de l'autre avec écoute active et reformulation. Développer des postures de médiation.",
  duration: "1h30 à 2h selon la taille du groupe.",
  material: "Salle calme, chaises disposées en binômes puis en cercle. Tableau ou paperboard pour présenter les 4 étapes de la CNV. Fiches rappel des étapes.",
})}
<h2>Déroulement détaillé</h2>
<h3>Introduction (15 min)</h3>
<p>Le formateur présente la CNV et ses fondateurs. Il expose les 4 étapes de la méthode <strong>OSBD</strong> :</p>
${list(["<strong>O – Observation</strong> : décrire les faits sans jugement.", "<strong>S – Sentiments</strong> : exprimer ses émotions face à la situation.", "<strong>B – Besoin</strong> : identifier le besoin sous-jacent.", "<strong>D – Demande</strong> : formuler une demande concrète, positive et réalisable."])}
<p>Un exemple simple illustre la différence entre jugement et observation, ou entre exigence et demande.</p>
<h3>Exercice 1 – La CNV en binômes (20 min)</h3>
<p>Par deux, chacun s'exerce à formuler une situation vécue en suivant OSBD. Le partenaire écoute, puis reformule pour vérifier qu'il a compris. On tourne les rôles.</p>
<h3>Exercice 2 – Le petit pont de la communication (30 min)</h3>
<ol><li><strong>Invitation :</strong> demander si le moment est propice pour parler.</li><li><strong>S'asseoir face à face :</strong> créer un cadre sécurisant.</li><li><strong>Monter sur le pont :</strong> s'ouvrir à la parole de l'autre.</li></ol>
${list(["A s'exprime de manière concise, en CNV.", "B répète en miroir : « Tu viens de me dire que… » et vérifie.", "A confirme ou reformule."])}
<p>Les stagiaires pratiquent en binômes puis deux volontaires rejouent une scène devant le groupe, suivie d'un temps d'analyse collective.</p>
<h3>Exercice 3 – Mises en situation (30 min)</h3>
<p>Le formateur propose des situations concrètes issues du vécu des stagiaires, pour appliquer CNV + petit pont et chercher une résolution apaisée.</p>
${list([
  "<strong>Situation 1 :</strong> Anim A a préparé son activité mais son matériel a disparu : Anim B l'a rangé car il avait besoin de la salle. Anim A exprime observation, sentiments, besoin et demande ; Anim B reformule et cherche un compromis.",
  "<strong>Situation 2 :</strong> temps calme, un enfant refuse de lire et déchire les pages du livre. L'animateur décrit sans jugement, exprime ses émotions, identifie son besoin et formule une demande adaptée à l'enfant.",
])}
<p>Analyse collective à la fin de chaque scène : ce qui a bien fonctionné, ce qui peut être amélioré.</p>
<h2>Variantes et améliorations</h2>
${list(["Adapter les situations aux problématiques réelles du groupe (conflits d'équipe, gestion de groupe, relations avec les familles).", "Proposer une restitution sous forme de sketch, avec humour, pour dédramatiser.", "Créer une affiche « mémo CNV » avec les 4 étapes OSBD."])}`,

  "autorite-sanction": `<p><em>Réparation éducative : différence entre punition et sanction, outil CAPTER.</em></p>
${summary({
  objectives: "Comprendre la notion de réparation éducative. Faire la différence entre punition et sanction. Expérimenter l'outil <strong>CAPTER</strong> pour construire des réparations adaptées. Développer une posture éducative respectueuse des enfants.",
  skills: "Savoir distinguer punition / sanction. Construire des réparations éducatives adaptées, proportionnées et temporaires. Expliquer clairement une décision éducative et vérifier qu'elle est comprise. Adopter une posture ferme mais non violente.",
  duration: "1h à 1h15.",
  material: "Salle en cercle. Paperboard / tableau pour écrire CAPTER et les exemples. Petits papiers ou cartes pour le temps ludique.",
})}
<h2>Déroulement détaillé</h2>
<h3>Introduction (10 min)</h3>
<p>La sanction fait partie de la mission éducative, mais elle doit toujours être <strong>réparatrice, jamais punitive</strong>. L'acronyme <strong>CAPTER</strong> définit les critères d'une réparation éducative :</p>
${list(["<strong>Ciblée</strong> : sur les personnes fautives, graduée selon la responsabilité de chacun.", "<strong>Adaptée</strong> : à l'âge et aux capacités des personnes.", "<strong>Proportionnelle</strong> : à la faute commise.", "<strong>Temporaire</strong> : limitée dans le temps.", "<strong>Éducative</strong> : permet de prendre conscience de sa faute.", "<strong>Rapport</strong> : en lien direct avec l'acte commis."])}
<p>La réparation doit être expliquée et comprise, et ne doit <strong>jamais</strong> prendre la forme de violence physique ou morale, d'humiliation, de privation des besoins fondamentaux ou d'une décision arbitraire.</p>
<h3>Exercice 1 – Punition vs sanction (15 min)</h3>
<p>Quelques exemples rapides (ex. un enfant casse volontairement un ballon) : le groupe dit si la réponse est une <strong>punition</strong> ou une <strong>réparation éducative</strong>.</p>
${list(["Punition : « Tu restes assis dans le couloir 30 minutes. »", "Réparation : « Tu aides à réparer / acheter un nouveau ballon. »"])}
<h3>Exercice 2 – Temps ludique (20 min)</h3>
<p>Les stagiaires tirent au sort des cartes avec des situations d'enfants. Par petits groupes, ils proposent une réparation éducative CAPTER et une punition (pour comparer), puis restituent et débattent.</p>
<h3>Exercice 3 – Mise en situation (15 min)</h3>
<p>Deux volontaires jouent une scène : l'animateur doit annoncer et expliquer une réparation éducative en respectant CAPTER. Le groupe analyse : est-ce clair, éducatif, adapté ?</p>
<h3>Clôture (10 min)</h3>
<p><strong>Punition :</strong> vise à faire souffrir, humilier ou exclure ; souvent arbitraire et inefficace. <strong>Réparation éducative :</strong> vise à faire prendre conscience, responsabiliser et restaurer le lien ; expliquée, comprise, construite dans une logique éducative.</p>
<h2>Variantes et améliorations</h2>
${list(["Jeu de rôle inversé : les stagiaires incarnent les enfants, le formateur joue l'animateur.", "Créer une affiche « mémo CAPTER » pour les salles d'animation.", "Construire une banque d'exemples de réparations adaptées aux situations courantes."])}
<h2>Fiche – Punition vs réparation éducative</h2>
<table><thead><tr><th>Punition</th><th>Réparation éducative (sanction)</th></tr></thead><tbody>
<tr><td>Vise à faire souffrir ou humilier. Peut être arbitraire. Souvent disproportionnée. Risque de casser le lien éducatif.</td><td>Vise à responsabiliser. Toujours en rapport avec l'acte. Adaptée à l'âge et à la gravité. Permet de restaurer le lien et d'accompagner l'enfant.</td></tr>
</tbody></table>
<h3>Ce que la réparation n'est pas</h3>
${list(["Une violence physique ou morale (cris, humiliations, stigmatisations).", "Une privation des besoins fondamentaux (manger, dormir, aller aux toilettes).", "Une sanction arbitraire sans preuve."])}`,

  choregraphie: `${summary({
  objectives: "Vivre une démarche de projet collective et ritualisée, développer l'expression corporelle et la transmission, expérimenter différentes méthodes de décision, et produire une création artistique commune valorisable en ACM.",
  skills: "Techniques (mémorisation, coordination, rythme), pédagogiques (enseigner, séquencer, transmettre), sociales (coopération, écoute, décision collective), créatives (imaginer, scénariser, créer visuellement), organisationnelles (gestion de projet, répartition des rôles).",
  duration: "Jour 1 : 30 à 45 min. Jours 2 à 6 : 30 min/jour. Jour 7 : 1h à 1h30. Total : environ 5h30 sur la semaine.",
  material: "Grande salle dégagée, enceinte + support musique. Pour le clip : téléphone / caméra, ordinateur ou tablette pour le montage, costumes, accessoires, décors, éclairage simple.",
})}
<h2>Déroulement détaillé</h2>
<h3>Jour 1 – Découverte et choix de la musique</h3>
<p>Présentation d'une chorégraphie simple par les formateur·ices, découpée en séquences. Après répétition collective, discussion pour choisir la musique du projet, en expérimentant différents modes de décision (vote, consensus, compromis).</p>
<h3>Jours 2 à 6 – Construction collective</h3>
<p>Chaque jour, un groupe de stagiaires conçoit et enseigne une séquence de 20–30 secondes, avec la même méthode : montrer, découper, répéter. La chorégraphie est rejouée en entier à chaque séance : un rituel quotidien et une progression collective.</p>
<h3>Jour 7 – Réalisation du clip</h3>
<p>Les stagiaires se répartissent en pôles (costumes, scénario, décor, régie, montage) pour préparer et filmer le clip. Après répétition générale, plusieurs prises sont réalisées puis montées pour la restitution finale.</p>
<h2>Variantes et améliorations</h2>
${list(["Ajouter la création de paroles ou un passage d'improvisation personnelle.", "Varier les modes de décision à chaque étape.", "Restitution en clip vidéo, captation en direct ou montage créatif avec making-of et interviews."])}`,

  imaginaire: `<p><em>Inventer, jouer, oser.</em></p>
${summary({
  objectives: "Stimuler l'imaginaire à partir du réel. Prendre confiance pour s'exprimer devant les autres. Dédramatiser la mise en scène et la prise de parole. Fédérer le groupe de façon ludique.",
  skills: "Créativité, expression de soi, être à l'aise devant un groupe, incarner des personnages, confiance en soi.",
  duration: "1h à 1h30 selon la taille du groupe.",
  material: "Petits accessoires du quotidien (passoire, lunettes de soleil, gant, boîte, chaussette, stylo lumineux…). Cartes actions ou experts. Espace dégagé et ambiance un peu stylée (lumière et/ou son d'ambiance).",
})}
<h2>Déroulement détaillé</h2>
<h3>Rituel d'entrée « Le passage magique » (5 min)</h3>
<p><strong>But :</strong> créer une ambiance différente du réel, symbolique, mais pas farfelue.</p>
${list(["Symboliser « la porte de la créativité ».", "Avant d'entrer : « On laisse notre journée derrière nous. Ce soir, on active notre imaginaire… »", "Chaque participant passe dessous et entre avec un geste, un son, une grimace… quelque chose qui lui appartient."])}
<h3>Brise-glace « Les gestes à la suite » (10 min)</h3>
<p><strong>But :</strong> détendre le groupe, favoriser l'observation, désamorcer la peur du ridicule. En cercle, chacun reproduit le geste du précédent et en ajoute un. Varier les rythmes.</p>
<h3>I. Jeu de groupe « Tableaux express » (10 min)</h3>
<p>En groupes, piocher une carte action et la représenter en image figée après 2 minutes de préparation. Les autres devinent la situation.</p>
<h3>II. « La réunion Tupperware » (10 min)</h3>
<p>Chacun pioche un objet insolite, lui invente une fonction ou un pouvoir et vient nous le vendre (1 minute de préparation). Ex. « Cette pince arrête le temps quand je la tourne trois fois. »</p>
<h3>III. Jeu absurde « Interview improbable » (10 min)</h3>
<p>Par deux : un journaliste, un invité expert sur un sujet absurde (cartes experts). Le journaliste pose 3 questions, l'invité répond sérieusement.</p>
<h3>IV. Impro guidée « 2 objets, 1 rencontre » (10 min)</h3>
<p>Chaque duo pioche 2 objets et joue 2-3 minutes une situation : tournage d'une pub pour un produit absurde, vide-grenier, deux voisins en conflit…</p>
<h3>Clôture « Rubis / Rubbish » (5 min)</h3>
<p>En cercle, chacun dit un rubis (ce qu'il garde) et un rubbish (ce qu'il jette dans la marmite), sans justification.</p>
<h2>Cartes experts</h2>
${list(["Spécialiste du langage des escargots.", "Inventeur·ice d'un oreiller qui parle.", "A vécu trois mois dans un frigo.", "A voyagé dans le temps, mais seulement 3 minutes.", "Premier humain à voler… uniquement en arrière.", "Dirige une entreprise de bulles carrées.", "Champion·ne du monde de sieste.", "Coach personnel pour poissons rouges stressés."])}
<h2>Cartes actions</h2>
${list(["La dernière seconde avant le début d'un spectacle.", "Une réunion urgente de super-héros.", "Des explorateurs découvrent une île.", "La visite guidée d'un musée.", "Une dispute dans une laverie.", "L'élection du nouveau roi.", "Une famille apprend qu'elle a gagné au loto.", "Une pluie de marshmallows s'abat sur le camping."])}`,

  "activite-interculturelle": `<p><em>Activité inter-équipe.</em></p>
${summary({
  objectives: "Mise en situation d'une collaboration entre des équipes d'animation de deux (ou plusieurs) structures différentes, dans le cadre d'un partenariat associatif (ex. échanges de jeunes européens).",
  skills: "Travail d'équipe, coordination d'un projet d'animation.",
  duration: "1h à 1h30 selon la taille du groupe.",
  material: "Matériel de prise de notes. Matériel léger (ballons, papeterie…). Grand espace ou plusieurs espaces pour le travail simultané des sous-groupes.",
})}
<h2>Déroulement détaillé</h2>
<h3>Introduction (20 min)</h3>
<ol><li><strong>Constat de départ (5 min) :</strong> lors d'un échange de jeunes, comment collaborer avec des équipes aux fonctionnements (structuration, valeurs) différents ?</li><li><strong>Les « 4 fers » (5 min) :</strong> Faire, Faire faire, Faire avec.</li></ol>
${list(["<strong>Faire :</strong> répartition de la menée des temps d'animation par groupe.", "<strong>Faire faire :</strong> un groupe A organise l'animation et donne des tâches à un groupe B.", "<strong>Faire avec :</strong> création du temps conjointement entre A et B."])}
<p>Discussion sur les avantages et inconvénients de chaque méthode (10 min).</p>
<h3>Préparation des animations (25 min)</h3>
<p>4 groupes (A, B, C, D) préparent une activité en 15 min, puis la transmettent en 10 min à une deuxième équipe. A et B transmettent en « faire faire » (consignes claires) ; C et D en « faire avec » (co-élaboration).</p>
<table><thead><tr><th>Équipe qui prépare</th><th>Transmission</th><th>Équipe qui reçoit</th><th>Équipes animées</th></tr></thead><tbody>
<tr><td>Équipe A</td><td>Faire faire</td><td>Équipe C</td><td>B et D</td></tr>
<tr><td>Équipe B</td><td>Faire faire</td><td>Équipe D</td><td>A et C</td></tr>
<tr><td>Équipe C</td><td>Faire avec</td><td>Équipe A</td><td>B et D</td></tr>
<tr><td>Équipe D</td><td>Faire avec</td><td>Équipe B</td><td>A et C</td></tr>
</tbody></table>
<h3>Présentation des animations (20 min)</h3>
<p>Chaque animation dure 5 minutes : une fois les consignes données et le jeu lancé, on passe à la suivante.</p>
<h3>Débrief (10 min)</h3>
<p>Avantages et inconvénients des deux méthodes ? Quels éléments facilitent leur mise en place ? Quels points de vigilance ?</p>`,

  "activites-multilingues": `<p><em>Expérimenter la communication au-delà de la langue.</em></p>
${summary({
  objectives: "Expérimenter la communication sans langue commune. Développer l'interculturalité et la compréhension non verbale. Stimuler la créativité dans la conception et l'animation d'activités. Favoriser l'empathie et l'adaptation à des publics variés.",
  skills: "Créer et transmettre une activité compréhensible par tous. Utiliser le langage corporel, les gestes, les supports visuels et les démonstrations. Développer l'écoute, l'ouverture culturelle et la coopération.",
  duration: "1h30 à 2h (préparation + mise en pratique + analyse collective).",
  material: "Salle modulable avec espace libre. Papier, crayons, matériel simple selon l'imagination des stagiaires.",
})}
<h2>Déroulement détaillé</h2>
<h3>Introduction (10 min)</h3>
<p>Comment mener une activité avec un groupe qui ne parle pas la même langue ? Importance des <strong>gestes, visuels, démonstrations</strong>, du ton et du regard. L'objectif est aussi <strong>interculturel</strong> : se mettre à la place de l'autre. Le ou la formateur·ice fait un exemple de 5 minutes.</p>
<h3>Exercice 1 – Préparation en petits groupes (20 à 30 min)</h3>
${list(["Groupes de 3 à 5 : imaginer une activité courte (15–20 min) accessible à tous.", "Consignes données avec au moins un autre support que l'oral.", "Activité ludique (jeu, danse, sport, atelier créatif simple), matériel simple."])}
<h3>Exercice 2 – Mise en pratique (40 à 50 min)</h3>
<p>Chaque groupe anime son activité ; les autres jouent des participants « qui ne comprennent pas la langue ». Le formateur observe : les consignes sont-elles claires sans explication verbale ?</p>
<h3>Exercice 3 – Retour collectif et analyse (20 à 30 min)</h3>
${list(["Qu'est-ce qui a permis de comprendre ?", "Qu'est-ce qui a été un obstacle ?", "Comment améliorer la clarté sans passer par la langue ?"])}
<h2>Variantes et améliorations</h2>
${list(["<strong>Tour du monde des langues :</strong> intégrer un mot-clé dans une langue étrangère et le faire comprendre par le contexte.", "<strong>Mime géant :</strong> toute l'activité est animée en mime collectif.", "<strong>Créativité artistique :</strong> un chant, une danse ou une petite scène accessible à tous.", "<strong>Échange culturel :</strong> chacun intègre un geste ou un mot de sa propre culture."])}`,

  transports: `<p><em>Bus, train, avion, minibus.</em></p>
${summary({
  objectives: "Former les stagiaires à l'organisation et à la sécurité des déplacements collectifs. Savoir anticiper et gérer les transports selon différents moyens. Développer des réflexes de vigilance et de responsabilité.",
  skills: "Préparer une checklist transport adaptée. Gérer un groupe en déplacement. Anticiper les imprévus (retards, annulations, pertes). Connaître les rôles de l'animateur·rice pendant un transport.",
  duration: "1h.",
  material: "Salle avec espace pour mises en situation. Paperboard pour lister les points clés. Copies de checklists type.",
})}
<h2>Déroulement détaillé</h2>
<h3>Introduction (10 min)</h3>
<p>Les transports sont un moment sensible en séjour : anticipation, organisation et vigilance constante pour assurer la sécurité, la fluidité et le bien-être des enfants.</p>
<h3>Exercice 1 – Les différents moyens de transport (10 min)</h3>
${list(["<strong>Bus :</strong> montée/descente sécurisée, points de rassemblement, pauses, gestion du chauffeur.", "<strong>Train :</strong> billets, placement dans les wagons, risques d'égarement sur les quais.", "<strong>Avion :</strong> bagages, contrôles, formalités, temps d'attente.", "<strong>Minibus :</strong> sécurité routière, ceintures, fatigue du conducteur."])}
<h3>Exercice 2 – La checklist transport (10 min)</h3>
<p>En sous-groupes, construire une <strong>checklist type par moyen de transport</strong>, puis mise en commun pour une checklist finale distribuée à tous.</p>
<h3>Exercice 3 – Mise en situation (30 min)</h3>
${list(["« Un enfant se perd en gare. »", "« Un bagage est oublié dans le bus. »", "« Le vol est retardé de 3h. »", "« Le minibus tombe en panne sur l'autoroute. »"])}
<p>Deux stagiaires jouent les animateurs, les autres les enfants ; on analyse les réflexes adoptés.</p>
<h3>Clôture (10 min)</h3>
${list(["La préparation en amont (checklist).", "La vigilance sur place (surveillance, points de rassemblement).", "Rester calme et rassurant en cas d'imprévu.", "Une responsabilité partagée par toute l'équipe."])}
<h2>Variantes et améliorations</h2>
${list(["Organiser une sortie réelle courte en transport urbain.", "Créer une fiche « chef de convoi ».", "Ajouter une dimension interculturelle (groupe en avion avec contrôles internationaux)."])}`,

  "budget-repas": `<p><em>Jeu éducatif fil rouge – toute la semaine.</em></p>
${summary({
  objectives: "Organiser et gérer des repas collectifs dans le respect d'un budget. Construire une liste de courses cohérente et équilibrée. Répartir les tâches en équipe. Expérimenter concrètement la gestion d'un repas et pouvoir le transposer avec des enfants.",
  skills: "Gestion budgétaire. Menus équilibrés. Organisation collective et répartition des rôles. Liste de courses. Animation de repas. Adaptation aux imprévus.",
  duration: "Fil rouge : préparation initiale (1h30) + gestion d'un repas par jour + bilan final.",
  material: "Tables en sous-groupes. Calculatrices, faux budget. Tableaux nutritionnels / pyramide alimentaire. Fiches réflexe repas. Accès à la cuisine.",
})}
<h2>Déroulement détaillé</h2>
<h3>Introduction (10 min)</h3>
<p>Chaque jour, un groupe de stagiaires est responsable d'un repas : préparation, budget, service, animation.</p>
<h3>Exercice 1 – Groupes et planning (20 min)</h3>
${list(["Équipes de 3 à 5.", "Planning : chaque groupe sait quel jour et quel repas il gère.", "Chaque équipe reçoit un budget et les fiches réflexe repas."])}
<h3>Exercice 2 – Préparation initiale (45 min)</h3>
${list(["Planifier les menus.", "Établir la liste de courses.", "Répartir les rôles (cuisine, logistique, animation).", "Vérifier l'équilibre alimentaire et le budget."])}
<h3>Exercice 3 – Mise en pratique quotidienne</h3>
<p>Chaque jour, un groupe gère un repas (courses, préparation, service, animation), puis retour collectif : équilibre, organisation, ambiance, budget.</p>
<h3>Exercice 4 – Bilan final (30 min)</h3>
${list(["Quelles compétences avons-nous développées ?", "Quelles difficultés rencontrées ?", "Comment accompagner des enfants dans ce type d'exercice ?"])}
<h2>Variantes et améliorations</h2>
${list(["Ajouter des contraintes (budget réduit, allergies, imprévus).", "Créer un concours de repas (équilibre, budget, animation).", "Introduire une dimension écologique (circuit court, bio, déchets)."])}
<h2>Fiche – Organisation d'un repas</h2>
<table><thead><tr><th>Rubrique</th><th>À remplir par le groupe responsable</th></tr></thead><tbody>
<tr><td>Menu</td><td>Entrée : … / Plat : … / Accompagnement : … / Dessert : …</td></tr>
<tr><td>Liste des courses</td><td>… — Budget estimé : … € — Budget respecté ? oui / non</td></tr>
<tr><td>Équilibre</td><td>Protéines · Légumes · Féculents · Fruits</td></tr>
<tr><td>Rôles</td><td>Cuisine : … / Logistique : … / Animation : …</td></tr>
<tr><td>Animation prévue</td><td>…</td></tr>
</tbody></table>`,
};
