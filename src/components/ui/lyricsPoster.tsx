import React, { useRef, useEffect, useCallback, useState } from "react";
import { useSettingsStore } from "@/stores/settings";
// ── canvas ASCII-art engine ──────────────────────────────────────────────────
const POSTER_IMAGE = "/assets/ascii/set2.jpg";
const CHAR_W = 5;
const CHAR_H = 9;

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function buildLyricsStream(lyrics: string): string {
  const flat = lyrics.replace(/\n/g, " ").replace(/\s+/g, " ").trim() + " ";
  return flat.repeat(400);
}

/** Boost contrast + apply an S-curve so blacks are crushed and whites are blown.
 *  Input/output: 0–255 */
function contrastCurve(v: number): number {
  // normalize → 0..1
  let t = v / 255;
  // boost: mid-tone contrast via smoothstep-like S-curve
  // t = t * t * (3 - 2 * t)  (basic smoothstep)
  // Apply twice for a stronger S
  t = t * t * (3 - 2 * t);
  t = t * t * (3 - 2 * t);
  // then a linear contrast stretch: push blacks darker, whites brighter
  t = Math.min(1, Math.max(0, (t - 0.18) / (1 - 0.18)));
  return t * 255;
}

function renderLyricsPoster(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  lyrics: string,
  themeColor: string
) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;

  // ── 1. draw source image cover-fitted into off-screen canvas ──────────────
  const offscreen = document.createElement("canvas");
  offscreen.width = W;
  offscreen.height = H;
  const offCtx = offscreen.getContext("2d")!;
  offCtx.fillStyle = "#000";
  offCtx.fillRect(0, 0, W, H);
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  offCtx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  const pixels = offCtx.getImageData(0, 0, W, H).data;

  // ── 2. pure black background ───────────────────────────────────────────────
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  // ── 3. draw lyric characters mapped to boosted brightness ─────────────────
  const stream = buildLyricsStream(lyrics);
  const { r: tr, g: tg, b: tb } = hexToRgb(themeColor);
  let charIndex = 0;
  const cols = Math.floor(W / CHAR_W);
  const rows = Math.floor(H / CHAR_H);
  ctx.font = `bold ${CHAR_H - 1}px Arial, sans-serif`;
  ctx.textBaseline = "top";

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = Math.floor((col / cols) * W);
      const py = Math.floor((row / rows) * H);
      const idx = (py * W + px) * 4;

      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      // raw perceived brightness
      const rawBrightness = 0.299 * r + 0.587 * g + 0.114 * b;

      // skip crushed-black pixels entirely (true shadow areas)
      if (rawBrightness < 12) { charIndex++; continue; }

      // apply S-curve contrast boost
      const boosted = contrastCurve(rawBrightness);
      const t = boosted / 255; // 0 = dark midtone, 1 = bright highlight

      // colour strategy:
      //   0.0 → 0.35  (dark midtones) : theme colour at low alpha → depth
      //   0.35 → 0.65 (midtones)      : blend theme → white
      //   0.65 → 1.0  (highlights)    : pure white, full alpha
      let cr: number, cg: number, cb: number, alpha: number;

      if (t < 0.35) {
        // dark midtones: theme color, semi-transparent
        const s = t / 0.35; // 0..1 within this band
        cr = tr; cg = tg; cb = tb;
        alpha = 0.25 + s * 0.45; // 0.25 → 0.70
      } else if (t < 0.65) {
        // mid: blend from theme to white
        const s = (t - 0.35) / 0.30;
        cr = Math.round(tr + (255 - tr) * s);
        cg = Math.round(tg + (255 - tg) * s);
        cb = Math.round(tb + (255 - tb) * s);
        alpha = 0.70 + s * 0.25; // 0.70 → 0.95
      } else {
        // highlights: white
        cr = 255; cg = 255; cb = 255;
        alpha = 0.95 + (t - 0.65) / 0.35 * 0.05; // 0.95 → 1.0
      }

      ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(2)})`;
      ctx.fillText(stream[charIndex % stream.length], col * CHAR_W, row * CHAR_H);
      charIndex++;
    }
  }

}
// ─────────────────────────────────────────────────────────────────────────────

const LyricsPoster: React.FC = () => {
  const { waitForSongTitle, waitForSongArtist, waitForThemeColor } = useSettingsStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);
  const [themeColor, setThemeColor] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [color, title, artist] = await Promise.all([
          waitForThemeColor(),
          waitForSongTitle(),
          waitForSongArtist(),
        ]);
        setThemeColor(color);

        // Fetch lyrics from lyrics.ovh — free, no API key, CORS-friendly
        const res = await fetch(
          `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
        );
        if (!res.ok) throw new Error(`lyrics.ovh returned ${res.status}`);
        const json = await res.json();
        if (!json.lyrics) throw new Error('No lyrics in response');
        setLyrics(json.lyrics as string);
      } catch (error) {
        console.error('Failed to load lyrics for LyricsPoster:', error);
        setFetchError('Could not load lyrics.');
        setRendering(false);
      }
    };
    loadData();
  }, [waitForThemeColor, waitForSongTitle, waitForSongArtist]);

  const doRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !lyrics || !themeColor) return;
    const img = new Image();
    img.onload = () => {
      renderLyricsPoster(canvas, img, lyrics, themeColor);
      setRendering(false);
    };
    img.onerror = () => setRendering(false);
    img.src = POSTER_IMAGE;
  }, [lyrics, themeColor]);

  useEffect(() => {
    if (!lyrics || !themeColor) return;
    // setTimeout defers the heavy render so the spinner mounts first
    const id = setTimeout(() => doRender(), 30);
    return () => clearTimeout(id);
  }, [doRender, lyrics, themeColor]);

  const CANVAS_W = 900;
  const CANVAS_H = 1350;

  return (
    <div className="w-full">
      {/* ── Poster — full width, portrait ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "2 / 3",
          background: "#000000",
        }}
      >
        {/* canvas — the ASCII lyrics art */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="absolute inset-0 w-full h-full"
        />

        {/* spinner while rendering */}
        {rendering && !fetchError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: themeColor ?? undefined }}
            />
          </div>
        )}

        {/* lyrics fetch error */}
        {fetchError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <p className="text-white/60 text-sm">{fetchError}</p>
          </div>
        )}

        {/* song info overlay */}
      
      </div>
    </div>
  );
};

export default LyricsPoster;
