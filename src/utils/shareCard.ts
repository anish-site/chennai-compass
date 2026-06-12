import type { Place } from '../data/places';
import { CATEGORY_META } from '../data/places';

// Fixed, capped output — Instagram-portrait. Caps matter so we never
// allocate a runaway canvas on a phone (see shareCard.test.ts).
export const SHARE_IMAGE = { width: 1080, height: 1350 } as const;
export const SHARE_MIME = 'image/jpeg';
export const SHARE_QUALITY = 0.9; // bounds the produced file size
export const APP_URL = 'https://chennai-compass.vercel.app';

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled' | 'unsupported';

function shareText(place: Place): string {
  return `${place.name} — ${place.area}, Chennai. ${place.description}`;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

/** Draws the branded share image. Returns a blank canvas if 2D is unavailable. */
export function buildShareCanvas(place: Place, doc: Document = document): HTMLCanvasElement {
  const { width: W, height: H } = SHARE_IMAGE;
  const canvas = doc.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const accent = CATEGORY_META[place.category]?.accent ?? '#FF6B35';

  // Warm background + accent band
  ctx.fillStyle = '#FFF8F0';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 26);

  // Category stamp
  ctx.font = '120px serif';
  ctx.textAlign = 'left';
  ctx.fillText(CATEGORY_META[place.category]?.emoji ?? '📍', 80, 230);

  // Category label + area
  ctx.fillStyle = accent;
  ctx.font = '700 34px Inter, sans-serif';
  ctx.fillText(place.category.toUpperCase(), 240, 150);
  ctx.fillStyle = '#6F675D';
  ctx.font = '600 30px Inter, sans-serif';
  ctx.fillText(`via ${place.area}`, 240, 200);

  // Name
  ctx.fillStyle = '#2D2A26';
  ctx.font = '700 76px Fraunces, Georgia, serif';
  let y = 380;
  for (const ln of wrapLines(ctx, place.name, W - 160, 2)) {
    ctx.fillText(ln, 80, y);
    y += 86;
  }

  // Description
  ctx.fillStyle = '#2D2A26';
  ctx.font = '40px Inter, sans-serif';
  y += 24;
  for (const ln of wrapLines(ctx, `“${shareText(place)}”`, W - 160, 9)) {
    ctx.fillText(ln, 80, y);
    y += 58;
  }

  // Brand footer (logo mark + name)
  const cx = 120;
  const cy = H - 90;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath(); // compass needle
  ctx.moveTo(cx, cy - 22);
  ctx.lineTo(cx + 12, cy);
  ctx.lineTo(cx, cy + 22);
  ctx.lineTo(cx - 12, cy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2D2A26';
  ctx.font = '700 44px Fraunces, Georgia, serif';
  ctx.fillText('Chennai Compass', cx + 56, cy - 4);
  ctx.fillStyle = '#6F675D';
  ctx.font = '28px Inter, sans-serif';
  ctx.fillText('the city, from my lens', cx + 56, cy + 34);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob !== 'function') {
      resolve(null);
      return;
    }
    canvas.toBlob((blob) => resolve(blob), SHARE_MIME, SHARE_QUALITY);
  });
}

/**
 * Shares a place as a branded image: native share sheet (Instagram, WhatsApp,
 * …) when the device supports sharing files, otherwise downloads the image.
 * Always produces at most one canvas/blob per call.
 */
export async function sharePlace(place: Place, nav: Navigator = navigator): Promise<ShareOutcome> {
  const text = shareText(place);
  const canvas = buildShareCanvas(place);
  const blob = await canvasToBlob(canvas);

  if (blob) {
    const file = new File([blob], `${place.id}-chennai-compass.jpg`, { type: SHARE_MIME });
    const canShareFiles =
      typeof nav.canShare === 'function' && nav.canShare({ files: [file] });
    if (canShareFiles && typeof nav.share === 'function') {
      try {
        await nav.share({ files: [file], title: place.name, text });
        return 'shared';
      } catch (err) {
        return (err as Error)?.name === 'AbortError' ? 'cancelled' : 'downloaded';
      }
    }
    // No file sharing (most desktops): download the image instead.
    if (typeof document !== 'undefined') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      return 'downloaded';
    }
  }

  // Last resort: text/url share if even canvas is unavailable.
  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title: place.name, text, url: APP_URL });
      return 'shared';
    } catch (err) {
      return (err as Error)?.name === 'AbortError' ? 'cancelled' : 'unsupported';
    }
  }
  return 'unsupported';
}
