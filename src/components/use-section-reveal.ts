import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap-boot";

export function useSectionReveal(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    const nodes = scope.querySelectorAll<HTMLElement>("[data-nss-reveal]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nodes.forEach((el) => {
      el.style.visibility = "visible";
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
    });
    if (reduce) return;
    const ctx = gsap.context(() => {
      nodes.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 8 },
          {
            y: 0,
            duration: 0.18,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              once: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, scope);
    return () => ctx.revert();
  }, [ref]);
}