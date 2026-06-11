import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Modal from './Modal';

// CMRL's official WhatsApp ticketing number (digits only, with country code).
// Verify/update if CMRL changes it: https://chennaimetrorail.org/
const METRO_WHATSAPP_NUMBER = '918681996995';
const BOOK_TICKET_URL = `https://wa.me/${METRO_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi')}`;

export default function MetroMapModal({ onClose }: { onClose: () => void }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <Modal titleId="metro-title" onClose={onClose}>
      <h2 id="metro-title">Chennai Metro 🚇</h2>
      <p className="modal-intro">Two lines are operational today — AC, on time, and cheap.</p>
      {imgOk && (
        <img
          className="modal-map"
          src={`${import.meta.env.BASE_URL}maps/metro-map.jpg`}
          alt="Chennai Metro route map"
          onError={() => setImgOk(false)}
        />
      )}
      <ul className="metro-lines">
        <li>
          <span className="metro-line metro-blue">Blue Line</span>
          <p>
            <strong>Wimco Nagar Depot ↔ Chennai Airport</strong> — via Washermanpet, High Court,
            Chennai Central, LIC, Teynampet, Saidapet, Alandur and Guindy. The airport run.
          </p>
        </li>
        <li>
          <span className="metro-line metro-green">Green Line</span>
          <p>
            <strong>Chennai Central ↔ St. Thomas Mount</strong> — via Egmore, Anna Nagar,
            Koyambedu (CMBT), Vadapalani and Alandur.
          </p>
        </li>
      </ul>
      <p className="metro-note">
        Switch lines at <strong>Alandur</strong> or <strong>Chennai Central</strong>. Phase 2 (three
        more lines) is under construction — pretend the barricades are public art.
      </p>
      <div className="metro-actions">
        <a
          className="pill-btn pill-btn-solid book-ticket-btn"
          href={BOOK_TICKET_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">🎫</span> Book ticket
        </a>
        <a
          className="pill-btn metro-link"
          href="https://chennaimetrorail.org/route-map/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Official CMRL route map <ExternalLink size={13} aria-hidden="true" />
        </a>
      </div>
      <p className="metro-note metro-whatsapp-note">
        “Book ticket” opens a WhatsApp chat with Chennai Metro — get a QR ticket right in the app.
      </p>
    </Modal>
  );
}
