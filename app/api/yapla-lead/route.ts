import { NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { formationId, formationTitle, yaplaUrl, pageUrl } = await req.json();

    if (!formationId && !formationTitle && !yaplaUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await addDoc(collection(db, "prospects"), {
      origin: "yapla",
      leadType: "Inscription Yapla demarree",
      formationId: formationId ? String(formationId) : "",
      formationTitle: formationTitle ? String(formationTitle) : "",
      yaplaUrl: yaplaUrl ? String(yaplaUrl) : "",
      pageUrl: pageUrl ? String(pageUrl) : "",
      source: "Ouverture formulaire Yapla",
      status: "to_contact",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[yapla-lead] Caught exception:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
