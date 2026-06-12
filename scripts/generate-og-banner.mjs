// Generates public/og-banner.png (1200×630) — the social/link-preview image.
// Rerun after design changes: npm i -D sharp && node scripts/generate-og-banner.mjs
// Fonts (OFL-licensed Fraunces/Inter/Noto Sans Tamil) live in scripts/fonts.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(here, 'fonts');
const outFile = join(here, '..', 'public', 'og-banner.png');

// Point fontconfig at the bundled fonts (must happen before sharp loads).
const confDir = mkdtempSync(join(tmpdir(), 'og-fc-'));
const confFile = join(confDir, 'fonts.conf');
writeFileSync(
  confFile,
  `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontsDir}</dir>
  <cachedir>${confDir}</cachedir>
</fontconfig>`
);
process.env.FONTCONFIG_FILE = confFile;

const { default: sharp } = await import('sharp');

const W = 1200;
const H = 630;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF6B35"/>
      <stop offset="0.5" stop-color="#FF8C42"/>
      <stop offset="1" stop-color="#FFB627"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- decorative sun circles, like the hero -->
  <circle cx="1110" cy="60" r="190" fill="#ffffff" opacity="0.16"/>
  <circle cx="60" cy="590" r="150" fill="#ffffff" opacity="0.10"/>

  <!-- compass mark -->
  <g transform="translate(150,255)">
    <circle r="86" fill="none" stroke="#ffffff" stroke-width="11"/>
    <path d="M 0,-56 L 26,0 L 0,56 L -26,0 Z" fill="#ffffff"/>
    <circle r="11" fill="#0E7C7B"/>
  </g>

  <!-- wordmark -->
  <text x="285" y="238" font-family="Fraunces" font-weight="700" font-size="95"
        fill="#ffffff">Chennai</text>
  <text x="285" y="338" font-family="Fraunces" font-weight="700" font-size="95"
        fill="#FFF3D6">Compass</text>
  <text x="288" y="402" font-family="Inter" font-weight="600" font-size="31"
        fill="#ffffff" opacity="0.95">the city, from my lens · வணக்கம்!</text>

  <!-- category chips -->
  <g font-family="Inter" font-weight="600" font-size="24" fill="#E4501B">
    <rect x="288" y="442" rx="24" width="138" height="48" fill="#FFF8F0"/>
    <text x="320" y="474">beaches</text>
    <rect x="440" y="442" rx="24" width="110" height="48" fill="#FFF8F0"/>
    <text x="472" y="474">cafés</text>
    <rect x="564" y="442" rx="24" width="172" height="48" fill="#FFF8F0"/>
    <text x="596" y="474">street food</text>
    <rect x="750" y="442" rx="24" width="142" height="48" fill="#FFF8F0"/>
    <text x="782" y="474">heritage</text>
    <rect x="906" y="442" rx="24" width="148" height="48" fill="#FFF8F0"/>
    <text x="938" y="474">hangouts</text>
  </g>

  <!-- cream wave footer -->
  <path d="M0,572 C200,604 400,544 600,568 C800,592 1000,552 1200,576 L1200,630 L0,630 Z"
        fill="#FFF8F0"/>
  <text x="600" y="616" text-anchor="middle" font-family="Inter" font-weight="600"
        font-size="22" fill="#6F675D">chennai-compass.vercel.app</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outFile);
console.log(`wrote ${outFile}`);
