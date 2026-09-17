import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useMaskedReveal(ref: RefObject<HTMLElement | null>, text = ""): void {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const inners = root.querySelectorAll<HTMLElement>(".reveal-inner");
    if (inners.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inners,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.055,
          scrollTrigger: {
            trigger: root,
            start: "top 82%",
            once: true,
          },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [ref, text]);
}
