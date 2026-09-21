import { useLayoutEffect, useState } from "react";

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

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useLayoutEffect(() => {
    const next = readTheme();
    setTheme(next);
    apply(next);
  }, []);

  const dark = theme === "dark";

  return (
    <button
      type="button"
      className="za-theme"
      aria-label={dark ? "حالت روشن" : "حالت تیره"}
      aria-pressed={!dark}
      onClick={() => {
        const next = dark ? "light" : "dark";
        setTheme(next);
        apply(next);
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
