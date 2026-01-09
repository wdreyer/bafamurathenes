"use client";

import { useEffect, useState } from "react";

export default function ScrollHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;

      // Pas de scroll possible -> on cache
      if (maxScroll <= 24) {
        setShow(false);
        return;
      }

      const y = window.scrollY || doc.scrollTop || 0;

      // Cache quand on est "presque" en bas
      setShow(y < maxScroll - 160);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const onClick = () => {
    window.scrollBy({
      top: Math.round(window.innerHeight * 0.85),
      behavior: "smooth",
    });
  };

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Faire défiler la page"
      className={[
        "fixed z-[55]",
        "left-4 md:left-1/2 md:-translate-x-1/2",
        "bottom-6 md:bottom-7",
        "rounded-full border border-slate-200 bg-white/70 backdrop-blur",
        "px-3 py-2 shadow-sm",
        "transition-opacity duration-200 hover:bg-white",
      ].join(" ")}
      style={{ color: "#6664C5" }}
    >
      <span className="inline-flex items-center gap-2 cursor-pointer">
        {/* chevron down */}
        <span className="inline-block animate-bounce [animation-duration:1.2s] motion-reduce:animate-none">
          ⬇
        </span>
      </span>
    </button>
  );
}