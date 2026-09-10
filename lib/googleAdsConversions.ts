"use client";

import { cleanFormationTitle } from "@/lib/formationTitles";

export const GOOGLE_ADS_LEAD_CONVERSION = "AW-17976361031/2jh2COuTqaccEMeA5vtC";

type LeadFormation = {
  id?: string;
  title?: string;
  price?: number;
};

type UserData = {
  email?: string;
  phone_number?: string;
};

type WindowWithGoogleTag = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: [string, ...unknown[]]) => void;
};

export function normalizeEnhancedConversionEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email || !email.includes("@")) return "";

  const [localPart, domain] = email.split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return `${localPart.replace(/\./g, "")}@${domain}`;
  }

  return email;
}

export function normalizeFrenchPhoneToE164(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  if (raw.startsWith("+")) {
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 11 && digits.length <= 15 ? `+${digits}` : "";
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00") && digits.length >= 12 && digits.length <= 16) return `+${digits.slice(2)}`;
  if (digits.startsWith("33") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+33${digits.slice(1)}`;

  return digits.length >= 11 && digits.length <= 15 ? `+${digits}` : "";
}

function enhancedConversionUserData(email: string, phone: string): UserData {
  return {
    ...(email && { email: normalizeEnhancedConversionEmail(email) }),
    ...(phone && { phone_number: normalizeFrenchPhoneToE164(phone) }),
  };
}

function hasUserData(userData: UserData) {
  return Boolean(userData.email || userData.phone_number);
}

function conversionValue(formation?: LeadFormation) {
  const price = Number(formation?.price);
  return Number.isFinite(price) && price > 0 ? price : 1;
}

export function reportGoogleAdsLeadConversion({
  email,
  phone,
  leadType,
  formation,
}: {
  email: string;
  phone: string;
  leadType: string;
  formation?: LeadFormation;
}) {
  if (typeof window === "undefined") return;

  const win = window as WindowWithGoogleTag;
  const userData = enhancedConversionUserData(email, phone);
  const includeUserData = hasUserData(userData);
  const eventParams = {
    event_category: "lead",
    event_label: leadType,
    lead_type: leadType,
    formation_id: formation?.id || "",
    formation_title: formation?.title ? cleanFormationTitle(formation.title) : "",
    value: conversionValue(formation),
    currency: "EUR",
    ...(includeUserData && { user_data: userData }),
  };

  win.dataLayer = win.dataLayer || [];
  if (includeUserData) {
    win.dataLayer.push({
      event: "lead_user_data",
      leadsUserData: userData,
      user_data: userData,
    });
  }

  if (!win.gtag) {
    win.dataLayer.push({ event: "generate_lead", ...eventParams });
    return;
  }

  if (includeUserData) {
    win.gtag("set", "user_data", userData);
  }

  win.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_LEAD_CONVERSION,
    ...eventParams,
  });
  win.gtag("event", "generate_lead", eventParams);
}
