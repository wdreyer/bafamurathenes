"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  mergeGuideCategories,
  mergeGuideResources,
  type GuideCategoryRecord,
  type GuideResourceRecord,
} from "@/lib/guideLibrary";

export function useGuideLibrary() {
  const [customCategories, setCustomCategories] = useState<GuideCategoryRecord[]>([]);
  const [customResources, setCustomResources] = useState<GuideResourceRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let categoriesLoaded = false;
    let resourcesLoaded = false;
    const done = () => {
      if (categoriesLoaded && resourcesLoaded) setLoading(false);
    };
    const unsubscribeCategories = onSnapshot(collection(db, "guideCategories"), (snapshot) => {
      setCustomCategories(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as GuideCategoryRecord)));
      categoriesLoaded = true;
      setError("");
      done();
    }, () => {
      categoriesLoaded = true;
      setError("Impossible de charger les catégories personnalisées.");
      done();
    });
    const unsubscribeResources = onSnapshot(collection(db, "guideResources"), (snapshot) => {
      setCustomResources(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as GuideResourceRecord)));
      resourcesLoaded = true;
      setError("");
      done();
    }, () => {
      resourcesLoaded = true;
      setError("Impossible de charger les ressources personnalisées.");
      done();
    });
    return () => {
      unsubscribeCategories();
      unsubscribeResources();
    };
  }, []);

  const categories = useMemo(() => mergeGuideCategories(customCategories), [customCategories]);
  const resources = useMemo(() => mergeGuideResources(customResources), [customResources]);
  return { categories, resources, customCategories, customResources, loading, error };
}
