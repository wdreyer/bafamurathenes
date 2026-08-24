"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ArrowDownUp, Flame, Mail, Phone, Plus, Search, UserRoundCheck } from "lucide-react";
import { db } from "@/lib/firebase";
import { cleanFormationTitle } from "@/lib/formationTitles";
import type { Inscription, Prospect, ProspectStatus } from "@/lib/types";

type SortKey = "date_desc" | "date_asc" | "name_asc" | "formation_asc";

type ProspectRow = {
  id: string;
  origin: Prospect["origin"];
  name: string;
  email?: string;
  phone?: string;
  formationTitle?: string;
  status: ProspectStatus;
  priority?: Prospect["priority"];
  qualification?: Prospect["qualification"];
  nextFollowUpDate?: string;
  department?: string;
  source?: string;
  message?: string;
  smsNotes?: string;
  notes?: string;
  createdAt?: unknown;
};

const STATUS_LABELS: Record<ProspectStatus, string> = {
  new: "Nouveau",
  to_contact: "A relancer",
  contacted: "Contacte",
  registered: "Inscrit",
  closed: "Refuse / non",
};

const ORIGIN_LABELS: Record<Prospect["origin"], string> = {
  contact_form: "Formulaire",
  aides_form: "Aides BAFA",
  yapla: "Yapla",
  manual: "Manuel",
  inscription: "Inscription",
};

const QUALIFICATION_LABELS: Record<NonNullable<Prospect["qualification"]>, string> = {
  cold: "Froid",
  warm: "Tiede",
  hot: "Tres chaud",
};

