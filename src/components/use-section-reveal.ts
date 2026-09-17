import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap-boot";

export function useSectionReveal(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      scope.querySelectorAll<HTMLElement>("[data-nss-reveal]").forEach((el) => {
        if (reduce) {
          gsap.set(el, { autoAlpha: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
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
