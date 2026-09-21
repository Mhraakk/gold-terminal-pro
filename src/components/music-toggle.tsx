import { useEffect, useRef, useState } from "react";

const BARS = 5;

export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [heights, setHeights] = useState(() => Array(BARS).fill(0.12));

  useEffect(() => {
    const el = new Audio("/audio/atelier.wav");
    el.loop = true;
    el.volume = 0.35;
    audioRef.current = el;
    return () => {
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!on) {
      setHeights(Array(BARS).fill(0.12));
      return;
    }
    const id = window.setInterval(() => {
      setHeights(Array.from({ length: BARS }, () => 0.2 + Math.random() * 0.8));
    }, 110);
    return () => window.clearInterval(id);
  }, [on]);

  return (
    <button
      type="button"
      className="za-music"
      data-on={on ? "true" : "false"}
      aria-pressed={on}
      aria-label={on ? "قطع صدای آتلیه" : "پخش صدای آتلیه"}
      onClick={() => {
        const el = audioRef.current;
        if (!el) return;
        if (on) {
          el.pause();
          setOn(false);
          return;
        }
        void el.play().then(() => setOn(true)).catch(() => setOn(false));
      }}
    >
      {heights.map((h, i) => (
        <i key={i} style={{ height: `${Math.max(3, h * 14)}px` }} />
      ))}
    </button>
  );
}
