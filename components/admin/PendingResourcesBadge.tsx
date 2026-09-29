"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Number of trainer resource proposals waiting for review, shown next to "Ressources" in the admin menu. */
export function PendingResourcesBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => onSnapshot(query(collection(db, "guideResources"), where("status", "==", "pending")),
    (snapshot) => setCount(snapshot.size), () => setCount(0)), []);
  if (!count) return null;
  return <span title={`${count} ressource${count > 1 ? "s" : ""} à valider`} className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#f5ef72] px-1.5 text-[11px] font-bold text-[#1a1530]">{count}</span>;
}
