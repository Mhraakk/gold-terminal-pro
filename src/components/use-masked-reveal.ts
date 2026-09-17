import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap-boot";

export function useMaskedReveal(ref: RefObject<HTMLElement | null>, text = ""): void {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const inners = root.querySelectorAll<HTMLElement>(".reveal-inner");
    if (inners.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(inners, { yPercent: 110 });
      gsap.to(inners, {
        yPercent: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.055,
        immediateRender: false,
        scrollTrigger: {
          trigger: root,
          start: "top 82%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [ref, text]);
}
