"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";

const VIOLET = "#6664C5";
const YELLOW = "#F5EEDA";


function VioletButton({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-sm transition hover:opacity-95"
      style={{ backgroundColor: VIOLET, color: YELLOW }}
    >
      {children}
    </a>
  );
}

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "violet";
}) {
  const base =
    "inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]";
  if (tone === "violet") {
    return (
      <span
        className={`${base} border`}
        style={{
          borderColor: "rgba(102,100,197,0.35)",
          color: VIOLET,
          background: "rgba(102,100,197,0.06)",
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <span className={`${base} border border-slate-200 text-slate-600 bg-white/60`}>
      {children}
    </span>
  );
}

function ActionLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-800 shadow-sm transition hover:bg-white"
    >
      {children}
    </a>
  );
}

/** trait full-bleed */
function FullBleedTopRule() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 w-screen -translate-x-1/2 border-t border-slate-200" />
  );
}

function Section({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative py-10 md:py-12">
      <FullBleedTopRule />
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {kicker}
        </p>
        <h2 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl">
          {title}
        </h2>
      </div>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function SoftMedia({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "overflow-hidden rounded-3xl border border-slate-200 bg-white/60 shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Photo({
  src,
  alt,
  h = "h-64 md:h-[380px]",
  contain = false,
}: {
  src: string;
  alt: string;
  h?: string;
  contain?: boolean;
}) {
  return (
    <SoftMedia>
      <div className={`relative w-full ${h}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className={contain ? "object-contain" : "object-cover"}
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
    </SoftMedia>
  );
}

function KeyRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-[220px_1fr] md:items-start">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="text-sm leading-6 text-slate-800">{value}</div>
    </div>
  );
}

function MiniCarousel({
  images,
  heightClass = "h-64 md:h-[420px]",
}: {
  images: { src: string; alt: string }[];
  heightClass?: string;
}) {
  const [i, setI] = useState(0);
  const hasMany = images.length > 1;
  const prev = () => setI((v) => (v - 1 + images.length) % images.length);
  const next = () => setI((v) => (v + 1) % images.length);

  const current = images[i];

  return (
    <SoftMedia className="relative">
      <div className={`relative w-full ${heightClass}`}>
        <Image src={current.src} alt={current.alt} fill className="object-cover" />
      </div>

      {hasMany && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Photo précédente"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/70 px-3 py-2 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Photo suivante"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/70 px-3 py-2 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-white"
          >
            ›
          </button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 via-slate-900/0 to-transparent" />

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/30 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-800 backdrop-blur">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: VIOLET }} />
        {i + 1}/{images.length}
      </div>
    </SoftMedia>
  );
}

function TransportCard({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/60 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <span
          className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl border text-sm font-semibold"
          style={{
            borderColor: "rgba(102,100,197,0.35)",
            color: VIOLET,
            background: "rgba(102,100,197,0.06)",
          }}
        >
          {n}
        </span>
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

export default function LieuTransportTab() {
  const addressShort = "Domaine de Gravières — 15270 Lanobre (Cantal)";
  const phoneSite = "+33 4 71 40 36 43";
  const phoneBafa = "+33 1 84 21 05 48";

  const mapsLink = useMemo(
    () =>
      "https://www.google.com/maps/search/?api=1&query=Domaine%20de%20Gravi%C3%A8res%20Lanobre",
    []
  );

  const pix = useMemo(
    () => ({
      team: "/PIX/1.webp",
      domaine: "/PIX/2.jpg",
      cantal: "/PIX/3.jpg",
      cuisine: "/PIX/4.JPG",
      salle: "/PIX/5.JPG",
      dehors: "/PIX/60.JPG",
      nuit: "/PIX/7.JPG",
      domaine1:"/infos.jpg"
    }),
    []
  );

  const carouselImages = useMemo(
    () => [
      { src: pix.domaine1, alt: "Paysages du Cantal" },
      { src: pix.domaine, alt: "Le domaine" },
      { src: pix.salle, alt: "Salle d’activité" },
    ],
    [pix]
  );

  const driveTimes = useMemo(
    () => [
      { city: "Clermont-Ferrand", time: "≈1h15", km: "74 km" },
      { city: "Aurillac", time: "≈ 1h30", km: "≈ 84 km" },
      { city: "Ussel", time: "≈ 30 min", km: "≈ 29 km" },
    ],
    []
  );

  return (
    <main className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-transparent">
      {/* HERO */}
<header className="relative">
  <FullBleedTopRule />
  <div className="pointer-events-none absolute left-1/2 bottom-0 w-screen -translate-x-1/2 border-t border-slate-200" />

  <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
    <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Infos pratiques
          </p>

          {/* ✅ Nouveau titre / sous-titre */}
          <h1 className="font-display text-3xl font-semibold text-slate-900 md:text-4xl">
            Lieu &amp; transport
          </h1>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Venir au Domaine de Gravières
          </p>

          {/* ✅ Texte corrigé */}
          <p className="max-w-xl text-sm leading-6 text-slate-700">
            Nos formations BAFA, ainsi que nos autres activités, se déroulent au
            Domaine de Gravières, un lieu mis à la disposition de l’association
            Murathènes.
          </p>
        </div>

        {/* ✅ Adresse en “vraie adresse” (sans chip) */}
        <address className="not-italic text-sm leading-6 text-slate-800">
          <span className="font-semibold text-slate-900">Domaine de Gravières</span>
          <br />
          15270 Lanobre (Cantal)
        </address>

        {/* ✅ Bouton violet “Ouvrir sur Maps”, et suppression “Appeler le domaine” */}
        <div className="flex flex-wrap gap-2">
          <VioletButton href={mapsLink} external>
            Ouvrir sur Maps <span className="text-sm">↗</span>
          </VioletButton>
        </div>
      </div>

      <SoftMedia className="bg-slate-950/5">
        <video
          src="/Video.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="h-full max-h-56 w-full object-cover md:max-h-[380px]"
        />
      </SoftMedia>
    </div>
  </div>
</header>


      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* COMMENT VENIR */}
<Section kicker="Transport" title="Comment venir">
  {/* TRAIN */}
{/* TRAIN */}
<div className="rounded-3xl border border-slate-200 bg-white/60 shadow-sm">
  <div className="p-5 md:p-6">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-lg" aria-hidden>
        🚆
      </span>
      <h3 className="text-base font-semibold text-slate-900">
        Venir en train
      </h3>
    </div>

    <div className="mt-4 grid gap-5 md:grid-cols-2">
      {/* Col gauche */}
      <div className="space-y-2">
        <p className="text-sm leading-6 text-slate-700">
          Les gares les plus pratiques pour rejoindre le Domaine de Gravières
          sont{" "}
          <span className="font-semibold text-slate-900">Clermont-Ferrand</span>,{" "}
          <span className="font-semibold text-slate-900">Aurillac</span> et{" "}
          <span className="font-semibold text-slate-900">Ussel</span>.
        </p>

        <p className="text-sm leading-6 text-slate-700">
          Selon ton point de départ, l’arrivée se fait généralement via l’une de
          ces gares, puis une correspondance (train ou car) jusqu’à{" "}
          <span className="font-semibold text-slate-900">Lanobre</span>.
        </p>
      </div>

      {/* Col droite */}
      <div className="space-y-2 border-t border-slate-200 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <p className="text-sm leading-6 text-slate-700">
          🚌 Depuis{" "}
          <span className="font-semibold text-slate-900">Clermont-Ferrand</span>,
          tu peux rejoindre Lanobre en bus via la{" "}
          <span className="font-semibold text-slate-900">ligne P47</span>{" "}
          (selon les jours et les horaires).
        </p>

        <p className="text-sm leading-6 text-slate-700">
          Si tu arrives en train ou en bus, nous pouvons{" "}
          <span className="font-semibold text-slate-900">
            coordonner la suite du trajet
          </span>{" "}
          jusqu’au domaine : contacte-nous à l’avance .
        </p>

        <p className="text-xs leading-5 text-slate-600">
          📍 Le domaine se situe à environ{" "}
          <span className="font-semibold">8 km</span> de Lanobre.
        </p>
      </div>
    </div>
  </div>
</div>

  {/* VOITURE */}
  <div className="mt-6 rounded-3xl border border-slate-200 bg-white/60 shadow-sm">
    <div className="p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              🚗
            </span>
            <h3 className="text-base font-semibold text-slate-900">
              Venir en voiture
            </h3>
          </div>

          <p className="text-sm leading-6 text-slate-700">
            Temps de trajet indicatifs vers <span className="font-semibold text-slate-900">Lanobre</span>.
          </p>
        </div>

        <div className="shrink-0">
          <VioletButton href={mapsLink} external>
            Ouvrir sur Maps <span className="text-sm">↗</span>
          </VioletButton>
        </div>
      </div>

      <div className="mt-4 overflow-hidden border border-slate-200 bg-white/70">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-slate-200 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          <div>Ville</div>
          <div>Durée</div>
          <div>Distance</div>
        </div>

        <div className="divide-y divide-slate-200">
          {[
            ...driveTimes,
            { city: "Lyon", time: "≈ 3h30", km: "≈ 290 km" },
          ].map((t) => (
            <div
              key={t.city}
              className="grid grid-cols-[1.4fr_0.8fr_0.8fr] px-4 py-3 text-sm text-slate-800"
            >
              <div className="font-semibold text-slate-900">{t.city}</div>
              <div>{t.time}</div>
              <div className="text-slate-600">{t.km}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-600">
        ℹ️ Indications données à titre informatif : vérifie l’itinéraire en
        fonction de l’horaire et de la circulation.
      </p>
    </div>
  </div>
</Section>




<Section kicker="Le lieu" title="Le Domaine de Gravières">
  <div className="space-y-10 md:space-y-12">
    {/* 1) HERO MIX : texte court + grande photo */}
    <div className="grid gap-6 md:grid-cols-12 md:items-center">
      <div className="md:col-span-5 space-y-4">
        <p className="text-sm leading-6 text-slate-700">
          📍 Le Domaine de Gravières est situé dans la commune de{" "}
          <span className="font-semibold text-slate-900">Lanobre</span>, un village
          auvergnat situé au nord du département du{" "}
          <span className="font-semibold text-slate-900">Cantal</span>. Ce site se
          trouve au cœur du parc naturel régional des{" "}
          <span className="font-semibold text-slate-900">Volcans d&apos;Auvergne</span>,
          sur le plateau de l’Artense.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <Chip tone="violet">Cadre paisible</Chip>
          <Chip>Volcans d’Auvergne</Chip>
          <Chip>Plateau de l’Artense</Chip>
        </div>
      </div>

      <div className="md:col-span-7">
        <Photo src={pix.cantal} alt="Paysage du Cantal" h="h-64 md:h-[420px]" />
      </div>
    </div>

    {/* 2) CONFORt + EXTERIEUR (photo à gauche, texte à droite) */}
    <div className="grid gap-6 md:grid-cols-12 md:items-center">
      <div className="md:col-span-6">
        <Photo src={pix.domaine} alt="Extérieur du domaine" h="h-64 md:h-[420px]" />
      </div>

      <div className="md:col-span-6 space-y-4">
        <p className="text-sm leading-6 text-slate-700">
          🏡 Le Domaine de Gravières est équipé pour offrir un confort optimal au
          public dans un cadre paisible. Il est accessible par une route goudronnée
          et dispose d&apos;un parking, facilitant l&apos;arrivée en voiture ou en bus.
        </p>

        <p className="text-sm leading-6 text-slate-700">
          ♿ En tant qu&apos;établissement recevant du public (ERP) et accessible aux
          personnes à mobilité réduite (PMR), il est idéal pour accueillir des groupes
          scolaires, des séjours à thème, des résidences artistiques, ainsi que des
          évènements ponctuels de grande ampleur.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <Chip tone="violet">ERP</Chip>
          <Chip>PMR</Chip>
          <Chip>Parking</Chip>
          <Chip>Groupes</Chip>
        </div>
      </div>
    </div>

    {/* 3) ACTIVITÉS PROCHES (texte + carousel) */}
    <div className="grid gap-6 md:grid-cols-12 md:items-center">
      <div className="md:col-span-5 space-y-4">
        <p className="text-sm leading-6 text-slate-700">
          🌿 Profitez de nombreuses activités à proximité en toute saison
        </p>

        <ul className="space-y-2 text-sm leading-6 text-slate-700">
          <li>🥾 Randonnées et découverte de la faune et de la flore des Monts d&apos;Auvergne.</li>
          <li>🌊 Baignade et sports nautiques au lac de Bort-les-Orgues.</li>
          <li>🌋 Visite de Vulcania et autres sites culturels.</li>
          <li>🎿 Ski alpin, ski de fond et raquette au Mont-Dore et à Super Besse.</li>
        </ul>

        <p className="text-xs leading-5 text-slate-600">
          ℹ️ Selon la saison, les possibilités varient : prévois des vêtements adaptés.
        </p>
      </div>

      <div className="md:col-span-7">
        <MiniCarousel images={carouselImages} heightClass="h-64 md:h-[420px]" />
      </div>
    </div>

<div className="rounded-3xl border border-slate-200 bg-white/60 shadow-sm">
  <div className="p-5 md:p-6">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
      🧩 Les espaces sur place
    </p>

    <div className="mt-5 grid gap-6 md:grid-cols-12 md:items-start">
      {/* Salle (photo gauche, texte droite) */}
      <div className="md:col-span-5">
        <Photo src={pix.salle} alt="Salle d’activité" h="h-56 md:h-64" />
      </div>
      <div className="md:col-span-7 space-y-2">
        <p className="text-sm font-semibold text-slate-900">🎭 Salle d’activité</p>
        <p className="text-sm leading-6 text-slate-700">
          La salle d&apos;activité, spacieuse et lumineuse, est spécialement conçue
          pour accueillir une variété d&apos;animations, d&apos;ateliers de groupe, de
          réunions et de séminaires.
        </p>
      </div>

      <div className="md:col-span-12 border-t border-slate-200" />

      {/* Réfectoire + Cuisine (photo gauche, texte droite) */}
            <div className="md:col-span-6 space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">🍽️ Réfectoire</p>
          <p className="text-sm leading-6 text-slate-700">
            Un espace dédié aux repas collectifs, conçu pour offrir une atmosphère
            conviviale et agréable. Cet espace est aménagé pour accueillir
            confortablement les groupes, avec des installations adaptées pour des
            repas en commun.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">👩‍🍳 Cuisine</p>
          <p className="text-sm leading-6 text-slate-700">
            L’espace dispose d’une cuisine entièrement équipée avec des installations
            professionnelles. Cette configuration assure une fonctionnalité optimale
            pour la préparation de repas de qualité.
          </p>
        </div>
      </div>
      <div className="md:col-span-6">
        <Photo src={pix.cuisine} alt="Cuisine" h="h-56 md:h-64" />
      </div>



      <div className="md:col-span-12 border-t border-slate-200" />

      {/* Buanderie + Dortoirs (photo gauche, texte droite) */}
      <div className="md:col-span-5">
        <Photo src={pix.dehors} alt="Extérieur" h="h-64 md:h-[360px]" />
      </div>

      <div className="md:col-span-7 space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">🧺 Buanderie</p>
          <p className="text-sm leading-6 text-slate-700">
            La buanderie dispose d&apos;équipements professionnels, incluant des machines à
            laver, séchoirs et dispositifs de repassage de haute qualité, garantissant
            une efficacité optimale pour l&apos;entretien du linge.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">🛏️ Dortoirs</p>
          <p className="text-sm leading-6 text-slate-700">
            Les dortoirs sont modulables et peuvent être configurés selon les besoins des groupes,
            permettant d&apos;héberger jusqu&apos;à soixante personnes dans un environnement à taille humaine.
            Les installations sont accessibles PMR, et chaque chambre dispose d&apos;une salle de bain et
            de toilettes privatives.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Chip tone="violet">Jusqu’à 60 personnes</Chip>
          <Chip>PMR</Chip>
          <Chip>Salle de bain privative</Chip>
        </div>
      </div>
    </div>
  </div>
</div>


    {/* 5) FINAL BIG PHOTO (ambiance) */}
    <div className="grid gap-6 ">
      <div className="">
        <Photo src={pix.nuit} alt="Ambiance du soir" h="h-56 md:h-[360px]" />
      </div>

    </div>
  </div>
</Section>




      </div>
    </main>
  );
}
