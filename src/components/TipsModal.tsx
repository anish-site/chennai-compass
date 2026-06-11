import Modal from './Modal';
import { tips } from '../data/tips';

export default function TipsModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal titleId="tips-title" onClose={onClose}>
      <h2 id="tips-title">Tips for Chennai 💡</h2>
      <ul className="tips-list">
        {tips.map((tip) => (
          <li key={tip.text} className="tip">
            <span className="tip-emoji" aria-hidden="true">
              {tip.emoji}
            </span>
            {tip.text}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
