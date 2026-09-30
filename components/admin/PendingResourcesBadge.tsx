"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Resources and training times proposed by trainers and waiting for review, shown next to "Ressources" in the admin menu. */
export function PendingResourcesBadge() {
  const [resources, setResources] = useState(0);
  const [times, setTimes] = useState(0);
  useEffect(() => {
    const pending = (name: string, set: (count: number) => void) =>
      onSnapshot(query(collection(db, name), where("status", "==", "pending")), (snapshot) => set(snapshot.size), () => set(0));
    const stopResources = pending("guideResources", setResources);
    const stopTimes = pending("trainingTimes", setTimes);
    return () => { stopResources(); stopTimes(); };
  }, []);
  const count = resources + times;
  if (!count) return null;
  return <span title={`${count} proposition${count > 1 ? "s" : ""} à valider`} className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#f5ef72] px-1.5 text-[11px] font-bold text-[#1a1530]">{count}</span>;
}
