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
  trainerIds?: string[];
};

export type Trainer = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  notes?: string;
  accountUid?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  birthDate?: string;
  birthPlace?: string;
  hasSocialSecurityNumber?: boolean;
  socialSecurityNumberPath?: string;
  address?: string;
  diplomaUrl?: string;
  diplomaPath?: string;
  diplomaName?: string;
  identityDocumentUrl?: string;
  identityDocumentPath?: string;
  identityDocumentName?: string;
  /** Diplomas and other files, each with the name given by the trainer. */
  documents?: TrainerDocument[];
  profileComplete?: boolean;
  approvedAt?: Date;
};

export type TrainerDocument = {
  id: string;
  label: string;
  fileName: string;
  /** Storage path; empty for very old entries that only have a download link. */
  path: string;
  url?: string;
  contentType?: string;
  uploadedAt?: string;
};

export type PlanActivity = {
  id: string;
  day: number;
  start: string;
  end: string;
  title: string;
  content: string;
  trainerIds: string[];
  resourceId?: string;
  catalogId?: string;
  catalogCategory?: TrainingTimeCategory;
  catalogScope?: TrainingTimeScope;
  themeId?: string;
  color: "mint" | "coral" | "sky" | "lemon" | "lilac" | "neutral";
  merged?: boolean;
  /** Emoji shown in the cell; undefined picks one from the title, "none" shows nothing. */
  icon?: string;
  /** Edit window only, never saved: the days the time should cover (several days make one merged cell). */
  span?: { from: number; to: number };
};

/** Reusable planning without dates (J1 to J7/J9), managed by admins only. */
export type PlanningTemplate = {
  id: string;
  title: string;
  formationType: FormationType;
  activities: PlanActivity[];
  themes?: PlanTheme[];
  /** Formation it was copied from, if any. */
  sourceFormationId?: string;
  updatedAt?: { toMillis?: () => number };
};

export type PlanTheme = {
  id: string;
  name: string;
  color: PlanActivity["color"];
};

/** Rubrique id: one of the built-in ones (cadre, pedagogie, animation, vie, interculturel, bilan) or one created by an admin. */
export type TrainingTimeCategory = string;
export type TrainingTimeScope = "general" | "appro" | "both";

export type Inscription = {
  id: string;
  formationId: string;
  formationTitle?: string;
  registrationCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  responsibleFirstName?: string;
  responsibleLastName?: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  prospectId?: string;
  paymentMethod: "card" | "transfer" | "cash" | "check" | "installments" | "other";
  paymentStatus?: "pending" | "partial" | "paid" | "refunded" | "cancelled";
  paid: boolean;
  validationStatus?: "pending" | "validated" | "cancelled";
  registrationFormSent?: boolean;
  convocationSent?: boolean;
  amount?: number;
  totalPrice?: number;
  amountPaid?: number;
  cafAid?: boolean;
  cafStatus?:
    | "not_requested"
    | "murathenes_document"
    | "family_document"
    | "sent"
    | "approved"
    | "requested"
    | "paid"
    | "rejected";
  cafAidAmount?: number;
  cafRequestedAmount?: number;
  cafApprovedAmount?: number;
  cafPaidAmount?: number;
  cafPaymentDate?: string;
  otherAidAmount?: number;
  installmentPlan?: boolean;
  paymentSchedule?: "one_time" | "two_times" | "three_times" | "custom";
  installmentCount?: number;
  installmentAmount?: number;
  installment1Amount?: number;
  installment1Paid?: boolean;
  installment1Date?: string;
  installment2Amount?: number;
  installment2Paid?: boolean;
  installment2Date?: string;
  installment3Amount?: number;
  installment3Paid?: boolean;
  installment3Date?: string;
  nextPaymentDate?: string;
  transferReference?: string;
  transferReceivedAt?: string;
  notes?: string;
  trainerNotes?: string;
  traineeGroupNumber?: number | null;
  starterNotes?: string;
  participationNotes?: string;
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
  smsNotes?: string;
  callbackMoment?: string;
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
