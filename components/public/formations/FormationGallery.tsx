"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

const INK = "#1a1530";

export type FormationGalleryPhoto = {
  src: string;
  alt: string;
};

type Props = {
  photos: FormationGalleryPhoto[];
  accentColor: string;
  shadowColor: string;
};

export function FormationGallery({ photos, accentColor, shadowColor }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];
  const activePosition = activeIndex === null ? 0 : activeIndex + 1;

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? current : (current - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);
  const showNext = useCallback(() => {
    setActiveIndex((current) => (current === null ? current : (current + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, showNext, showPrevious]);

  if (!photos.length) return null;

  return (
    <>
      <div className="formation-gallery-grid">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="formation-gallery-item group"
            style={{
              borderColor: INK,
              boxShadow: index === 0 ? `5px 5px 0 ${shadowColor}` : undefined,
            }}
            aria-label={`Agrandir la photo : ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 34vw, (min-width: 768px) 45vw, 50vw"
              className="object-cover"
            />
            <span className="formation-gallery-overlay" style={{ background: `${INK}8F` }}>
              <span className="formation-gallery-chip" style={{ background: accentColor }}>
                <Maximize2 size={14} strokeWidth={2.4} aria-hidden="true" />
                Voir
              </span>
            </span>
          </button>
        ))}
      </div>

      {activePhoto && (
        <div
          className="formation-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
          onClick={close}
        >
          <button
            type="button"
            className="formation-gallery-modal-close"
            onClick={close}
            aria-label="Fermer la photo"
          >
            <X size={22} strokeWidth={2.5} aria-hidden="true" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="formation-gallery-modal-nav formation-gallery-modal-prev"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Photo précédente"
              >
                <ChevronLeft size={28} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="formation-gallery-modal-nav formation-gallery-modal-next"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Photo suivante"
              >
                <ChevronRight size={28} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </>
          )}

          <figure className="formation-gallery-modal-figure" onClick={(event) => event.stopPropagation()}>
            <div className="formation-gallery-modal-image">
              <Image src={activePhoto.src} alt={activePhoto.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <figcaption>
              <span>{activePosition}</span> / {photos.length} · {activePhoto.alt}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
