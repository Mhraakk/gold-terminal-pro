import type { ButtonHTMLAttributes, ReactNode } from "react";

export function SkBtn({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <span className={`sk-wrap ${className}`.trim()}>
      <button type="button" className="sk-face sk-face-dots" {...props}>
        <span className="sk-ink">{children}</span>
      </button>
    </span>
  );
}

export function SkTray({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`sk-wrap sk-tray ${className}`.trim()}>
      <div className="sk-face sk-face-carved sk-face-dots">{children}</div>
    </div>
  );
}
