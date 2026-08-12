export function cleanFormationTitle(value?: string | null) {
  const title = (value || "").trim();
  if (!title) return "";

  const lower = title.toLowerCase();
  const plain = lower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\?/g, "e");
  const year = title.match(/\b20\d{2}\b/)?.[0];
  const suffix = [
    plain.includes("toussaint") ? "Toussaint" : "",
    year,
  ].filter(Boolean).join(" ");

  if (plain.includes("approfondissement") || plain.includes("appro")) {
    return ["Approfondissement", suffix].filter(Boolean).join(" ");
  }

  if (plain.includes("formation") && (plain.includes("generale") || plain.includes("genrale"))) {
    return ["Formation Générale", suffix].filter(Boolean).join(" ");
  }

  return title
    .replace(/G\?n\?rale/gi, "Générale")
    .replace(/GÃ©nÃ©rale/gi, "Générale")
    .replace(/gÃ©nÃ©rale/gi, "générale");
}
