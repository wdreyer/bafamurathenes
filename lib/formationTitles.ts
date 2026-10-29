const MONTH_WORDS = /\b(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre|printemps|automne|hiver|[eé]t[eé])\b/gi;

// Keeps the session's own label (e.g. "Toussaint", "AVRIL 2027") after the normalized type prefix.
const sessionSuffix = (title: string, prefix: RegExp) =>
  title
    .replace(prefix, "")
    .replace(/^[\s\-–—·:|]+/, "")
    .trim()
    .replace(MONTH_WORDS, (word) => word.toLowerCase());

export function cleanFormationTitle(value?: string | null) {
  const title = (value || "").trim();
  if (!title) return "";

  const lower = title.toLowerCase();
  const plain = lower
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\?/g, "e");

  if (plain.includes("approfondissement") || plain.includes("appro")) {
    const suffix = sessionSuffix(title, /^.*?\bappro(fondissement)?\b/i);
    return suffix ? `Appro ${suffix}` : "Approfondissement";
  }

  if (plain.includes("formation") && (plain.includes("generale") || plain.includes("genrale"))) {
    const suffix = sessionSuffix(title, /^.*?\bformation\s+g\S*rale\b/i);
    return suffix ? `Formation générale ${suffix}` : "Formation générale";
  }

  return title
    .replace(/G\?n\?rale/gi, "Générale")
    .replace(/GÃƒÂ©nÃƒÂ©rale/gi, "Générale")
    .replace(/gÃƒÂ©nÃƒÂ©rale/gi, "générale");
}
