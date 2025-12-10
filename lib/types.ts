// lib/types.ts

export type FormationType =
  | "formation_generale"
  | "approfondissement_sejour_etranger";

export type TransportOption = {
  label: string;   // ex: "Depuis Clermont-Ferrand", "Depuis Paris"
  price: number;   // prix en €
};

export type Formation = {
  id: string;
  type: FormationType;
  title: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  description: string;
  price: number;                    // prix de la formation (hors transport)
  transportOptions?: TransportOption[]; // <-- NOUVEAU
  inscriptionsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Inscription = {
  id: string;
  formationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: "card" | "transfer" | "cash" | "other";
  paid: boolean;
  createdAt?: Date;
};
