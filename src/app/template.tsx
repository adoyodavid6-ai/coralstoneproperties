import { TransitionShell } from "@/lib/motion/TransitionShell";

// template.tsx remounts per App Router navigation — the entrance transition
// plays on every route change. Providers live in layout.tsx and survive.
export default function Template({ children }: { children: React.ReactNode }) {
  return <TransitionShell>{children}</TransitionShell>;
}
