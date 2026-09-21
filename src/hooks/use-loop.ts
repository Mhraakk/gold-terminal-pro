import { useCallback, useEffect, useState } from "react";

/** Cycles a counter on an interval. Stops when the viewer prefers reduced motion. */
export function useLoop(delay = 2400) {
  const [key, setKey] = useState(0);
  const incrementKey = useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const interval = window.setInterval(incrementKey, delay);
    return () => window.clearInterval(interval);
  }, [delay, incrementKey]);

  return { key };
}
