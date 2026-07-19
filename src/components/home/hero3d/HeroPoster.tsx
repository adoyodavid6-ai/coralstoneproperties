// The hero poster — a dependency-free isometric property in the dark cinematic
// palette. Serves as the SSR frame, the Suspense fallback while the WebGL scene
// loads, and the full visual on lite/off motion tiers or when WebGL is missing.
// Window geometry is computed so faces stay perfectly parallel to each block.

type Pt = [number, number];

const add = (o: Pt, wv: Pt, hv: Pt, u: number, v: number): Pt => [
  o[0] + wv[0] * u + hv[0] * v,
  o[1] + wv[1] * u + hv[1] * v,
];

const poly = (pts: Pt[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

/** Grid of window panes on a face defined by an origin + width/height edge vectors. */
function windows(
  o: Pt,
  wv: Pt,
  hv: Pt,
  cols: number[],
  rows: number[],
  du: number,
  dv: number,
) {
  const out: string[] = [];
  for (const u of cols) {
    for (const v of rows) {
      out.push(
        poly([
          add(o, wv, hv, u, v),
          add(o, wv, hv, u + du, v),
          add(o, wv, hv, u + du, v + dv),
          add(o, wv, hv, u, v + dv),
        ]),
      );
    }
  }
  return out;
}

// ---- Fills (dark cinematic — faces darken away from the light, glass glows) ----
const ROOF = "#1C2226";
const RIGHT = "#161B1F";
const LEFT = "#101417";
const GLASS = "#8FB6DE";
const MUTE = "#343B40";
const EDGE = "#43719A";

export function HeroPoster({ className }: { className?: string }) {
  // Main block
  const T2: Pt = [330, 130], T3: Pt = [210, 190], T4: Pt = [90, 130], T1: Pt = [210, 70];
  const B2: Pt = [330, 240], B3: Pt = [210, 300], B4: Pt = [90, 240];

  const rightWin = windows(T2, [-120, 60], [0, 110], [0.16, 0.5], [0.14, 0.46], 0.26, 0.26);
  const leftWin = windows(T4, [120, 60], [0, 110], [0.2, 0.54], [0.14, 0.46], 0.24, 0.26);
  // Door on the right face
  const door = poly([
    add(T2, [-120, 60], [0, 110], 0.8, 0.5),
    add(T2, [-120, 60], [0, 110], 0.96, 0.5),
    add(T2, [-120, 60], [0, 110], 0.96, 1),
    add(T2, [-120, 60], [0, 110], 0.8, 1),
  ]);

  // Setback tower on the roof
  const u1: Pt = [210, 12], u2: Pt = [280, 47], u3: Pt = [210, 82], u4: Pt = [140, 47];
  const t2: Pt = [280, 112], t3: Pt = [210, 147], t4: Pt = [140, 112];
  const towerRightWin = windows([280, 47], [-70, 35], [0, 65], [0.24, 0.6], [0.2, 0.55], 0.28, 0.3);

  return (
    <svg
      viewBox="0 0 420 380"
      className={className}
      role="img"
      aria-label="Illustration of a modern verified property"
    >
      {/* Ground glow (light pools beneath the building on the dark site) */}
      <ellipse cx="210" cy="322" rx="150" ry="30" fill={EDGE} opacity="0.08" />

      {/* Landscaping spheres */}
      <ellipse cx="86" cy="300" rx="26" ry="10" fill={EDGE} opacity="0.05" />
      <circle cx="86" cy="286" r="15" fill={MUTE} opacity="0.55" />
      <ellipse cx="338" cy="300" rx="20" ry="8" fill={EDGE} opacity="0.05" />
      <circle cx="338" cy="289" r="11" fill={MUTE} opacity="0.45" />

      {/* ---- Main block ---- */}
      <polygon points={poly([T4, T3, B3, B4])} fill={LEFT} />
      <polygon points={poly([T2, T3, B3, B2])} fill={RIGHT} />
      <polygon points={poly([T1, T2, T3, T4])} fill={ROOF} />

      {/* Left windows */}
      {leftWin.map((p, i) => (
        <polygon key={`l${i}`} points={p} fill={GLASS} opacity="0.82" />
      ))}
      {/* Right windows + door */}
      {rightWin.map((p, i) => (
        <polygon key={`r${i}`} points={p} fill={GLASS} opacity="0.9" />
      ))}
      <polygon points={door} fill={GLASS} />

      {/* Roof parapet line */}
      <polygon
        points={poly([T1, T2, T3, T4])}
        fill="none"
        stroke={EDGE}
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />

      {/* ---- Setback tower ---- */}
      <polygon points={poly([t4, t3, u3, u4])} fill={LEFT} />
      <polygon points={poly([t2, t3, u3, u2])} fill={RIGHT} />
      <polygon points={poly([u1, u2, u3, u4])} fill={ROOF} />
      {towerRightWin.map((p, i) => (
        <polygon key={`t${i}`} points={p} fill={GLASS} opacity="0.9" />
      ))}

      {/* Floating verified location pin — the trust signal glows green */}
      <g className="animate-float" style={{ transformOrigin: "330px 70px" }}>
        <ellipse cx="330" cy="120" rx="16" ry="5" fill="#4E9C7C" opacity="0.18" />
        <path
          d="M330 66c-13 0-23 10-23 23 0 16 23 33 23 33s23-17 23-33c0-13-10-23-23-23Z"
          fill="#4E9C7C"
        />
        <circle cx="330" cy="89" r="9" fill="#0B0D0E" />
        <path
          d="m325.5 89 3 3 6-6"
          fill="none"
          stroke="#4E9C7C"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
