"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type {
  Formation,
  FormationType,
  TransportOption,
} from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Props = {
  initialData?: Formation;
  formationId?: string;
  onSaved?: () => void;
};

const TYPES: { value: FormationType; label: string }[] = [
  { value: "formation_generale", label: "Formation générale" },
  {
    value: "approfondissement_sejour_etranger",
    label: "Approfondissement Séjours à l'étranger / échanges de jeunes",
  },
];

export function FormationForm({ initialData, formationId, onSaved }: Props) {
  const [type, setType] = useState<FormationType>(
    initialData?.type ?? "formation_generale",
  );
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [startDate, setStartDate] = useState(initialData?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialData?.endDate ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [price, setPrice] = useState(initialData?.price ?? 0);

  // 🔹 NOUVEAU : options de transport
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>(
    initialData?.transportOptions ?? [],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initialData;

  // helpers pour les options de transport
  const addTransportOption = () => {
    setTransportOptions((prev) => [
      ...prev,
      { label: "", price: 0 },
    ]);
  };

  const removeTransportOption = (index: number) => {
    setTransportOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTransportOption = (
    index: number,
    field: "label" | "price",
    value: string,
  ) => {
    setTransportOptions((prev) =>
      prev.map((opt, i) =>
        i === index
          ? {
              ...opt,
              [field]:
                field === "price" ? Number(value) || 0 : value,
            }
          : opt,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // On nettoie les options vides
    const cleanedTransportOptions = transportOptions
      .filter((opt) => opt.label.trim() !== "")
      .map((opt) => ({
        ...opt,
        price: Number(opt.price) || 0,
      }));

    try {
      if (isEdit && formationId) {
        const ref = doc(db, "formations", formationId);
        await updateDoc(ref, {
          type,
          title,
          startDate,
          endDate,
          imageUrl,
          description,
          price,
          transportOptions: cleanedTransportOptions,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "formations"), {
          type,
          title,
          startDate,
          endDate,
          imageUrl,
          description,
          price,
          transportOptions: cleanedTransportOptions,
          inscriptionsCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      onSaved?.();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement de la formation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border border-slate-200 bg-white p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as FormationType)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex: Formation BAFA approfondissement surf"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="imageUrl">URL de la photo</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs text-slate-500">
            Plus tard, on pourra remplacer ça par un vrai upload vers Firebase
            Storage.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez le contenu, les objectifs pédagogiques, le public visé..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prix de la formation (€)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">
            Prix de la formation (hors transport).
          </p>
        </div>

        {/* 🔹 Bloc options de transport */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label>Options de transport (facultatif)</Label>
            <Button
              type="button"
              variant="secondary"
              className="h-8 px-2 text-xs"
              onClick={addTransportOption}
            >
              + Ajouter une option
            </Button>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Par exemple : &quot;Depuis Clermont-Ferrand&quot;, &quot;Depuis
            Paris&quot;… avec le prix du trajet en plus de la formation.
          </p>

          {transportOptions.length === 0 && (
            <p className="text-xs text-slate-400">
              Aucune option pour l&apos;instant.
            </p>
          )}

          <div className="space-y-2">
            {transportOptions.map((opt, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 md:flex-row md:items-center"
              >
                <div className="flex-1 space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Libellé
                  </Label>
                  <Input
                    value={opt.label}
                    onChange={(e) =>
                      updateTransportOption(index, "label", e.target.value)
                    }
                    placeholder="Ex: Depuis Clermont-Ferrand"
                  />
                </div>
                <div className="w-full md:w-40 space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Prix (€)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={opt.price}
                    onChange={(e) =>
                      updateTransportOption(index, "price", e.target.value)
                    }
                  />
                </div>
                <div className="flex justify-end md:self-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2 text-xs text-red-600"
                    onClick={() => removeTransportOption(index)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Enregistrement..."
            : isEdit
            ? "Mettre à jour la formation"
            : "Créer la formation"}
        </Button>
      </div>
    </form>
  );
}
