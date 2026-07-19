"use client";

// Single import point for GSAP — registers plugins exactly once.
// Never import gsap/three from a server component; everything motion-related
// flows through the client components in this folder.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Site-wide motion defaults — one voice for every tween.
gsap.defaults({ ease: "power3.out", duration: 0.9 });

export { gsap, ScrollTrigger, SplitText };