function normalize(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function phoneKey(value?: string) {
  return String(value || "").replace(/\D/g, "");
}

function dateFromUnknown(value: unknown) {
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date((value as string | number | Date | undefined) || 0);
}

function formatDate(value: unknown, withTime = false) {
  if (!value) return "-";
  const date = dateFromUnknown(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function prospectName(prospect: Prospect) {
  return (
    prospect.name ||
    [prospect.firstName, prospect.lastName].filter(Boolean).join(" ") ||
    prospect.email ||
    prospect.phone ||
    "Contact sans nom"
  );
}

function hasPersonIdentity(prospect: Prospect) {
  return Boolean(prospect.name || prospect.firstName || prospect.lastName || prospect.email || prospect.phone);
}

function prospectToRow(prospect: Prospect): ProspectRow {
  return {
    id: prospect.id,
    origin: prospect.origin || "manual",
    name: prospectName(prospect),
    email: prospect.email,
    phone: prospect.phone,
    formationTitle: cleanFormationTitle(prospect.formationTitle || ""),
    status: prospect.status || "new",
    priority: prospect.priority,
    qualification: prospect.qualification,
    nextFollowUpDate: prospect.nextFollowUpDate,
    department: prospect.department,
    source: prospect.source,
    message: prospect.message,
    smsNotes: prospect.smsNotes,
    notes: prospect.notes,
    createdAt: prospect.createdAt,
  };
}

export function ProspectsTracker() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState<"all" | Prospect["origin"]>("all");
  const [status, setStatus] = useState<"all" | ProspectStatus>("all");
  const [formation, setFormation] = useState("all");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [showAdd, setShowAdd] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    formationTitle: "",
    notes: "",
  });

  useEffect(() => {
    const prospectsQuery = query(collection(db, "prospects"), orderBy("createdAt", "desc"));
    const inscriptionsQuery = query(collection(db, "inscriptions"), orderBy("createdAt", "desc"));

    const unsubProspects = onSnapshot(prospectsQuery, (snapshot) => {
      setProspects(snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<Prospect, "id">) })));
    });
    const unsubInscriptions = onSnapshot(inscriptionsQuery, (snapshot) => {
      setInscriptions(snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<Inscription, "id">) })));
    });

    return () => {
      unsubProspects();
      unsubInscriptions();
    };
  }, []);

  const rows = useMemo(() => {
    const registeredKeys = new Set(
      inscriptions
        .flatMap((inscription) => [
          normalize(inscription.email),
          phoneKey(inscription.phone),
          normalize([inscription.firstName, inscription.lastName].filter(Boolean).join(" ")),
        ])
        .filter(Boolean),
    );

    return prospects
      .filter((prospect) => (prospect.status || "new") !== "registered")
      .filter((prospect) => prospect.origin !== "yapla" || hasPersonIdentity(prospect))
      .filter((prospect) => {
        const keys = [normalize(prospect.email), phoneKey(prospect.phone), normalize(prospectName(prospect))].filter(Boolean);
        return !keys.some((key) => registeredKeys.has(key));
      })
      .map(prospectToRow);
  }, [inscriptions, prospects]);

  const formationOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.formationTitle).filter(Boolean))).sort() as string[],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const term = normalize(search);
    const filtered = rows.filter((row) => {
      const haystack = normalize(
        [
          row.name,
          row.email,
          row.phone,
          row.formationTitle,
          row.department,
          row.source,
          row.message,
          row.notes,
          row.smsNotes,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return (
        (origin === "all" || row.origin === origin) &&
        (status === "all" || row.status === status) &&
        (formation === "all" || row.formationTitle === formation) &&
        (!term || haystack.includes(term))
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "date_asc") return dateFromUnknown(a.createdAt).getTime() - dateFromUnknown(b.createdAt).getTime();
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "formation_asc") return (a.formationTitle || "").localeCompare(b.formationTitle || "");
      return dateFromUnknown(b.createdAt).getTime() - dateFromUnknown(a.createdAt).getTime();
    });
  }, [formation, origin, rows, search, sort, status]);

  const selectedRow = selectedId ? rows.find((row) => row.id === selectedId) ?? null : null;

  const stats = useMemo(() => {
    return {
      total: rows.length,
      open: rows.filter((row) => ["new", "to_contact", "contacted"].includes(row.status)).length,
      hot: rows.filter((row) => row.qualification === "hot" || row.priority === "high").length,
      closed: rows.filter((row) => row.status === "closed").length,
      todo: rows.filter((row) => row.status === "new" || row.status === "to_contact").length,
    };
  }, [rows]);

  async function updateProspect(id: string, patch: Partial<Prospect>) {
    setSavingId(id);
    try {
      await updateDoc(doc(db, "prospects", id), { ...patch, updatedAt: serverTimestamp() });
    } finally {
      setSavingId(null);
    }
  }

  async function addManualLead(event: FormEvent) {
    event.preventDefault();
    if (!newLead.name.trim()) return;
    await addDoc(collection(db, "prospects"), {
      origin: "manual",
      leadType: "Prospect ajoute manuellement",
      name: newLead.name.trim(),
      email: newLead.email.trim(),
      phone: newLead.phone.trim(),
      department: newLead.department.trim(),
      formationTitle: cleanFormationTitle(newLead.formationTitle.trim()),
      notes: newLead.notes.trim(),
      status: "to_contact",
      priority: "normal",
      qualification: "warm",
      preferredContact: "any",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setNewLead({ name: "", email: "", phone: "", department: "", formationTitle: "", notes: "" });
    setShowAdd(false);
  }

  function exportCsv() {
    const headers = ["Date", "Origine", "Statut", "Nom", "Email", "Telephone", "Formation", "Departement", "Qualification", "Relance", "Notes", "SMS / appels"];
    const lines = filteredRows.map((row) =>
      [
        formatDate(row.createdAt, true),
        ORIGIN_LABELS[row.origin],
        STATUS_LABELS[row.status],
        row.name,
        row.email || "",
        row.phone || "",
        row.formationTitle || "",
        row.department || "",
        row.qualification ? QUALIFICATION_LABELS[row.qualification] : "",
        row.nextFollowUpDate || "",
        row.notes || "",
        row.smsNotes || "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "prospects-bafa-murathenes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 md:grid-cols-4">
        <Metric icon={UserRoundCheck} label="Prospects" value={stats.total.toString()} detail={`${stats.open} ouverts`} />
        <Metric icon={Flame} label="Tres chauds" value={stats.hot.toString()} detail="Priorite haute ou hot" />
        <Metric icon={Phone} label="A traiter" value={stats.todo.toString()} detail="Nouveaux + relance" />
        <Metric icon={ArrowDownUp} label="Refuses" value={stats.closed.toString()} detail="Ont dit non" />
      </section>

      <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher nom, email, telephone, departement, note..."
              className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <FilterSelect value={origin} onChange={(value) => setOrigin(value as "all" | Prospect["origin"])}>
            <option value="all">Toutes origines</option>
            {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect value={status} onChange={(value) => setStatus(value as "all" | ProspectStatus)}>
            <option value="all">Tous statuts</option>
            {Object.entries(STATUS_LABELS).filter(([value]) => value !== "registered").map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </FilterSelect>
          <FilterSelect value={sort} onChange={(value) => setSort(value as SortKey)}>
            <option value="date_desc">Plus recent</option>
            <option value="date_asc">Plus ancien</option>
            <option value="name_asc">Nom A-Z</option>
            <option value="formation_asc">Formation A-Z</option>
          </FilterSelect>
        </div>

        <FormationChips value={formation} formations={formationOptions} onChange={setFormation} />

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={() => setShowAdd((value) => !value)} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
          <button type="button" onClick={exportCsv} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <ArrowDownUp className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {showAdd && (
          <form onSubmit={addManualLead} className="grid gap-2 border-t border-slate-100 pt-3 md:grid-cols-6">
            <input value={newLead.name} onChange={(event) => setNewLead((value) => ({ ...value, name: event.target.value }))} placeholder="Nom" className="h-9 rounded-md border border-slate-200 px-3 text-sm outline-none" required />
            <input value={newLead.email} onChange={(event) => setNewLead((value) => ({ ...value, email: event.target.value }))} placeholder="Email" className="h-9 rounded-md border border-slate-200 px-3 text-sm outline-none" />
            <input value={newLead.phone} onChange={(event) => setNewLead((value) => ({ ...value, phone: event.target.value }))} placeholder="Telephone" className="h-9 rounded-md border border-slate-200 px-3 text-sm outline-none" />
            <input value={newLead.department} onChange={(event) => setNewLead((value) => ({ ...value, department: event.target.value }))} placeholder="Departement" className="h-9 rounded-md border border-slate-200 px-3 text-sm outline-none" />
            <input value={newLead.formationTitle} onChange={(event) => setNewLead((value) => ({ ...value, formationTitle: event.target.value }))} placeholder="Formation" className="h-9 rounded-md border border-slate-200 px-3 text-sm outline-none" />
            <button className="h-9 cursor-pointer rounded-md bg-slate-900 px-3 text-sm font-medium text-white">Enregistrer</button>
            <textarea value={newLead.notes} onChange={(event) => setNewLead((value) => ({ ...value, notes: event.target.value }))} placeholder="Notes" className="min-h-16 resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none md:col-span-6" />
          </form>
        )}
      </section>

      <section className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-[1120px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <TH>Contact</TH>
              <TH>Statut</TH>
              <TH>Formation</TH>
              <TH>Departement</TH>
              <TH>Dernier echange</TH>
              <TH>Relance</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-slate-500">Aucun prospect pour ces filtres.</td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <ProspectLine
                  key={row.id}
                  row={row}
                  saving={savingId === row.id}
                  onOpen={() => setSelectedId(row.id)}
                  onUpdate={(patch) => updateProspect(row.id, patch)}
                />
              ))
            )}
          </tbody>
        </table>
      </section>

      {selectedRow && (
        <ProspectModal
          row={selectedRow}
          saving={savingId === selectedRow.id}
          onClose={() => setSelectedId(null)}
          onUpdate={(patch) => updateProspect(selectedRow.id, patch)}
        />
      )}
    </div>
  );
}

function ProspectLine({
  row,
  saving,
  onOpen,
  onUpdate,
}: {
  row: ProspectRow;
  saving: boolean;
  onOpen: () => void;
  onUpdate: (patch: Partial<Prospect>) => void;
}) {
  const closed = row.status === "closed";
  return (
    <tr onClick={onOpen} className={["cursor-pointer hover:bg-slate-50", closed ? "bg-slate-50 text-slate-500" : "bg-white"].join(" ")}>
      <td className="border-b border-slate-100 px-3 py-2.5">
        <div className="font-semibold text-slate-900">{row.name}</div>
        <div className="mt-0.5 text-xs text-slate-500">{row.email || "-"} {row.phone ? ` / ${row.phone}` : ""}</div>
      </td>
      <td className="border-b border-slate-100 px-3 py-2.5">
        <div className="flex flex-wrap gap-1.5">
          <StatusPill tone={row.status === "closed" ? "gray" : row.qualification === "hot" || row.priority === "high" ? "rose" : "slate"}>{STATUS_LABELS[row.status]}</StatusPill>
          {row.qualification && <StatusPill tone={row.qualification === "hot" ? "rose" : "slate"}>{QUALIFICATION_LABELS[row.qualification]}</StatusPill>}
        </div>
        <div className="mt-1 text-xs text-slate-500">{ORIGIN_LABELS[row.origin]}</div>
      </td>
      <td className="border-b border-slate-100 px-3 py-2.5">{row.formationTitle || "-"}</td>
      <td className="border-b border-slate-100 px-3 py-2.5 font-medium text-slate-900">{row.department || "-"}</td>
      <td className="border-b border-slate-100 px-3 py-2.5">
        <div className="max-w-[300px] truncate text-xs text-slate-600">{row.smsNotes || row.notes || row.message || "-"}</div>
      </td>
      <td className="border-b border-slate-100 px-3 py-2.5 text-xs text-slate-600">{row.nextFollowUpDate || "-"}</td>
      <td className="border-b border-slate-100 px-3 py-2.5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(); }} className="h-8 cursor-pointer rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Ouvrir</button>
          <button type="button" disabled={saving} onClick={(event) => { event.stopPropagation(); onUpdate({ status: "contacted" }); }} className="h-8 cursor-pointer rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Contacte</button>
          <button type="button" disabled={saving} onClick={(event) => { event.stopPropagation(); onUpdate({ status: "closed" }); }} className="h-8 cursor-pointer rounded-md border border-rose-200 bg-rose-50 px-2 text-xs font-medium text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50">Non</button>
        </div>
      </td>
    </tr>
  );
}

function ProspectModal({
  row,
  saving,
  onClose,
  onUpdate,
}: {
  row: ProspectRow;
  saving: boolean;
  onClose: () => void;
  onUpdate: (patch: Partial<Prospect>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-3 py-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{row.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{ORIGIN_LABELS[row.origin]} - {formatDate(row.createdAt, true)}</p>
          </div>
          <button type="button" onClick={onClose} className="h-8 cursor-pointer rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">Fermer</button>
        </div>

        <div className="grid gap-3 p-4">
          <section className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-2">
            <Info label="Email" value={row.email || "-"} />
            <Info label="Telephone" value={row.phone || "-"} />
            <Info label="Formation" value={row.formationTitle || "-"} />
            <TextEdit label="Departement" value={row.department || ""} disabled={saving} onCommit={(value) => onUpdate({ department: value })} />
            <div className="flex flex-wrap gap-2 md:col-span-2">
              {row.email && <ContactButton href={`mailto:${row.email}`} icon={Mail} label="Email" />}
              {row.phone && <ContactButton href={`tel:${row.phone.replace(/\s/g, "")}`} icon={Phone} label="Appel" />}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 p-3">
            <h4 className="text-xs font-semibold uppercase text-slate-500">Statut</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              <SimpleToggle active={row.status === "new"} disabled={saving} onClick={() => onUpdate({ status: "new" })}>Nouveau</SimpleToggle>
              <SimpleToggle active={row.status === "to_contact"} disabled={saving} onClick={() => onUpdate({ status: "to_contact" })}>A relancer</SimpleToggle>
              <SimpleToggle active={row.status === "contacted"} disabled={saving} onClick={() => onUpdate({ status: "contacted" })}>Contacte</SimpleToggle>
              <SimpleToggle active={row.qualification === "hot"} disabled={saving} onClick={() => onUpdate({ qualification: row.qualification === "hot" ? "warm" : "hot", priority: row.qualification === "hot" ? "normal" : "high" })}>Tres chaud</SimpleToggle>
              <SimpleToggle active={row.status === "closed"} disabled={saving} onClick={() => onUpdate({ status: "closed" })}>Refuse / non</SimpleToggle>
              <SimpleToggle active={row.status === "registered"} disabled={saving} onClick={() => onUpdate({ status: "registered" })}>Inscrit</SimpleToggle>
            </div>
          </section>

          {row.message && (
            <section className="rounded-md border border-slate-200 p-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500">Message formulaire</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">{row.message}</p>
            </section>
          )}

          <section className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">SMS / appels</span>
              <textarea defaultValue={row.smsNotes || ""} disabled={saving} onBlur={(event) => { if ((row.smsNotes || "") !== event.target.value) onUpdate({ smsNotes: event.target.value }); }} className="h-24 w-full resize-none rounded-md border border-slate-200 px-3 py-2 outline-none" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Notes</span>
              <textarea defaultValue={row.notes || ""} disabled={saving} onBlur={(event) => { if ((row.notes || "") !== event.target.value) onUpdate({ notes: event.target.value }); }} className="h-24 w-full resize-none rounded-md border border-slate-200 px-3 py-2 outline-none" />
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof UserRoundCheck; label: string; value: string; detail: string }) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function FormationChips({ value, formations, onChange }: { value: string; formations: string[]; onChange: (value: string) => void }) {
  if (!formations.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={value === "all"} onClick={() => onChange("all")}>Toutes formations</Chip>
      {formations.map((formation) => (
        <Chip key={formation} active={value === formation} onClick={() => onChange(formation)}>{formation}</Chip>
      ))}
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={["h-8 cursor-pointer rounded-md border px-3 text-xs font-medium", active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"].join(" ")}>
      {children}
    </button>
  );
}

function FilterSelect({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 min-w-40 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400">
      {children}
    </select>
  );
}

function TH({ children }: { children: ReactNode }) {
  return <th className="border-b border-slate-200 px-3 py-2">{children}</th>;
}

function StatusPill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "rose" | "gray" }) {
  const cls = {
    slate: "bg-slate-100 text-slate-700",
    rose: "bg-rose-50 text-rose-700",
    gray: "bg-slate-200 text-slate-600",
  }[tone];
  return <span className={["rounded-full px-2 py-0.5 text-[11px] font-medium", cls].join(" ")}>{children}</span>;
}

function SimpleToggle({ active, children, disabled, onClick }: { active: boolean; children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={["h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50", active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"].join(" ")}>
      {children}
    </button>
  );
}

function ContactButton({ href, icon: Icon, label }: { href: string; icon: typeof Mail; label: string }) {
  return (
    <a href={href} className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
    </div>
  );
}

function TextEdit({ label, value, disabled, onCommit }: { label: string; value: string; disabled: boolean; onCommit: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input value={draft} disabled={disabled} onChange={(event) => setDraft(event.target.value)} onBlur={() => { if (draft !== value) onCommit(draft); }} className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none disabled:bg-slate-50" />
    </label>
  );
}
