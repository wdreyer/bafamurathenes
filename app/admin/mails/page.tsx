"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { Mail, Paperclip, Search, Send, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { cleanFormationTitle } from "@/lib/formationTitles";
import type { Inscription, Prospect, ProspectStatus } from "@/lib/types";

type RecipientKind = "prospect" | "inscription";
type Target = "all" | RecipientKind | "hot" | "refused";

type Attachment = {
  name: string;
  content: string;
};

type Recipient = {
  id: string;
  kind: RecipientKind;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  formationTitle?: string;
  status: ProspectStatus | "validated" | "pending" | "paid" | "unpaid";
  hot?: boolean;
  createdAt?: unknown;
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  to_contact: "A relancer",
  contacted: "Contacte",
  closed: "Refuse / non",
  registered: "Inscrit",
  validated: "Inscription validee",
  pending: "Inscription en cours",
  paid: "Payee",
  unpaid: "Non payee",
};

function normalize(value?: string) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function splitEmails(value?: string) {
  return String(value || "")
    .split(/[,\s/;]+/)
    .map((email) => email.trim())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function prospectName(prospect: Prospect) {
  return (
    prospect.name ||
    [prospect.firstName, prospect.lastName].filter(Boolean).join(" ") ||
    prospect.email ||
    "Contact sans nom"
  );
}

function inscriptionName(inscription: Inscription) {
  return [inscription.firstName, inscription.lastName].filter(Boolean).join(" ") || inscription.email || "Inscription sans nom";
}

export default function AdminMailsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [target, setTarget] = useState<Target>("all");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("Votre formation BAFA avec Murathenes");
  const [message, setMessage] = useState(
    "Bonjour {{prenom}},\n\nJe reviens vers vous concernant votre projet BAFA avec Murathenes.\n\nFormation : {{formation}}\nDepartement : {{departement}}\n\nJe reste disponible si vous avez besoin d'informations ou de documents.\n\nA bientot,\nWilliam",
  );
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const unsubProspects = onSnapshot(query(collection(db, "prospects"), orderBy("createdAt", "desc")), (snapshot) => {
      setProspects(snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<Prospect, "id">) })));
    });
    const unsubInscriptions = onSnapshot(query(collection(db, "inscriptions"), orderBy("createdAt", "desc")), (snapshot) => {
      setInscriptions(snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<Inscription, "id">) })));
    });
    return () => {
      unsubProspects();
      unsubInscriptions();
    };
  }, []);

  const recipients = useMemo<Recipient[]>(() => {
    const prospectRecipients = prospects.flatMap((prospect) =>
      splitEmails(prospect.email).map((email) => ({
        id: prospect.id,
        kind: "prospect" as const,
        name: prospectName(prospect),
        email,
        phone: prospect.phone,
        department: prospect.department,
        formationTitle: cleanFormationTitle(prospect.formationTitle || ""),
        status: prospect.status || "new",
        hot: prospect.qualification === "hot" || prospect.priority === "high",
        createdAt: prospect.createdAt,
      })),
    );

    const inscriptionRecipients = inscriptions.flatMap((inscription) => {
      const paymentStatus: Recipient["status"] = inscription.paid || inscription.paymentStatus === "paid" ? "paid" : "unpaid";
      return splitEmails(inscription.email).map((email) => ({
        id: inscription.id,
        kind: "inscription" as const,
        name: inscriptionName(inscription),
        email,
        phone: inscription.phone,
        department: "",
        formationTitle: cleanFormationTitle(inscription.formationTitle || ""),
        status: paymentStatus,
        createdAt: inscription.createdAt,
      }));
    });

    const seen = new Set<string>();
    return [...prospectRecipients, ...inscriptionRecipients].filter((recipient) => {
      const key = recipient.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [inscriptions, prospects]);

  const departments = useMemo(
    () => Array.from(new Set(recipients.map((recipient) => recipient.department).filter(Boolean))).sort() as string[],
    [recipients],
  );

  const statuses = useMemo(
    () => Array.from(new Set(recipients.map((recipient) => recipient.status))).sort(),
    [recipients],
  );

  const filteredRecipients = useMemo(() => {
    const term = normalize(search);
    return recipients.filter((recipient) => {
      const matchesTarget =
        target === "all" ||
        recipient.kind === target ||
        (target === "hot" && recipient.hot) ||
        (target === "refused" && recipient.status === "closed");
      const matchesStatus = status === "all" || recipient.status === status;
      const matchesDepartment = department === "all" || recipient.department === department;
      const haystack = normalize([recipient.name, recipient.email, recipient.phone, recipient.department, recipient.formationTitle].filter(Boolean).join(" "));
      return matchesTarget && matchesStatus && matchesDepartment && (!term || haystack.includes(term));
    });
  }, [department, recipients, search, status, target]);

  async function handleAttachmentFiles(files: FileList | null) {
    if (!files?.length) return;
    const selected = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, content: String(reader.result || "").replace(/^data:[^;]+;base64,/, "") });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
    setAttachments((current) => [...current, ...selected].slice(0, 4));
  }

  async function sendCampaign(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    if (!filteredRecipients.length || !subject.trim() || !message.trim()) return;

    setSending(true);
    try {
      const response = await fetch("/api/admin/send-prospect-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminCode: process.env.NEXT_PUBLIC_ADMIN_CODE,
          subject,
          message,
          attachments,
          recipients: filteredRecipients.map((recipient) => ({
            email: recipient.email,
            name: recipient.name,
            department: recipient.department || "",
            formationTitle: recipient.formationTitle || "",
            status: recipient.status,
            kind: recipient.kind,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setResult(payload.error || "Envoi impossible.");
        return;
      }
      setResult(`${payload.sent} mail(s) envoye(s), ${payload.failed} echec(s).`);

      await Promise.all(
        filteredRecipients
          .filter((recipient) => recipient.kind === "prospect" && recipient.status !== "closed")
          .map((recipient) =>
            updateDoc(doc(db, "prospects", recipient.id), {
              status: "contacted",
              updatedAt: serverTimestamp(),
            }),
          ),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mails</h1>
        <p className="mt-1 text-sm text-slate-500">Campagnes personnalisees avec bafa@murathenes.org, filtres et pieces jointes.</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users className="h-4 w-4" />
              Destinataires
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{filteredRecipients.length}</span>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, email, departement..." className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none" />
          </label>
          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            <Select value={target} onChange={(value) => setTarget(value as Target)}>
              <option value="all">Tous</option>
              <option value="prospect">Prospects</option>
              <option value="inscription">Inscrits</option>
              <option value="hot">Tres chauds</option>
              <option value="refused">Refuses</option>
            </Select>
            <Select value={status} onChange={setStatus}>
              <option value="all">Tous statuts</option>
              {statuses.map((item) => (
                <option key={item} value={item}>{STATUS_LABELS[item] || item}</option>
              ))}
            </Select>
            <Select value={department} onChange={setDepartment}>
              <option value="all">Tous departements</option>
              {departments.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
          <div className="max-h-[520px] overflow-y-auto rounded-md border border-slate-200">
            {filteredRecipients.slice(0, 160).map((recipient) => (
              <div key={`${recipient.kind}-${recipient.id}-${recipient.email}`} className="border-b border-slate-100 px-3 py-2 text-sm last:border-b-0">
                <div className="font-medium text-slate-900">{recipient.name}</div>
                <div className="text-xs text-slate-500">{recipient.email}</div>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-slate-500">
                  <span>{recipient.kind === "inscription" ? "Inscrit" : "Prospect"}</span>
                  <span>{STATUS_LABELS[recipient.status] || recipient.status}</span>
                  {recipient.department && <span>Dept {recipient.department}</span>}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <form onSubmit={sendCampaign} className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Mail className="h-4 w-4" />
            Message
          </div>
          <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Sujet" className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none" />
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-[300px] w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 outline-none" />
          <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Variables disponibles : {"{{prenom}}"}, {"{{nom}}"}, {"{{formation}}"}, {"{{departement}}"}, {"{{statut}}"}.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Paperclip className="h-4 w-4" />
              Joindre RIB / document BAFA
              <input type="file" multiple className="hidden" onChange={(event) => handleAttachmentFiles(event.target.files)} />
            </label>
            {attachments.map((attachment) => (
              <button key={attachment.name} type="button" onClick={() => setAttachments((current) => current.filter((item) => item.name !== attachment.name))} className="h-8 cursor-pointer rounded-md bg-slate-100 px-2 text-xs text-slate-700 hover:bg-slate-200">
                {attachment.name} x
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="text-sm text-slate-500">{filteredRecipients.length} destinataire(s)</div>
            <button type="submit" disabled={sending || filteredRecipients.length === 0} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" />
              {sending ? "Envoi..." : "Envoyer"}
            </button>
          </div>
          {result && <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{result}</div>}
        </form>
      </section>
    </main>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm outline-none">
      {children}
    </select>
  );
}
