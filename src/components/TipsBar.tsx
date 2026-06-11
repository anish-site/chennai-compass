import { Lightbulb } from 'lucide-react';
import { tips } from '../data/tips';

export default function TipsBar() {
  return (
    <section className="tipsbar" aria-label="Tips for Chennai">
      <h2 className="tipsbar-label">
        <Lightbulb size={16} aria-hidden="true" /> Tips for Chennai
      </h2>
      <div className="tips-row">
        {tips.map((tip) => (
          <div key={tip.text} className="tip">
            <span className="tip-emoji" aria-hidden="true">
              {tip.emoji}
            </span>
            {tip.text}
          </div>
        ))}
      </div>
    </section>
  );
}
