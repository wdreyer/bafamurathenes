import { doc, getDoc, getDocs, collection, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const metadata = await getDoc(doc(db, "guideFiles", id));
  if (!metadata.exists()) return new Response("Fichier introuvable", { status: 404 });

  const chunks = await getDocs(query(collection(db, "guideFiles", id, "chunks"), orderBy("index", "asc")));
  if (chunks.empty || chunks.size !== Number(metadata.data().chunkCount)) {
    return new Response("Fichier incomplet", { status: 503 });
  }
  const body = Buffer.concat(chunks.docs.map((entry) => Buffer.from(String(entry.data().data), "base64")));
  const name = String(metadata.data().name || "document").replace(/[\r\n"]/g, "");
  return new Response(body, {
    headers: {
      "Content-Type": String(metadata.data().contentType || "application/octet-stream"),
      "Content-Length": String(body.length),
      "Content-Disposition": `inline; filename="${name}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
