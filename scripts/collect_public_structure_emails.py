#!/usr/bin/env python3
"""
Build a CSV of public, generic organization emails for youth, sport, leisure,
social/ASE-adjacent, and associative structures in Cantal, Correze and
Puy-de-Dome.

The script deliberately excludes schools and personal-looking addresses.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import re
from dataclasses import dataclass
from email.utils import parseaddr
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qs, quote_plus, unquote, urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser


DEPARTMENTS = {
    "cantal": ["Cantal", "Aurillac", "Saint-Flour", "Mauriac"],
    "correze": ["Correze", "Tulle", "Brive", "Ussel"],
    "puy-de-dome": ["Puy-de-Dome", "Clermont-Ferrand", "Issoire", "Riom", "Thiers"],
    "allier": ["Allier", "Moulins", "Montlucon", "Vichy"],
    "haute-loire": ["Haute-Loire", "Le Puy-en-Velay", "Brioude", "Yssingeaux"],
    "creuse": ["Creuse", "Gueret", "Aubusson", "La Souterraine"],
    "haute-vienne": ["Haute-Vienne", "Limoges", "Saint-Junien", "Bellac"],
    "lot": ["Lot", "Cahors", "Figeac", "Gourdon"],
    "aveyron": ["Aveyron", "Rodez", "Millau", "Villefranche-de-Rouergue"],
    "lozere": ["Lozere", "Mende", "Marvejols"],
    "dordogne": ["Dordogne", "Perigueux", "Bergerac"],
    "loire": ["Loire", "Saint-Etienne", "Roanne"],
    "rhone": ["Rhone", "Lyon", "Villefranche-sur-Saone"],
}

DEPARTMENT_CODES = {
    "cantal": "15",
    "correze": "19",
    "puy-de-dome": "63",
    "allier": "03",
    "haute-loire": "43",
    "creuse": "23",
    "haute-vienne": "87",
    "lot": "46",
    "aveyron": "12",
    "lozere": "48",
    "dordogne": "24",
    "loire": "42",
    "rhone": "69",
}

CATEGORIES = [
    "MJC",
    "centre social",
    "espace jeunes",
    "service jeunesse",
    "club sportif",
    "association sportive",
    "mission locale",
    "foyer jeunes travailleurs",
    "maison des adolescents",
    "MECS",
    "protection enfance",
    "ASE",
    "accueil collectif mineurs",
    "centre de loisirs",
    "accueil de loisirs",
    "ALSH",
    "periscolaire",
    "association jeunesse",
    "vie associative",
    "Guid'Asso",
    "SDJES",
    "CDOS",
    "CSE",
    "comite social economique",
    "organisation professionnelle",
    "chambre commerce industrie",
    "CPME",
    "association parents eleves",
    "FCPE",
    "PEEP",
]

GENERIC_LOCAL_TOKENS = {
    "accueil",
    "admin",
    "administration",
    "affiliation",
    "alsh",
    "animation",
    "ape",
    "asso",
    "association",
    "bafa",
    "bureau",
    "cdos",
    "cej",
    "centre",
    "club",
    "communication",
    "contact",
    "cpme",
    "cse",
    "direction",
    "dg",
    "education",
    "enfance",
    "fal",
    "famillesrurales",
    "fcpe",
    "foyer",
    "formation",
    "guichetuniquejeunesse",
    "info",
    "infos",
    "inscription",
    "interveduc",
    "jeunesse",
    "lief",
    "loisirs",
    "mecs",
    "mission",
    "mjc",
    "omjs",
    "parentsdeleves",
    "peep",
    "perisco",
    "periscolaire",
    "responsablealsh",
    "secretariat",
    "service",
    "sdjes",
    "sgen",
    "snalc",
    "snes",
    "snfolc",
    "social",
    "sport",
    "sports",
    "ufolep",
    "usep",
    "vieassociative",
}

PERSONAL_DOMAINS = {
    "gmail.com",
    "hotmail.fr",
    "hotmail.com",
    "icloud.com",
    "laposte.net",
    "orange.fr",
    "outlook.fr",
    "outlook.com",
    "sfr.fr",
    "wanadoo.fr",
    "yahoo.fr",
}

BLOCKED_QUERY_TERMS = {
    "mere",
    "pere",
    "famille",
    "enfant 16",
    "enfant 17",
    "enfant 18",
}

EMAIL_RE = re.compile(r"(?i)\b[A-Z0-9._%+\-]+(?:\s*\[at\]\s*|\s*@\s*|&#64;)[A-Z0-9.\-]+(?:\s*\[dot\]\s*|\s*\.\s*)[A-Z]{2,}\b")
HREF_RE = re.compile(r'(?is)<a[^>]+href=["\']([^"\']+)["\']')
TITLE_RE = re.compile(r"(?is)<title[^>]*>(.*?)</title>")
USER_AGENT = "BAFA-public-structure-contact-research/1.1 (+public generic organization emails only)"


MANUAL_PUBLIC_CONTACTS = [
    ("accueil@csalacroiseedesautres.fr", "cantal", "centre social", "https://www.cantal.gouv.fr/index.php/Action-de-l-Etat/Jeunesse.-Sports-Vie-associative/Vie-associative/Le-FDVA/Contacts-Guid-Asso-SDEJS-15", "Contacts Guid'Asso et SDEJS 15"),
    ("omjsstflour@gmail.com", "cantal", "office municipal jeunesse sports", "https://www.cantal.gouv.fr/index.php/Action-de-l-Etat/Jeunesse.-Sports-Vie-associative/Vie-associative/Le-FDVA/Contacts-Guid-Asso-SDEJS-15", "Contacts Guid'Asso et SDEJS 15"),
    ("directioncentresocial@asljmauriac.com", "cantal", "centre social jeunesse loisirs", "https://www.cantal.gouv.fr/index.php/Action-de-l-Etat/Jeunesse.-Sports-Vie-associative/Vie-associative/Le-FDVA/Contacts-Guid-Asso-SDEJS-15", "Contacts Guid'Asso et SDEJS 15"),
    ("centre.social.vallee.authre@csiva.fr", "cantal", "centre social", "https://www.cantal.gouv.fr/index.php/Action-de-l-Etat/Jeunesse.-Sports-Vie-associative/Vie-associative/Le-FDVA/Contacts-Guid-Asso-SDEJS-15", "Contacts Guid'Asso et SDEJS 15"),
    ("direction@fal15.org", "cantal", "vie associative education populaire", "https://www.cantal.gouv.fr/index.php/Action-de-l-Etat/Jeunesse.-Sports-Vie-associative/Vie-associative/Le-FDVA/Contacts-Guid-Asso-SDEJS-15", "Contacts Guid'Asso et SDEJS 15"),
    ("famillesrurales.cantal@gmail.com", "cantal", "vie associative familles rurales", "https://www.cantal.gouv.fr/index.php/Action-de-l-Etat/Jeunesse.-Sports-Vie-associative/Vie-associative/Le-FDVA/Contacts-Guid-Asso-SDEJS-15", "Contacts Guid'Asso et SDEJS 15"),
    ("sdjes15.vieassociative@ac-clermont.fr", "cantal", "SDJES vie associative", "https://www.cantal.gouv.fr/index.php/Action-de-l-Etat/Jeunesse.-Sports-Vie-associative/Vie-associative/Le-FDVA/Contacts-Guid-Asso-SDEJS-15", "Contacts Guid'Asso et SDEJS 15"),
    ("guichetuniquejeunesse@cantal.fr", "cantal", "structure jeunesse", "https://www.cantal.fr/vivre-dans-le-cantal/grandir-et-apprendre/jeunesse/", "Jeunesse - Cantal"),
    ("cdos.cantal@wanadoo.fr", "cantal", "CDOS sport", "https://www.associations.gouv.fr/comite-departemental-olympique-et-sportif-du-cantal.html", "CDOS Cantal"),
    ("murmurnature15.asso@gmail.com", "cantal", "club sportif", "https://www.ffme.fr/club/3102/", "Mur-Mur Nature Cantal"),
    ("comitecantalasptt@gmail.com", "cantal", "club sportif", "https://cdos-cantal.fr/les-comites/", "Les comites - CDOS Cantal"),
    ("aurillac@asptt.com", "cantal", "club sportif", "https://cdos-cantal.fr/les-comites/", "Les comites - CDOS Cantal"),
    ("cvad.asso@gmail.com", "cantal", "club sportif loisirs", "https://cdos-cantal.fr/les-comites/", "Les comites - CDOS Cantal"),
    ("cd.athle15@gmail.com", "cantal", "club sportif", "https://cdos-cantal.fr/les-comites/", "Les comites - CDOS Cantal"),
    ("autoclub@sfr.fr", "cantal", "club sportif", "https://www.aurillac.fr/associations/annuaire/auto-club-du-cantal/", "Auto Club du Cantal"),
    ("contact@la-cantalienne.fr", "cantal", "club sportif", "https://www.la-cantalienne.fr/", "La Cantalienne"),
    ("enfanceetchansons@orange.fr", "cantal", "association jeunesse culture", "https://www.aurillac.fr/associations/annuaire/enfance-et-chansons/", "Enfance et Chansons - Aurillac"),
    ("aurillac-cantal@clcv.org", "cantal", "association consommateurs usagers", "https://www.aurillac.fr/associations/annuaire/clcv-aurillac-cantal/", "CLCV Aurillac-Cantal"),
    ("uiha@orange.fr", "cantal", "association culturelle", "https://www.aurillac.fr/associations/annuaire/uiha-aurillac/", "Universite Inter Age de Haute Auvergne"),
    ("info@cpmecantal.fr", "cantal", "organisation professionnelle CSE entreprises", "https://www.cpmecantal.fr/contact/", "CPME Cantal"),
    ("asso.baara@gmail.com", "cantal", "association culturelle jeunesse", "https://www.aurillac.fr/associations/annuaire/association-baara/", "Association Baara"),
    ("acceuil@cantal.cci.fr", "cantal", "chambre commerce industrie", "https://lannuaire.service-public.gouv.fr/auvergne-rhone-alpes/cantal/1b31a8ac-bd84-437c-bb7b-3402fb997bdf", "CCI 15 Cantal - Service Public"),
    ("dg@cantal.cci.fr", "cantal", "chambre commerce industrie", "https://www.allbiz.fr/chambre-de-commerce-daurillac-et-du_1c-04-71-45-40-40", "Chambre de Commerce d'Aurillac et du Cantal"),
    ("bc.aurillac@gmail.com", "cantal", "association loisirs", "https://www.aurillac.fr/associations/annuaire/aurillac-bridge-club/", "Aurillac Bridge Club"),
    ("chorale.multiphonie@cantalpassion.com", "cantal", "association culturelle", "https://www.aurillac.fr/associations/annuaire/chorale-multiphonie-2/", "Chorale Multiphonie"),
    ("contact@ieo-cantal.com", "cantal", "association culturelle education populaire", "https://www.aurillac.fr/wp-content/uploads/2020/12/IEO-du-Cantal-ques-aquo.pdf", "IEO du Cantal"),
    ("ada15.contact@gmail.com", "cantal", "association accessibilite culture", "https://www.culture.cantal.fr/images/portail/Reseau_culturel/V3web_Accessibilite_de_la_culture.pdf", "Reseau culturel Cantal"),
    ("vacances@fal15.org", "cantal", "vie associative education populaire", "https://www.associations.gouv.fr/federation-des-associations-laique-du-cantal.html", "Federation des associations laiques du Cantal"),
    ("cidff.15@orange.fr", "cantal", "association droits familles insertion", "https://lannuaire.service-public.gouv.fr/auvergne-rhone-alpes/cantal/cidf-15014-01", "CIDFF Cantal"),
    ("contact@cantadear.fr", "cantal", "association agriculture paysanne", "https://www.leguidepratique.com/guide/aurillac/cadre-de-vie/environnement-associations/adear-cantal", "ADEAR Cantal"),
    ("pref-sp-mauriac-associations@cantal.gouv.fr", "cantal", "greffe associations", "https://lannuaire.service-public.fr/auvergne-rhone-alpes/cantal/ccbbe095-108c-4012-aed1-d45c512aa3f9/avertissement-demande-de-mise-a-jour", "Greffe des associations Cantal Mauriac"),
    ("courrier@aurillac.com", "cantal", "office tourisme syndicat initiative", "https://www.tourisme-france.info/annuaire-des-offices-du-tourisme-et-syndicats-dinitiative-du-cantal.html", "Office de tourisme Aurillac"),
    ("contact@champs-marchal.org", "cantal", "office tourisme syndicat initiative", "https://www.tourisme-france.info/annuaire-des-offices-du-tourisme-et-syndicats-dinitiative-du-cantal.html", "Office de tourisme Champs-sur-Tarentaine-Marchal"),
    ("otchataigneraie@chataigneraie-cantal.com", "cantal", "office tourisme syndicat initiative", "https://www.tourisme-france.info/annuaire-des-offices-du-tourisme-et-syndicats-dinitiative-du-cantal.html", "Office de tourisme Chataigneraie Cantalienne"),
    ("ot.lelioran@wanadoo.fr", "cantal", "office tourisme syndicat initiative", "https://www.tourisme-france.info/annuaire-des-offices-du-tourisme-et-syndicats-dinitiative-du-cantal.html", "Office de tourisme Le Lioran"),
    ("associationintermediairemauriac3@wanadoo.fr", "cantal", "structure insertion SIAE", "https://auvergne-rhone-alpes.dreets.gouv.fr/sites/auvergne-rhone-alpes.dreets.gouv.fr/IMG/pdf/annuaire_des_siae_cantal.pdf", "Annuaire des SIAE Cantal"),
    ("direction@anef15.fr", "cantal", "association sociale justice insertion", "https://www.anjap.org/IMG/pdf/repertoire_pe_-_federation_citoyens_et_justice_-_2022.pdf", "ANEF Cantal"),
    ("chanteclair-mecs@itinova.org", "cantal", "MECS protection enfance ASE", "https://itinova.org/etablissements/mecs-chanteclair/", "MECS Chanteclair - Itinova"),
    ("secretariat@mda15.fr", "cantal", "maison des adolescents protection enfance", "https://www.leguidepratique.com/guide/aurillac/enfance-et-jeunesse/accueil-des-jeunes/maison-des-ados-du-cantal", "Maison des Ados du Cantal"),
    ("accueilmda@cantal.fr", "cantal", "maison departementale autonomie solidarite", "https://www.cantal.fr/coordonnees-des-services/", "Coordonnees des services - Cantal"),
    ("contact@anmecs.fr", "cantal", "MECS reseau national protection enfance", "https://www.anmecs.fr/", "ANMECS"),
    ("s3cle@snes.edu", "cantal", "syndicat education second degre", "https://fsu15.fsu.fr/syndicats-fsu/", "Les syndicats de la FSU dans le Cantal"),
    ("clermont-ferrand@sgen.cfdt.fr", "cantal", "syndicat education", "https://auvergne.sgen-cfdt.fr/nous-contacter/", "Sgen-CFDT Auvergne"),
    ("clermont-ferrand@efrp.cfdt.fr", "cantal", "syndicat education", "https://www.sgen-cfdt.fr/nous-contacter-sgen-cfdt/", "CFDT Education Formation Recherche Publiques Auvergne"),
    ("clermont@snalc.fr", "cantal", "syndicat lycees colleges", "https://snalc-clermont.fr/contact/", "SNALC Clermont-Ferrand"),
    ("snfolc63@gmail.com", "cantal", "syndicat lycees colleges", "https://snfolc63.fr/nos-coordonnees/", "SNFOLC Clermont-Ferrand"),
    ("lycees@snes.edu", "cantal", "syndicat lycees national", "https://www.snes.edu/article/contact-lycees-snes-edu/", "SNES-FSU lycees"),
    ("fcpe.cantal@gmail.com", "cantal", "association parents eleves", "https://georges-brassens-ydes.ent.auvergnerhonealpes.fr/lectureFichiergw.do?ID_FICHIER=12044", "FCPE Cantal"),
    ("fcpe@fcpe.asso.fr", "cantal", "federation parents eleves", "https://www.fcpe.asso.fr/pres-chez-vous", "FCPE nationale"),
    ("correze@franceolympique.com", "correze", "CDOS sport", "https://correze.franceolympique.com/mentions-legales/", "Mentions legales - CDOS 19"),
    ("ce.sdjes19@ac-limoges.fr", "correze", "SDJES jeunesse sports", "https://www.sport-handicap-n-aquitaine.org/pages/correze", "Sport & Handicap Nouvelle-Aquitaine - Correze"),
    ("cdsasecretariat@gmx.fr", "correze", "club sportif handicap", "https://www.sport-handicap-n-aquitaine.org/pages/correze", "Sport & Handicap Nouvelle-Aquitaine - Correze"),
    ("cd19@handisport.org", "correze", "club sportif handicap", "https://www.sport-handicap-n-aquitaine.org/pages/correze", "Sport & Handicap Nouvelle-Aquitaine - Correze"),
    ("contact@correze-sports-animations.fr", "correze", "sports loisirs", "https://www.tourismecorreze.com/fr/tourisme_detail/base_de_loisirs_les_aubaredes.html", "Base de loisirs Les Aubaredes"),
    ("maison.ados@pep19.org", "correze", "maison des adolescents protection enfance", "https://cerjep.fr/les-maisons-des-adolescents-mda/", "MDA de la Correze"),
    ("s2-19@limoges.snes.edu", "correze", "syndicat education second degre", "https://www.limoges.snes.edu/SNES-FSU-Correze.html", "SNES-FSU Correze"),
    ("snalc.limousin@gmail.com", "correze", "syndicat lycees colleges", "https://snalc-lyon.fr/wp-content/uploads/sites/3/2022/02/QU1462BIS.pdf", "SNALC Limousin"),
    ("cgt.educaction.limousin@gmail.com", "correze", "syndicat education", "https://ancien.cgteduc.fr/images/mouvements/mvt_2018/coordonnes_academiques.pdf", "CGT Educ'action Limoges"),
    ("ud19@cgt.fr", "correze", "syndicat interprofessionnel", "https://www.cgt-na.fr/nous-contacter/", "CGT Nouvelle-Aquitaine - Correze"),
    ("lycees@snes.edu", "correze", "syndicat lycees national", "https://www.snes.edu/article/contact-lycees-snes-edu/", "SNES-FSU lycees"),
    ("fcpe.cdpe19@sfr.fr", "correze", "association parents eleves", "https://www.leguidepratique.com/guide/haute-correze/education-enseignement/parents-d-eleves/fcpe", "FCPE Correze"),
    ("fcpe@fcpe.asso.fr", "correze", "federation parents eleves", "https://www.fcpe.asso.fr/pres-chez-vous", "FCPE nationale"),
    ("cdos63@wanadoo.fr", "puy-de-dome", "CDOS sport", "https://www.allbiz.fr/comit%C3%A9-d%C3%A9partemental-olympique-et_27j-04-73-14-09-61", "CDOS Puy-de-Dome"),
    ("cdos.communication63@orange.fr", "puy-de-dome", "CDOS sport", "https://www.allbiz.fr/comit%C3%A9-d%C3%A9partemental-olympique-et_27j-04-73-14-09-61", "CDOS Puy-de-Dome"),
    ("mission.clara@cres-auvergne.org", "puy-de-dome", "vie associative sport", "https://www.associations.gouv.fr/comite-departemental-olympique-et-sportif-du-puy-de-dome.html", "CDOS Puy-de-Dome - Associations.gouv.fr"),
    ("cdos63.animation@orange.fr", "puy-de-dome", "CDOS sport animation", "https://www.associations.gouv.fr/comite-departemental-olympique-et-sportif-du-puy-de-dome.html", "CDOS Puy-de-Dome - Associations.gouv.fr"),
    ("direction@fal63.org", "puy-de-dome", "vie associative education populaire", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("lief@fal63.org", "puy-de-dome", "loisirs interventions educatives", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("cej@fal63.org", "puy-de-dome", "culture education jeunesse", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("communication@fal63.org", "puy-de-dome", "vie associative juniors associations", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("affiliation@fal63.org", "puy-de-dome", "vie associative", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("classes@fal63.org", "puy-de-dome", "sejours loisirs", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("numeducPDN@fal63.org", "puy-de-dome", "promeneurs du net jeunesse", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("sejours@fal63.org", "puy-de-dome", "sejours educatifs", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("interveduc@fal63.org", "puy-de-dome", "BAFA interventions educatives", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("scivique@fal63.org", "puy-de-dome", "service civique jeunesse", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("lireetfairelire@fal63.org", "puy-de-dome", "vie associative education populaire", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("mediationculturelle@fal63.org", "puy-de-dome", "mediation culturelle jeunesse", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("formation@fal63.org", "puy-de-dome", "formation jeunesse animation", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("usep63@fal63.org", "puy-de-dome", "sport education populaire", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("accueil@ufolep63.org", "puy-de-dome", "sport education populaire", "https://fal63.org/nous-contacter/", "Ligue de l'enseignement du Puy-de-Dome"),
    ("contact@e2c-puydedome.fr", "puy-de-dome", "structure jeunesse insertion", "https://www.e2c-puydedome.fr/contact/", "E2C Puy-de-Dome"),
    ("alshdethuret@orange.fr", "puy-de-dome", "ALSH periscolaire", "https://www.thuret.fr/le-centre-de-loisirs/", "Accueil de loisirs - Thuret"),
    ("alsh-thuret@plainelimagne.fr", "puy-de-dome", "ALSH centre de loisirs", "https://www.thuret.fr/le-centre-de-loisirs/", "Accueil de loisirs - Thuret"),
    ("responsablealsh@sayat.fr", "puy-de-dome", "ALSH jeunesse", "https://www.sayat.fr/enfance-et-jeunesse/accueil-de-loisirs-3-18-ans/", "Accueil de loisirs - Sayat"),
    ("serviceenfance@sayat.fr", "puy-de-dome", "periscolaire enfance jeunesse", "https://www.sayat.fr/enfance-et-jeunesse/accueil-de-loisirs-3-18-ans/", "Accueil de loisirs - Sayat"),
    ("alsh@afr63.fr", "puy-de-dome", "ALSH centre de loisirs", "https://pontaumur.fr/centre-de-loisirs-garderie/", "Centre de loisirs - Pontaumur"),
    ("alsh.pontaumur@ccvcommunaute.fr", "puy-de-dome", "ALSH centre de loisirs", "https://pontaumur.fr/centre-de-loisirs-garderie/", "Centre de loisirs - Pontaumur"),
    ("contact@basket63.com", "puy-de-dome", "club sportif", "https://puydedome.franceolympique.com/comites.php", "CDOS Puy-de-Dome - comites"),
    ("cbd63@wanadoo.fr", "puy-de-dome", "club sportif", "https://puydedome.franceolympique.com/comites.php", "CDOS Puy-de-Dome - comites"),
    ("cd63.athle@gmail.com", "puy-de-dome", "club sportif", "https://puydedome.franceolympique.com/comites.php", "CDOS Puy-de-Dome - comites"),
    ("s3cle@snes.edu", "puy-de-dome", "syndicat education second degre", "https://clermont.snes.edu/IMG/pdf/bulletin_no_199_compresse.pdf", "SNES-FSU Clermont-Ferrand"),
    ("clermont-ferrand@sgen.cfdt.fr", "puy-de-dome", "syndicat education", "https://auvergne.sgen-cfdt.fr/nous-contacter/", "Sgen-CFDT Auvergne"),
    ("clermont-ferrand@efrp.cfdt.fr", "puy-de-dome", "syndicat education", "https://www.sgen-cfdt.fr/nous-contacter-sgen-cfdt/", "CFDT Education Formation Recherche Publiques Auvergne"),
    ("clermont@snalc.fr", "puy-de-dome", "syndicat lycees colleges", "https://snalc-clermont.fr/contact/", "SNALC Clermont-Ferrand"),
    ("snfolc63@gmail.com", "puy-de-dome", "syndicat lycees colleges", "https://snfolc63.fr/nos-coordonnees/", "SNFOLC 63"),
    ("snu63@snuipp.fr", "puy-de-dome", "syndicat education FSU", "https://e-mouvement.snuipp.fr/63/contact", "FSU-SNUipp Puy-de-Dome"),
    ("lycees@snes.edu", "puy-de-dome", "syndicat lycees national", "https://www.snes.edu/article/contact-lycees-snes-edu/", "SNES-FSU lycees"),
    ("fcpe63@orange.fr", "puy-de-dome", "association parents eleves", "https://associations.clermont-ferrand.fr/association/conseil-departemental-des-parents-deleves-du-puy-de-dome-1", "FCPE Puy-de-Dome"),
    ("fcpe@fcpe.asso.fr", "puy-de-dome", "federation parents eleves", "https://www.fcpe.asso.fr/pres-chez-vous", "FCPE nationale"),
    ("peep.63@wanadoo.fr", "puy-de-dome", "association parents eleves", "https://www.allbiz.fr/association-des-parents-del%C3%A8ves-de_1D-04-73-17-35-27", "PEEP Puy-de-Dome"),
    ("apevolloreville@gmail.com", "puy-de-dome", "association parents eleves", "https://vollore-ville.fr/association-des-parents-deleves/", "APE Vollore-Ville"),
    ("crip03@allier.fr", "allier", "CRIP protection enfance ASE", "https://www.allier.fr/741-enfance-en-danger.htm", "Enfance en danger - Conseil Departemental de l'Allier"),
    ("contact@allier.fr", "allier", "departement solidarite enfance famille", "https://www.allier.fr/741-enfance-en-danger.htm", "Conseil Departemental de l'Allier"),
    ("ppe@asea43.org", "haute-loire", "protection enfance ASE MECS", "https://asea43.org/polesprotectionenfance.html", "ASEA 43 Pole protection de l'enfance"),
    ("mda87@ch-esquirol-limoges.fr", "haute-vienne", "maison des adolescents protection enfance", "https://www.mda87.fr/", "Maison des Adolescents de la Haute-Vienne"),
    ("mda87@mda87.fr", "haute-vienne", "maison des adolescents protection enfance", "https://cerjep.fr/les-maisons-des-adolescents-mda/", "MDA de la Haute-Vienne"),
    ("rca@sil.fr", "creuse", "maison des adolescents protection enfance", "https://cerjep.fr/les-maisons-des-adolescents-mda/", "MDA de la Creuse"),
    ("secretariatdppa@creuse.fr", "creuse", "departement solidarite autonomie accueil familial", "https://www.creuse.fr/L-accueil-familial-1167", "Conseil departemental de la Creuse - accueil familial"),
    ("scom@aveyron.fr", "aveyron", "departement solidarite enfance famille", "https://aveyron.fr/qui-contacter", "Departement de l'Aveyron - contacts"),
    ("tas.esp@aveyron.fr", "aveyron", "maison solidarite departementale", "https://aveyron.fr/qui-contacter", "Aveyron Services solidarites Espalion"),
]


@dataclass(frozen=True)
class EmailHit:
    email: str
    department: str
    category: str
    source_url: str
    page_title: str
    query: str


def normalize_email(raw: str) -> str | None:
    value = html.unescape(raw).lower()
    value = re.sub(r"\s*\[at\]\s*|\s*@\s*", "@", value)
    value = re.sub(r"\s*\[dot\]\s*|\s*\.\s*", ".", value)
    value = value.strip(" .,:;()[]{}<>\"'")
    _, parsed = parseaddr(value)
    if not parsed or "@" not in parsed:
        return None
    local, domain = parsed.rsplit("@", 1)
    if not local or not domain or "." not in domain:
        return None
    return f"{local}@{domain}"


def is_generic_org_email(email: str) -> bool:
    local, domain = email.rsplit("@", 1)
    normalized_local = re.sub(r"[^a-z0-9]+", " ", local.lower())
    tokens = set(normalized_local.split())
    compact = re.sub(r"[^a-z0-9]+", "", local.lower())

    if tokens & GENERIC_LOCAL_TOKENS:
        return True
    if compact.startswith(("ape", "fcpe", "peep", "cdos", "alsh", "omjs")):
        return True
    if any(token in compact for token in GENERIC_LOCAL_TOKENS if len(token) >= 4):
        return True
    if re.fullmatch(r"[a-z]+[.\-_][a-z]+", local) and domain in PERSONAL_DOMAINS:
        return False
    if domain in PERSONAL_DOMAINS:
        return bool(tokens & GENERIC_LOCAL_TOKENS or compact.startswith(("ape", "fcpe", "peep", "cdos", "alsh")))
    return False


def assert_allowed_query(query: str) -> None:
    lowered = query.lower()
    if any(term in lowered for term in BLOCKED_QUERY_TERMS):
        raise ValueError(f"blocked query because it targets families or minors: {query}")


def fetch(url: str, timeout: int, delay: float, robots: dict[str, RobotFileParser]) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return ""
    host = f"{parsed.scheme}://{parsed.netloc}"
    if host not in robots:
        rp = RobotFileParser()
        rp.set_url(urljoin(host, "/robots.txt"))
        try:
            rp.read()
        except Exception:
            pass
        robots[host] = rp
    if robots[host].default_entry and not robots[host].can_fetch(USER_AGENT, url):
        return ""
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=timeout) as response:
        content_type = response.headers.get("content-type", "")
        if "text/html" not in content_type and "text/plain" not in content_type:
            return ""
        body = response.read(1_000_000)
    return body.decode("utf-8", errors="replace")


def duckduckgo_urls(query: str, timeout: int, delay: float, robots: dict[str, RobotFileParser]) -> list[str]:
    assert_allowed_query(query)
    body = fetch(f"https://duckduckgo.com/html/?q={quote_plus(query)}", timeout, delay, robots)
    urls: list[str] = []
    for href in HREF_RE.findall(body):
        href = html.unescape(href)
        if "duckduckgo.com/l/?" in href:
            parsed = urlparse(href)
            href = unquote(parse_qs(parsed.query).get("uddg", [""])[0])
        if href.startswith("//"):
            href = "https:" + href
        if href.startswith("http") and "duckduckgo.com" not in href:
            urls.append(href)
    return list(dict.fromkeys(urls))


def extract_title(body: str) -> str:
    match = TITLE_RE.search(body)
    if not match:
        return ""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", match.group(1)))).strip()


def extract_emails(body: str) -> Iterable[str]:
    seen: set[str] = set()
    for raw in EMAIL_RE.findall(body):
        email = normalize_email(raw)
        if email and email not in seen and is_generic_org_email(email):
            seen.add(email)
            yield email


def build_queries() -> Iterable[tuple[str, str, str]]:
    for department, places in DEPARTMENTS.items():
        for category in CATEGORIES:
            for place in places:
                yield department, category, f'{category} "{place}" email contact'


def collect_manual_public_contacts(max_results: int) -> list[EmailHit]:
    hits: list[EmailHit] = []
    for email_raw, department, category, source_url, page_title in MANUAL_PUBLIC_CONTACTS:
        if len(hits) >= max_results:
            break
        email = normalize_email(email_raw)
        if not email:
            continue
        hits.append(
            EmailHit(
                email=email,
                department=department,
                category=category,
                source_url=source_url,
                page_title=page_title,
                query=f"manual public source: {category}",
            )
        )
    return hits


def collect_aurillac_associations(max_results: int, timeout: int, delay: float) -> list[EmailHit]:
    robots: dict[str, RobotFileParser] = {}
    detail_urls: set[str] = set()
    for page in range(1, 11):
        url = "https://www.aurillac.fr/associations/annuaire/" if page == 1 else f"https://www.aurillac.fr/associations/annuaire/page/{page}/"
        try:
            body = fetch(url, timeout, delay, robots)
        except Exception:
            continue
        for href in HREF_RE.findall(body):
            href = html.unescape(href)
            if href.startswith("/"):
                href = urljoin(url, href)
            if not href.startswith("https://www.aurillac.fr/associations/annuaire/"):
                continue
            if "/asso-categ/" in href or "/page/" in href:
                continue
            detail_urls.add(href)

    hits: list[EmailHit] = []
    for url in sorted(detail_urls):
        if len(hits) >= max_results:
            break
        try:
            body = fetch(url, timeout, delay, robots)
        except Exception:
            continue
        title = extract_title(body)
        for email in extract_emails(body):
            if len(hits) >= max_results:
                break
            hits.append(
                EmailHit(
                    email=email,
                    department="cantal",
                    category="association Aurillac",
                    source_url=url,
                    page_title=title,
                    query="direct public source: Aurillac association directory",
                )
            )
    return hits


def collect(max_results: int, timeout: int, delay: float, pages_per_query: int) -> list[EmailHit]:
    robots: dict[str, RobotFileParser] = {}
    hits: dict[str, EmailHit] = {}
    for hit in collect_manual_public_contacts(max_results):
        hits.setdefault(hit.email, hit)
    for hit in collect_service_public_administration(max_results * 3, timeout):
        if len(hits) >= max_results:
            break
        hits.setdefault(hit.email, hit)
    for hit in collect_aurillac_associations(max_results - len(hits), timeout, delay):
        if len(hits) >= max_results:
            break
        hits.setdefault(hit.email, hit)
    if pages_per_query <= 0:
        return sorted(hits.values(), key=lambda hit: (hit.department, hit.category, hit.email))
    for department, category, query in build_queries():
        if len(hits) >= max_results:
            break
        try:
            urls = duckduckgo_urls(query, timeout, delay, robots)[:pages_per_query]
        except Exception:
            continue
        for url in urls:
            if len(hits) >= max_results:
                break
            try:
                body = fetch(url, timeout, delay, robots)
            except Exception:
                continue
            title = extract_title(body)
            for email in extract_emails(body):
                hits.setdefault(
                    email,
                    EmailHit(
                        email=email,
                        department=department,
                        category=category,
                        source_url=url,
                        page_title=title,
                        query=query,
                    ),
                )
    return sorted(hits.values(), key=lambda hit: (hit.department, hit.category, hit.email))


def infer_type_contact(category: str, email: str) -> str:
    value = f"{category} {email}".lower()
    if "cse" in value or "comite social economique" in value:
        return "cse"
    if "mairie" in value or "administration" in value or "service-public" in value:
        return "collectivite_administration"
    if "syndicat" in value or "snes" in value or "sgen" in value or "snalc" in value or "snfolc" in value:
        return "syndicat"
    if "parents" in value or "fcpe" in value or "peep" in value or "ape" in value:
        return "association_parents"
    if "jeunesse" in value or "alsh" in value or "periscolaire" in value or "bafa" in value:
        return "jeunesse_loisirs"
    if (
        re.search(r"\base\b", value)
        or "mecs" in value
        or "protection enfance" in value
        or "maison des adolescents" in value
        or "mda" in value
        or "enfance famille" in value
        or "crip" in value
    ):
        return "protection_enfance"
    if "sport" in value or "club" in value or "cdos" in value or "ufolep" in value or "usep" in value:
        return "sport"
    if "cci" in value or "cpme" in value or "professionnelle" in value or "commerce" in value:
        return "acteur_economique"
    if "social" in value or "insertion" in value or "cidff" in value or "anef" in value or "siae" in value:
        return "social_insertion"
    if "association" in value or "vie associative" in value:
        return "association"
    if "office tourisme" in value or "syndicat initiative" in value:
        return "tourisme"
    return "structure"


def infer_service_public_category(name: str, pivot: str, email: str) -> str:
    value = f"{name} {pivot} {email}".lower()
    if "mission_locale" in value or "mission locale" in value:
        return "mission locale jeunesse insertion"
    if "aide sociale" in value or "protection de l'enfance" in value or "enfance famille" in value or "crip" in value:
        return "protection enfance ASE"
    if "cij" in value or "point information jeunesse" in value or "info jeunes" in value:
        return "PIJ information jeunesse"
    if "jeunesse" in value or "jeunes" in value:
        return "service jeunesse"
    if "france_travail" in value or "france travail" in value:
        return "emploi insertion"
    if "mairie" in value:
        return "mairie collectivite"
    if "prefecture" in value or "sous-prefecture" in value:
        return "prefecture administration"
    if "maison" in value and "service" in value:
        return "maison france services"
    return "administration collectivite service public"


def write_csv(path: Path, hits: list[EmailHit]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["email", "type_contact", "department", "category", "source_url", "page_title", "query"],
        )
        writer.writeheader()
        for hit in hits:
            writer.writerow(
                {
                    "email": hit.email,
                    "type_contact": infer_type_contact(hit.category, hit.email),
                    "department": hit.department,
                    "category": hit.category,
                    "source_url": hit.source_url,
                    "page_title": hit.page_title,
                    "query": hit.query,
                }
            )


def collect_service_public_administration(max_results: int, timeout: int) -> list[EmailHit]:
    hits: list[EmailHit] = []
    base_url = "https://api-lannuaire.service-public.gouv.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records"
    for department, code in DEPARTMENT_CODES.items():
        offset = 0
        while len(hits) < max_results:
            where = quote_plus(f"code_insee_commune like '{code}*' and adresse_courriel is not null")
            url = f"{base_url}?where={where}&limit=100&offset={offset}"
            request = Request(url, headers={"User-Agent": USER_AGENT})
            try:
                with urlopen(request, timeout=timeout) as response:
                    payload = json.loads(response.read().decode("utf-8"))
            except Exception:
                break
            rows = payload.get("results", [])
            if not rows:
                break
            for row in rows:
                if len(hits) >= max_results:
                    break
                email = normalize_email(str(row.get("adresse_courriel") or ""))
                if not email:
                    continue
                name = str(row.get("nom") or "")
                pivot = str(row.get("pivot") or "")
                hits.append(
                    EmailHit(
                        email=email,
                        department=department,
                        category=infer_service_public_category(name, pivot, email),
                        source_url=str(row.get("url_service_public") or base_url),
                        page_title=name,
                        query="official source: Annuaire de l'administration Service-public.fr",
                    )
                )
            offset += len(rows)
            if offset >= int(payload.get("total_count", 0)):
                break
    return hits


def write_sources_csv(path: Path, hits: list[EmailHit]) -> None:
    rows: dict[tuple[str, str], dict[str, str]] = {}
    for hit in hits:
        key = (hit.source_url, hit.department)
        current = rows.setdefault(
            key,
            {
                "source_url": hit.source_url,
                "department": hit.department,
                "page_title": hit.page_title,
                "categories": "",
                "type_contacts": "",
                "contact_count": "0",
            },
        )
        categories = set(filter(None, current["categories"].split(" | ")))
        categories.add(hit.category)
        types = set(filter(None, current["type_contacts"].split(" | ")))
        types.add(infer_type_contact(hit.category, hit.email))
        current["categories"] = " | ".join(sorted(categories))
        current["type_contacts"] = " | ".join(sorted(types))
        current["contact_count"] = str(int(current["contact_count"]) + 1)

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["source_url", "department", "page_title", "type_contacts", "categories", "contact_count"],
        )
        writer.writeheader()
        for row in sorted(rows.values(), key=lambda item: (item["department"], item["source_url"])):
            writer.writerow(row)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default="data/public_structure_emails.csv", help="CSV output path")
    parser.add_argument("--sources-out", default="data/public_structure_sources.csv", help="CSV output path for unique source pages")
    parser.add_argument("--max", type=int, default=3000, help="maximum number of unique emails")
    parser.add_argument("--timeout", type=int, default=12, help="HTTP timeout in seconds")
    parser.add_argument("--delay", type=float, default=1.0, help="delay between HTTP requests")
    parser.add_argument("--pages-per-query", type=int, default=0, help="search results fetched per query")
    args = parser.parse_args()

    hits = collect(args.max, args.timeout, args.delay, args.pages_per_query)
    write_csv(Path(args.out), hits)
    write_sources_csv(Path(args.sources_out), hits)
    print(f"wrote {len(hits)} generic non-school organization emails to {args.out}")
    print(f"wrote {len(set(hit.source_url for hit in hits))} source pages to {args.sources_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
