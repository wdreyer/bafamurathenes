export function cleanFormationTitle(value?: string | null) {
  const title = (value || "").trim();
  if (!title) return "";

  const lower = title.toLowerCase();
  const plain = lower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\?/g, "e");

  if (plain.includes("approfondissement") || plain.includes("appro")) {
    return "Appro Toussaint";
  }

  if (plain.includes("formation") && (plain.includes("generale") || plain.includes("genrale"))) {
    return "Formation g\u00e9n\u00e9rale Toussaint";
  }

  return title
    .replace(/G\?n\?rale/gi, "G\u00e9n\u00e9rale")
    .replace(/GÃƒÂ©nÃƒÂ©rale/gi, "G\u00e9n\u00e9rale")
    .replace(/gÃƒÂ©nÃƒÂ©rale/gi, "g\u00e9n\u00e9rale");
}
