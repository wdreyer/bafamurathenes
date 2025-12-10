// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-amber-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            BAFA Murathènes
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Formations BAFA en Auvergne dans un cadre chaleureux et exigeant.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-700">
          <Link
            href="mailto:bafa@murathenes.org"
            className="hover:text-sky-800 transition"
          >
            bafa@murathenes.org
          </Link>
          <span className="hidden text-sky-200 md:inline">•</span>
          <span>01 84 21 05 48</span>
          <span className="hidden text-sky-200 md:inline">•</span>
          <Link
            href="https://www.instagram.com/murathenes.asso"
            className="hover:text-sky-800 transition"
          >
            @murathenes.asso
          </Link>
        </div>

        <p className="text-[0.7rem] text-slate-500">
          © {new Date().getFullYear()} Murathènes — Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
