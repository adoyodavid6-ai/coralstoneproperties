// Inline SVG icons — inherit `currentColor`, sized via className (default 1em).
type P = { className?: string };
const S = ({
  children,
  className,
}: P & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className ?? "h-[1em] w-[1em]"}
  >
    {children}
  </svg>
);

export const CheckShield = ({ className }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? "h-[1em] w-[1em]"}>
    <path
      fill="currentColor"
      d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"
    />
    <path
      d="m8.5 12 2.3 2.3 4.7-4.7"
      fill="none"
      stroke="var(--color-surface)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Check = ({ className }: P) => (
  <S className={className}><path d="m5 12 4.5 4.5L19 7" /></S>
);
export const Bed = ({ className }: P) => (
  <S className={className}>
    <path d="M3 7v10M3 12h18v5M21 12v-2a3 3 0 0 0-3-3h-5v5" />
    <path d="M7 12V9a1 1 0 0 1 1-1h2" />
  </S>
);
export const Bath = ({ className }: P) => (
  <S className={className}>
    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
    <path d="M6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2M6 19l-1 2M18 19l1 2" />
  </S>
);
export const Area = ({ className }: P) => (
  <S className={className}>
    <path d="M3 3h18v18H3z" />
    <path d="M3 9h3M18 3v3M3 15h3M18 18v3" />
  </S>
);
export const Pin = ({ className }: P) => (
  <S className={className}>
    <path d="M12 21c4-4.5 7-7.8 7-11a7 7 0 1 0-14 0c0 3.2 3 6.5 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </S>
);
export const Heart = ({ className, filled }: P & { filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.7}
    aria-hidden="true"
    className={className ?? "h-[1em] w-[1em]"}
  >
    <path d="M12 20s-7-4.35-9.5-8.5C.8 8.4 2.3 5 5.5 5 7.6 5 9 6.3 12 9c3-2.7 4.4-4 6.5-4 3.2 0 4.7 3.4 3 6.5C19 15.65 12 20 12 20Z" />
  </svg>
);
export const Compare = ({ className }: P) => (
  <S className={className}><path d="M4 6h7M4 12h7M4 18h7M17 4v16M14 8l3-4 3 4M14 16l3 4 3-4" /></S>
);
export const Whatsapp = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className ?? "h-[1em] w-[1em]"}>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.2.2-.3.3-.1.6.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.6-.1l.7-.9c.2-.3.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.2Z" />
  </svg>
);
export const Phone = ({ className }: P) => (
  <S className={className}><path d="M4 5c0 8 7 15 15 15l1.5-3.2-4-2-2 2.2c-2-.9-4.6-3.5-5.5-5.5l2.2-2-2-4L4 5Z" /></S>
);
export const Calendar = ({ className }: P) => (
  <S className={className}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></S>
);
export const Video = ({ className }: P) => (
  <S className={className}><rect x="3" y="6" width="12" height="12" rx="2" /><path d="m15 10 6-3v10l-6-3" /></S>
);
export const Cube = ({ className }: P) => (
  <S className={className}><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" /><path d="M3 7l9 5 9-5M12 12v10" /></S>
);
export const Camera = ({ className }: P) => (
  <S className={className}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.2" /></S>
);
export const Star = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className ?? "h-[1em] w-[1em]"}>
    <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.5 9.2l5.9-.9L12 3Z" />
  </svg>
);
export const Clock = ({ className }: P) => (
  <S className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>
);
export const Search = ({ className }: P) => (
  <S className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></S>
);
export const Sliders = ({ className }: P) => (
  <S className={className}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M18 18h2" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="15" cy="18" r="2" /></S>
);
export const Chevron = ({ className }: P) => (
  <S className={className}><path d="m6 9 6 6 6-6" /></S>
);
export const Close = ({ className }: P) => (
  <S className={className}><path d="M6 6l12 12M18 6 6 18" /></S>
);
export const Flag = ({ className }: P) => (
  <S className={className}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></S>
);
export const Sparkle = ({ className }: P) => (
  <S className={className}><path d="M12 3v4M12 17v4M5 12H1M23 12h-4M6.3 6.3 8 8M18 18l1.7 1.7M17.7 6.3 16 8M8 16l-1.7 1.7" /><circle cx="12" cy="12" r="3" /></S>
);
export const Globe = ({ className }: P) => (
  <S className={className}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></S>
);
export const Trend = ({ className }: P) => (
  <S className={className}><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></S>
);
export const Users = ({ className }: P) => (
  <S className={className}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.9M17.5 14.6A5.5 5.5 0 0 1 20.5 20" />
  </S>
);
