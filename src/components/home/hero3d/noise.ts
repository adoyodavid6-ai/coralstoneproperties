// Deterministic 2-octave value noise for the hero terrain — no dependency,
// seeded hashing so the ridge is identical on every visit.

function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  // 0..1
  return ((h >>> 0) % 100000) / 100000;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

/**
 * Terrain elevation at plane-local coordinates (x: -30..30, y: -15..15).
 * Two octaves of value noise amplified along a rift-valley diagonal ridge.
 */
export function terrainHeight(x: number, y: number): number {
  const base = valueNoise(x * 0.08 + 7.3, y * 0.08 + 2.1) * 2.2;
  const detail = valueNoise(x * 0.22 + 3.7, y * 0.22 + 9.4) * 0.8;
  // Ridge along the diagonal y ≈ 0.35x — the rift line.
  const d = y - x * 0.35;
  const ridge = Math.exp((-d * d) / 26);
  return (base + detail) * (0.55 + 1.35 * ridge);
}
