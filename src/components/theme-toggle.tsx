import { useLayoutEffect, useRef, useState } from "react";

const KEY = "za-theme";

function readTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  const saved = localStorage.getItem(KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function apply(theme: "dark" | "light") {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(KEY, theme);
}

function injectReveal(x: number, y: number) {
  const id = "za-theme-vt";
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = `
    ::view-transition-group(root) {
      animation-duration: 0.55s;
      animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    }
    ::view-transition-old(root) {
      animation: none;
      z-index: -1;
    }
    ::view-transition-new(root) {
      animation: za-reveal 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes za-reveal {
      from { clip-path: circle(0% at ${x}% ${y}%); }
      to { clip-path: circle(150% at ${x}% ${y}%); }
    }
  `;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const next = readTheme();
    setTheme(next);
    apply(next);
  }, []);

  const dark = theme === "dark";

  return (
    <button
      ref={btnRef}
      type="button"
      className="za-theme"
      aria-label={dark ? "حالت روشن" : "حالت تیره"}
      aria-pressed={!dark}
      onClick={() => {
        const next = dark ? "light" : "dark";
        const run = () => {
          setTheme(next);
          apply(next);
        };
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = document.startViewTransition?.bind(document);
        if (reduce || !start) {
          run();
          return;
        }
        const box = btnRef.current?.getBoundingClientRect();
        const x = box ? ((box.left + box.width / 2) / window.innerWidth) * 100 : 8;
        const y = box ? ((box.top + box.height / 2) / window.innerHeight) * 100 : 6;
        injectReveal(x, y);
        start(run);
      }}
    >
      <svg viewBox="0 0 240 240" fill="none" aria-hidden>
        <g className="za-theme-spin">
          <path d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5" fill="currentColor" />
          <path d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5" fill="var(--za-void)" />
        </g>
        <path
          className="za-theme-spin"
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
