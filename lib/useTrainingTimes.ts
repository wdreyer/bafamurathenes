"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TrainingCatalogItem } from "@/lib/trainingCatalog";

export function useTrainingTimes() {
  const [times, setTimes] = useState<TrainingCatalogItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(collection(db, "trainingTimes"), (snapshot) => {
    setTimes(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as TrainingCatalogItem)));
    setError("");
  }, () => setError("Impossible de charger les temps ajoutés au guide.")), []);

  return { times, error };
}
