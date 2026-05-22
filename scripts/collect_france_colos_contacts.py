#!/usr/bin/env python3
"""
Collect a national CSV of public structure contacts for colonies/holiday camp
outreach: youth services, PIJ/Info Jeunes, missions locales, child protection,
departmental/social services, then territorial public relays.

The source is the official Service-public.fr administration directory API.
The output intentionally focuses on structures and public service contacts,
not personal prospecting.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import time
from dataclasses import dataclass
from email.utils import parseaddr
from pathlib import Path
from urllib.parse import urlparse
from urllib.parse import quote_plus
from urllib.request import Request, urlopen


API_URL = "https://api-lannuaire.service-public.gouv.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records"
USER_AGENT = "France-colos-public-structure-contact-research/1.0"
DATA_INCLUSION_DATASET = "referentiel-de-loffre-dinsertion-sociale-et-professionnelle-data-inclusion"
GENERIC_LOCAL_TOKENS = {
    "accueil",
    "admin",
    "administration",
    "alsh",
    "animation",
    "antenne",
    "asso",
    "association",
    "bij",
    "ccas",
    "centre",
    "cias",
    "cij",
    "contact",
    "courrier",
    "direction",
    "equipe",
    "emploi",
    "enfance",
    "famille",
    "familles",
    "formation",
    "info",
    "infos",
    "insertion",
    "jeunesse",
    "mairie",
    "mda",
    "mde",
    "mdph",
    "mds",
    "mission",
    "orientation",
    "pij",
    "prescription",
    "secretariat",
    "service",
    "siege",
    "social",
    "solidarite",
    "standard",
}
PERSONAL_DOMAINS = {
    "free.fr",
    "gmail.com",
    "hotmail.com",
    "hotmail.fr",
    "icloud.com",
    "laposte.net",
    "orange.fr",
    "outlook.com",
    "outlook.fr",
    "sfr.fr",
    "wanadoo.fr",
    "yahoo.fr",
}

TARGET_QUERIES = [
    ("mission_locale", "adresse_courriel is not null and pivot like '%mission_locale%'"),
    ("info_jeunes_pij", "adresse_courriel is not null and pivot like '%cij%'"),
    ("jeunesse", "adresse_courriel is not null and (nom like '%jeunesse%' or nom like '%jeunes%')"),
    ("adolescents", "adresse_courriel is not null and (nom like '%adolescent%' or nom like '%ados%')"),
    ("enfance", "adresse_courriel is not null and nom like '%enfance%'"),
    ("mecs", "adresse_courriel is not null and (nom like '%MECS%' or nom like '%maison d%enfants%' or nom like '%maison enfants%')"),
    ("accueil_jour_enfance", "adresse_courriel is not null and (nom like '%accueil de jour%' or nom like '%foyer de l%enfance%' or nom like '%foyer enfance%')"),
    ("centre_social", "adresse_courriel is not null and (nom like '%centre social%' or nom like '%centre socio%' or nom like '%maison de quartier%')"),
    ("departement_ase", "adresse_courriel is not null and (nom like '%aide sociale%' or nom like '%protection%' or nom like '%solidarite%')"),
    ("departements", "adresse_courriel is not null and (nom like '%Departement%' or nom like '%Conseil departemental%')"),
]

DEPARTMENT_PREFIXES = [
    *[f"{code:02d}" for code in range(1, 20)],
    "2A",
    "2B",
    *[str(code) for code in range(21, 96)],
    "971",
    "972",
    "973",
    "974",
    "976",
]


@dataclass(frozen=True)
class Contact:
    email: str
    type_contact: str
    priority: str
    department_code: str
    commune: str
    category: str
    organization: str
    source_url: str
    source_name: str
    query: str


def normalize_email(raw: str) -> str | None:
    _, parsed = parseaddr(str(raw or "").strip().lower())
    if not parsed or "@" not in parsed:
        return None
    local, domain = parsed.rsplit("@", 1)
    if not local or not domain or "." not in domain:
        return None
    return f"{local}@{domain}"


def load_json_field(value: object) -> object:
    if not value:
        return None
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(str(value))
    except json.JSONDecodeError:
        return None


def extract_commune(row: dict) -> str:
    addresses = load_json_field(row.get("adresse"))
    if isinstance(addresses, list) and addresses:
        commune = addresses[0].get("nom_commune")
        if commune:
            return str(commune)
    return ""


def department_from_insee(code: object) -> str:
    value = str(code or "")
    if not value:
        return ""
    if value.startswith("97") or value.startswith("98"):
        return value[:3]
    return value[:2]


def infer_category(name: str, pivot: str, email: str) -> str:
    value = f"{name} {pivot} {email}".lower()
    if "mission_locale" in value or "mission locale" in value:
        return "mission locale jeunesse insertion"
    if "cij" in value or "point information jeunesse" in value or "info jeunes" in value:
        return "PIJ information jeunesse"
    if "adolescent" in value or "ados" in value:
        return "maison adolescents jeunesse"
    if "mecs" in value or "maison d" in value and "enfants" in value or "foyer de l" in value and "enfance" in value:
        return "MECS maison enfants protection enfance"
    if "accueil de jour" in value:
        return "accueil de jour protection enfance"
    if "centre social" in value or "centre socio" in value or "maison de quartier" in value:
        return "centre social maison quartier"
    if re.search(r"\base\b", value) or "aide sociale" in value or "protection" in value:
        return "protection enfance ASE"
    if "enfance" in value:
        return "enfance jeunesse"
    if "jeunesse" in value or "jeunes" in value:
        return "service jeunesse"
    if "solidarite" in value or "solidarité" in value:
        return "solidarites departementales"
    if "departement" in value or "département" in value or "conseil departemental" in value:
        return "departement"
    if "mairie" in value:
        return "mairie relais territorial"
    if "france_travail" in value or "france travail" in value:
        return "emploi insertion"
    if "maison" in value and "service" in value:
        return "maison france services"
    return "administration relais territorial"


def infer_data_inclusion_category(row: dict) -> str:
    value = " ".join(
        str(row.get(key) or "")
        for key in ["nom", "description", "source", "reseaux_porteurs"]
    ).lower()
    if "mission locale" in value:
        return "mission locale jeunesse insertion"
    if "jeune" in value or "jeunesse" in value or "pij" in value or "info jeunes" in value:
        return "service jeunesse"
    if "enfance" in value or "famille" in value or "monenfant" in value:
        return "enfance familles loisirs"
    if "aidant" in value or "handicap" in value or "mdph" in value:
        return "solidarites handicap familles"
    if "logement" in value:
        return "logement jeunes familles"
    if "formation" in value:
        return "formation insertion"
    if "emploi" in value or "insertion" in value or "dora" in value:
        return "insertion sociale professionnelle"
    return "structure inclusion sociale"


def infer_type(category: str) -> str:
    value = category.lower()
    if "mission locale" in value:
        return "mission_locale"
    if "pij" in value or "info" in value:
        return "info_jeunes_pij"
    if "protection" in value or "ase" in value or "adolescents" in value:
        return "protection_enfance"
    if "centre social" in value or "maison quartier" in value:
        return "centre_social"
    if "jeunesse" in value or "enfance" in value:
        return "jeunesse_enfance"
    if "departement" in value or "solidarites" in value:
        return "departement_solidarites"
    if "mairie" in value:
        return "mairie_relais"
    if "emploi" in value or "insertion" in value:
        return "insertion"
    return "administration_relais"


def infer_priority(category: str) -> str:
    value = category.lower()
    if any(term in value for term in ["mission locale", "pij", "jeunesse", "enfance", "protection", "ase", "adolescents"]):
        return "1-coeur-cible"
    if any(term in value for term in ["departement", "solidarites", "insertion", "emploi"]):
        return "2-relais-qualifie"
    if "mairie" in value:
        return "3-relais-territorial"
    return "4-complement"


def is_generic_structure_email(email: str) -> bool:
    if "@" not in email:
        return False
    local, domain = email.rsplit("@", 1)
    normalized = re.sub(r"[^a-z0-9]+", " ", local.lower())
    tokens = set(normalized.split())
    compact = re.sub(r"[^a-z0-9]+", "", local.lower())
    if tokens & GENERIC_LOCAL_TOKENS:
        return True
    if any(token in compact for token in GENERIC_LOCAL_TOKENS if len(token) >= 4):
        return True
    if re.fullmatch(r"[a-z]+[._-][a-z]+", local.lower()):
        return False
    if domain in PERSONAL_DOMAINS:
        return False
    return len(local) <= 8


def fetch_records(where: str, timeout: int, sleep: float, retries: int = 3):
    offset = 0
    while True:
        url = f"{API_URL}?where={quote_plus(where)}&limit=100&offset={offset}"
        payload = None
        for attempt in range(retries + 1):
            request = Request(url, headers={"User-Agent": USER_AGENT})
            try:
                with urlopen(request, timeout=timeout) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                break
            except Exception as exc:
                if attempt >= retries:
                    print(f"skipped query at offset {offset}: {exc}")
                    return
                time.sleep(min(2 ** attempt, 8))
        rows = payload.get("results", [])
        if not rows:
            break
        yield from rows
        offset += len(rows)
        if offset >= int(payload.get("total_count", 0)):
            break
        if sleep:
            time.sleep(sleep)


def row_to_contact(row: dict, query_name: str) -> Contact | None:
    email = normalize_email(row.get("adresse_courriel"))
    if not email:
        return None
    name = str(row.get("nom") or "")
    pivot = str(row.get("pivot") or "")
    category = infer_category(name, pivot, email)
    return Contact(
        email=email,
        type_contact=infer_type(category),
        priority=infer_priority(category),
        department_code=department_from_insee(row.get("code_insee_commune")),
        commune=extract_commune(row),
        category=category,
        organization=name,
        source_url=str(row.get("url_service_public") or API_URL),
        source_name="Annuaire de l'administration Service-public.fr",
        query=query_name,
    )


def latest_data_inclusion_csv_url(timeout: int) -> str:
    url = f"https://www.data.gouv.fr/api/1/datasets/{DATA_INCLUSION_DATASET}/"
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=timeout) as response:
        payload = json.loads(response.read().decode("utf-8"))
    csv_resources = [
        resource
        for resource in payload.get("resources", [])
        if resource.get("format") == "csv" and str(resource.get("title", "")).startswith("structures-inclusion-")
    ]
    if not csv_resources:
        raise RuntimeError("No data.inclusion structures CSV resource found")
    return sorted(csv_resources, key=lambda item: item.get("title", ""), reverse=True)[0]["url"]


def ensure_data_inclusion_csv(cache_dir: Path, timeout: int) -> Path:
    cache_dir.mkdir(parents=True, exist_ok=True)
    url = latest_data_inclusion_csv_url(timeout)
    filename = Path(urlparse(url).path).name
    path = cache_dir / filename
    if path.exists() and path.stat().st_size > 0:
        return path
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=timeout) as response, path.open("wb") as handle:
        while True:
            chunk = response.read(1024 * 1024)
            if not chunk:
                break
            handle.write(chunk)
    return path


def data_inclusion_contacts(cache_dir: Path, timeout: int):
    path = ensure_data_inclusion_csv(cache_dir, timeout)
    with path.open("r", encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            email = normalize_email(row.get("courriel"))
            if not email or not is_generic_structure_email(email):
                continue
            category = infer_data_inclusion_category(row)
            source_url = row.get("lien_source") or row.get("site_web") or "https://www.data.gouv.fr/fr/datasets/referentiel-de-loffre-dinsertion-sociale-et-professionnelle-data-inclusion/"
            yield Contact(
                email=email,
                type_contact=infer_type(category),
                priority=infer_priority(category),
                department_code=department_from_insee(row.get("code_insee")),
                commune=str(row.get("commune") or ""),
                category=category,
                organization=str(row.get("nom") or ""),
                source_url=str(source_url),
                source_name="data.inclusion.gouv.fr",
                query=f"data_inclusion_{row.get('source') or 'unknown'}",
            )


def reached_limit(contacts: dict[str, Contact], max_contacts: int) -> bool:
    return max_contacts > 0 and len(contacts) >= max_contacts


def collect(max_contacts: int, timeout: int, sleep: float, include_data_inclusion: bool, cache_dir: Path) -> list[Contact]:
    contacts: dict[str, Contact] = {}
    for query_name, where in TARGET_QUERIES:
        for row in fetch_records(where, timeout, sleep):
            contact = row_to_contact(row, query_name)
            if not contact:
                continue
            contacts.setdefault(contact.email, contact)
            if reached_limit(contacts, max_contacts):
                return sorted_contacts(contacts.values())[:max_contacts]
    if include_data_inclusion:
        for contact in data_inclusion_contacts(cache_dir, timeout):
            contacts.setdefault(contact.email, contact)
            if reached_limit(contacts, max_contacts):
                return sorted_contacts(contacts.values())[:max_contacts]
    for prefix in DEPARTMENT_PREFIXES:
        where = f"adresse_courriel is not null and code_insee_commune like '{prefix}*'"
        for row in fetch_records(where, timeout, sleep):
            contact = row_to_contact(row, f"administrations_relais_{prefix}")
            if not contact:
                continue
            contacts.setdefault(contact.email, contact)
            if reached_limit(contacts, max_contacts):
                return sorted_contacts(contacts.values())[:max_contacts]
    contacts_sorted = sorted_contacts(contacts.values())
    return contacts_sorted[:max_contacts] if max_contacts > 0 else contacts_sorted


def sorted_contacts(contacts) -> list[Contact]:
    return sorted(
        contacts,
        key=lambda item: (
            item.priority,
            item.type_contact,
            item.department_code,
            item.commune,
            item.email,
        ),
    )


def write_contacts(path: Path, contacts: list[Contact]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "email",
                "type_contact",
                "priority",
                "department_code",
                "commune",
                "category",
                "organization",
                "source_url",
                "source_name",
                "query",
            ],
        )
        writer.writeheader()
        for contact in contacts:
            writer.writerow(contact.__dict__)


def write_sources(path: Path, contacts: list[Contact]) -> None:
    rows: dict[str, dict[str, str]] = {}
    for contact in contacts:
        row = rows.setdefault(
            contact.source_url,
            {
                "source_url": contact.source_url,
                "source_name": contact.source_name,
                "departments": "",
                "type_contacts": "",
                "priorities": "",
                "contact_count": "0",
            },
        )
        departments = set(filter(None, row["departments"].split(" | ")))
        departments.add(contact.department_code)
        types = set(filter(None, row["type_contacts"].split(" | ")))
        types.add(contact.type_contact)
        priorities = set(filter(None, row["priorities"].split(" | ")))
        priorities.add(contact.priority)
        row["departments"] = " | ".join(sorted(departments))
        row["type_contacts"] = " | ".join(sorted(types))
        row["priorities"] = " | ".join(sorted(priorities))
        row["contact_count"] = str(int(row["contact_count"]) + 1)

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["source_url", "source_name", "departments", "type_contacts", "priorities", "contact_count"],
        )
        writer.writeheader()
        for row in sorted(rows.values(), key=lambda item: item["source_url"]):
            writer.writerow(row)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--max", type=int, default=10000, help="Maximum contacts. Use 0 for no artificial cap.")
    parser.add_argument("--timeout", type=int, default=20)
    parser.add_argument("--sleep", type=float, default=0)
    parser.add_argument("--cache-dir", default="data/cache")
    parser.add_argument("--no-data-inclusion", action="store_true")
    parser.add_argument("--out", default="data/france_colos_youth_contacts.csv")
    parser.add_argument("--sources-out", default="data/france_colos_youth_sources.csv")
    args = parser.parse_args()

    contacts = collect(args.max, args.timeout, args.sleep, not args.no_data_inclusion, Path(args.cache_dir))
    write_contacts(Path(args.out), contacts)
    write_sources(Path(args.sources_out), contacts)
    print(f"wrote {len(contacts)} contacts to {args.out}")
    print(f"wrote {len(set(contact.source_url for contact in contacts))} sources to {args.sources_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
