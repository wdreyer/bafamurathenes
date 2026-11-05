import Image from "next/image";
import { Mail, PhoneCall } from "lucide-react";

const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";
const EMAIL = "bafa@murathenes.org";

export default function SitePausedPage({ message }: { message: string }) {
  return (
    <main className="site-paused">
      <div className="site-paused-card">
        <Image src="/MT.png" alt="Logo Murathènes" width={72} height={72} className="h-16 w-auto" priority />
        <p className="mura-mono site-paused-kicker">Formations BAFA · Murathènes</p>
        <h1 className="site-paused-title">
          BAFA Murathènes
          <span className="ed">fait une pause.</span>
        </h1>
        <p className="site-paused-text">{message}</p>
        <p className="hand site-paused-sign">À très vite !</p>
        <div className="site-paused-actions">
          <a href={`mailto:${EMAIL}`} className="mura-header-cta">
            <Mail size={17} aria-hidden="true" />
            {EMAIL}
          </a>
          <a href={`tel:${PHONE_TEL}`} className="mura-header-phone" aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}>
            <PhoneCall size={17} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </main>
  );
}
