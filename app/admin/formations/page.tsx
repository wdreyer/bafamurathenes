"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Formation } from "@/lib/types";
import { FormationsTable } from "@/components/admin/formations/FormationsTable";
import { Button } from "@/components/ui/Button";

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);

  useEffect(() => {
    const q = query(collection(db, "formations"), orderBy("startDate", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Formation[] = snapshot.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          ...d,
        } as Formation;
      });
      setFormations(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Formations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérer les sessions de formation, leurs dates, prix et participants.
          </p>
        </div>
        <Link href="/admin/formations/new">
          <Button>+ Nouvelle formation</Button>
        </Link>
      </div>

      <FormationsTable formations={formations} />
    </main>
  );
}
