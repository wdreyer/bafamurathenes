import { NextResponse } from "next/server";
import { createProspect } from "@/lib/server/prospectUpsert";

export async function POST(req: Request) {
  try {
    const { prenom, nom, email, telephone, departement, quotient, source, formationId, formationTitle } =
      await req.json();

    if (!prenom || !nom || !email || !telephone || !departement || !quotient || !formationId || !formationTitle) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await createProspect({
      origin: "aides_form",
      leadType: "Demande d'estimation aides",
      firstName: String(prenom).trim(),
      lastName: String(nom).trim(),
      name: `${String(prenom).trim()} ${String(nom).trim()}`.trim(),
      email: String(email).trim(),
      phone: String(telephone).trim(),
      department: String(departement),
      quotient: String(quotient),
      formationId: String(formationId),
      formationTitle: String(formationTitle),
      source: source ? String(source) : "Formulaire aides",
      notes: `Demande d'estimation aides. Formation : ${String(formationTitle)}. Département : ${String(departement)}. QF CAF : ${String(quotient)}.`,
      status: "new",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[aides-lead] Caught exception:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
