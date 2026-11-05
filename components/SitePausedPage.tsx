import Image from "next/image";
import { Mail, PhoneCall } from "lucide-react";

const PHONE_DISPLAY = "01 84 21 05 48";
const PHONE_TEL = "0184210548";
const EMAIL = "bafa@murathenes.org";

// Theatre-style farewell page shown while the public site is paused.
export default function SitePausedPage({ message }: { message: string }) {
  return (
    <main className="site-paused">
      <div className="site-paused-curtain site-paused-curtain-left" aria-hidden="true" />
      <div className="site-paused-curtain site-paused-curtain-right" aria-hidden="true" />
      <div className="site-paused-spotlight" aria-hidden="true" />

      <div className="site-paused-stage">
        <Image src="/MT.png" alt="Logo Murathènes" width={64} height={64} className="site-paused-logo" priority />
        <p className="mura-mono site-paused-kicker">Acte final · Dernière représentation</p>
        <h1 className="site-paused-title">
          Rideau.
          <span className="ed">BAFA Murathènes tire sa révérence.</span>
        </h1>
        <p className="site-paused-text">{message}</p>
        <p className="hand site-paused-sign">Merci pour tout. Adieu !</p>
        <div className="site-paused-actions">
          <a href={`mailto:${EMAIL}`} className="site-paused-btn site-paused-btn-primary">
            <Mail size={17} aria-hidden="true" />
            {EMAIL}
          </a>
          <a href={`tel:${PHONE_TEL}`} className="site-paused-btn" aria-label={`Appeler Murathènes au ${PHONE_DISPLAY}`}>
            <PhoneCall size={17} aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </main>
  );
}
