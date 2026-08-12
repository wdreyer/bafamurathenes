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
  formationTitle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: "card" | "transfer" | "cash" | "check" | "installments" | "other";
  paymentStatus?: "pending" | "partial" | "paid" | "refunded" | "cancelled";
  paid: boolean;
  validationStatus?: "pending" | "validated" | "cancelled";
  amount?: number;
  totalPrice?: number;
  amountPaid?: number;
  cafAid?: boolean;
  cafAidAmount?: number;
  otherAidAmount?: number;
  installmentPlan?: boolean;
  installmentCount?: number;
  installmentAmount?: number;
  nextPaymentDate?: string;
  notes?: string;
  source?: string;
  tariff?: string;
  yaplaStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ProspectStatus = "new" | "to_contact" | "contacted" | "registered" | "closed";

export type Prospect = {
  id: string;
  origin: "contact_form" | "aides_form" | "yapla" | "manual" | "inscription";
  leadType: string;
  priority?: "low" | "normal" | "high";
  preferredContact?: "email" | "phone" | "any";
  nextFollowUpDate?: string;
  qualification?: "cold" | "warm" | "hot";
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  pageUrl?: string;
  source?: string;
  department?: string;
  quotient?: string;
  formationId?: string;
  formationTitle?: string;
  yaplaUrl?: string;
  status?: ProspectStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
