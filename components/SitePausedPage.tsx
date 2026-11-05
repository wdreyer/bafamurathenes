// Shown instead of the public site while it is paused: one short text (default "Fin…") on a black screen.
export default function SitePausedPage({ text }: { text: string }) {
  return (
    <main className="site-paused">
      <h1 className="site-paused-end">
        <span className="sr-only">BAFA Murathènes : </span>
        {text}
      </h1>
    </main>
  );
}
