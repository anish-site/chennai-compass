export interface Phrase {
  /** Romanised Tamil — how you'd actually say it */
  tamil: string;
  /** Native Tamil script */
  script: string;
  meaning: string;
  /** When/how to use it */
  note: string;
}

export interface PhraseGroup {
  title: string;
  emoji: string;
  phrases: Phrase[];
}

// ✏️ A starter Tamil phrasebook for newcomers — edit/add freely.
export const phrasebook: PhraseGroup[] = [
  {
    title: 'The essentials',
    emoji: '🙏',
    phrases: [
      { tamil: 'Vanakkam', script: 'வணக்கம்', meaning: 'Hello / greetings', note: 'Works any time of day, with anyone.' },
      { tamil: 'Nandri', script: 'நன்றி', meaning: 'Thank you', note: 'A smile + nandri gets you far.' },
      { tamil: 'Seri', script: 'சரி', meaning: 'OK / fine / done', note: 'The all-purpose yes.' },
      { tamil: 'Illai', script: 'இல்லை', meaning: 'No / not there', note: 'Polite refusal: “vendaam”.' },
      { tamil: 'Venum / Venaam', script: 'வேணும் / வேண்டாம்', meaning: 'I want / I don’t want', note: 'Point + venum at a shop and you’re sorted.' },
    ],
  },
  {
    title: 'Talking to people',
    emoji: '🗣️',
    phrases: [
      { tamil: 'Anna', script: 'அண்ணா', meaning: 'Elder brother', note: 'Friendly way to address any man around your age or older — autos, shops, waiters.' },
      { tamil: 'Akka', script: 'அக்கா', meaning: 'Elder sister', note: 'The “anna” for women. Respectful and warm.' },
      { tamil: 'Thambi', script: 'தம்பி', meaning: 'Younger brother', note: 'For someone younger than you.' },
      { tamil: 'Mama / Mami', script: 'மாமா / மாமி', meaning: 'Uncle / aunty', note: 'For older folks — tea stalls, neighbours.' },
    ],
  },
  {
    title: 'Asking around',
    emoji: '❓',
    phrases: [
      { tamil: 'Enga?', script: 'எங்க?', meaning: 'Where?', note: '“Marina enga?” = where’s Marina?' },
      { tamil: 'Eppo?', script: 'எப்போ?', meaning: 'When?', note: '“Bus eppo varum?” = when does the bus come?' },
      { tamil: 'Evlo?', script: 'எவ்ளோ?', meaning: 'How much?', note: 'The most important shopping word. “Idhu evlo?” = how much is this?' },
      { tamil: 'Enna?', script: 'என்ன?', meaning: 'What?', note: 'Also a casual “what’s up?”' },
      { tamil: 'Yaaru?', script: 'யாரு?', meaning: 'Who?', note: '' },
      { tamil: 'Epdi?', script: 'எப்படி?', meaning: 'How?', note: '“Epdi poradhu?” = how to get there?' },
    ],
  },
  {
    title: 'Out and about',
    emoji: '🛺',
    phrases: [
      { tamil: 'Time enna?', script: 'டைம் என்ன?', meaning: 'What’s the time?', note: '' },
      { tamil: 'Konjam', script: 'கொஞ்சம்', meaning: 'A little / please', note: '“Konjam” softens any request.' },
      { tamil: 'Romba', script: 'ரொம்ப', meaning: 'Very / a lot', note: '“Romba nandri” = thanks a lot.' },
      { tamil: 'Korai', script: 'குறை', meaning: 'Reduce (the price)', note: 'Bargaining: “konjam korai-nga” = lower it a bit please.' },
      { tamil: 'Poagalaam', script: 'போகலாம்', meaning: 'Let’s go', note: '' },
      { tamil: 'Saapaadu', script: 'சாப்பாடு', meaning: 'Food / meal', note: '“Saapatengala?” = have you eaten? (a real greeting here).' },
    ],
  },
];
