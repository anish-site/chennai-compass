import Modal from './Modal';
import { phrasebook } from '../data/phrasebook';

export default function PhrasebookModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal titleId="phrasebook-title" onClose={onClose}>
      <h2 id="phrasebook-title">Talk like a local 🗣️</h2>
      <p className="modal-intro">
        A handful of Tamil words that'll instantly make you friends (and get you better auto fares).
      </p>
      {phrasebook.map((group) => (
        <section key={group.title} className="phrase-group">
          <h3>
            <span aria-hidden="true">{group.emoji}</span> {group.title}
          </h3>
          <ul className="phrase-list">
            {group.phrases.map((p) => (
              <li key={p.tamil} className="phrase">
                <div className="phrase-head">
                  <span className="phrase-tamil">{p.tamil}</span>
                  <span className="phrase-script" lang="ta">
                    {p.script}
                  </span>
                </div>
                <p className="phrase-meaning">{p.meaning}</p>
                {p.note && <p className="phrase-note">{p.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Modal>
  );
}
