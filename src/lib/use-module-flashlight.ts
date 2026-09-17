import { useEffect, type RefObject } from "react";

const EDGE_BAND = 72;

/** Writes --cursor-angle and --proximity onto the shell ref. */
export function useModuleFlashlight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const shell = ref.current;
    if (!shell) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onMove = (e: PointerEvent) => {
      if (reduce.matches) {
        shell.style.setProperty("--proximity", "0.35");
        return;
      }
      const rect = shell.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      shell.style.setProperty("--cursor-angle", `${deg}deg`);

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dist = Math.min(x, y, rect.width - x, rect.height - y);
      const t = 1 - Math.min(Math.max(dist / EDGE_BAND, 0), 1);
      shell.style.setProperty("--proximity", String(t));
    };

    const onLeave = () => {
      if (reduce.matches) return;
      shell.style.setProperty("--proximity", "0");
    };

    if (reduce.matches) {
      shell.style.setProperty("--proximity", "0.35");
    }

    shell.addEventListener("pointermove", onMove);
    shell.addEventListener("pointerleave", onLeave);
    return () => {
      shell.removeEventListener("pointermove", onMove);
      shell.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}
