// components/Header.tsx
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="top-0 z-30 border-b border-sky-100 bg-amber-50/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-1 md:py-1">
        {/* Logo + titre à gauche */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/MT.png"
            alt="Logo BAFA Murathènes"
            width={50}
            height={50}
            className="h-10 w-auto md:h-12 md:w-auto"
          />

          <div className="flex flex-col leading-tight">
            <span className="text-[0.9rem] md:text-xs font-semibold uppercase tracking-[0.05em] text-sky-800">
              Formations BAFA
            </span>
            <span className="text-m md:text-lg font-semibold uppercase text-[#6668C6]">
              Murathènes
            </span>
          </div>
        </Link>

        {/* Menu + CTA à droite */}
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 md:gap-8 text-sm md:text-base font-semibold tracking-[0.08em] uppercase text-slate-700 md:flex">
            <Link
              href="/"
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Accueil
            </Link>
            <Link
              href="/bafa"
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Le BAFA
            </Link>
            <Link
              href="/formations
            "
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Nos formations 2026
            </Link>
            <Link
              href="/infos"
              className="relative whitespace-nowrap transition hover:text-sky-900 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-sky-800 after:transition-all after:duration-200 hover:after:w-full"
            >
              Infos pratiques
            </Link>
          </nav>
<Link
  href="#reservation"
  className="relative whitespace-nowrap rounded-full text-red-700 px-4 py-2 text-sm md:text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-150 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6668C6] focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50
    after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-red-600 after:transition-all after:duration-150 hover:after:w-full"
>
  Je m&apos;inscris
</Link>

        </div>
      </div>
    </header>
  );
}
