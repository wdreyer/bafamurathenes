// Shown instead of the public site while it is paused: just "Fin…" on a black screen.
export default function SitePausedPage() {
  return (
    <main className="site-paused">
      <h1 className="site-paused-end">
        <span className="sr-only">BAFA Murathènes : </span>Fin…
      </h1>
    </main>
  );
}
