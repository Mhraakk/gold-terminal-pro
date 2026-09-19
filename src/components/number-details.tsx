import type { HTMLAttributes, OlHTMLAttributes, ReactNode } from "react";

type Variant = "leading" | "stacked" | "stamp" | "rail";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function NdList({
  children,
  variant = "leading",
  start = 1,
  className = "",
  ...rest
}: OlHTMLAttributes<HTMLOListElement> & {
  variant?: Extract<Variant, "leading" | "stacked">;
  start?: number;
  children?: ReactNode;
}) {
  const from = Math.max(0, start - 1);
  return (
    <ol
      className={`nd-list ${className}`.trim()}
      data-nd={variant}
      style={{ ["--nd-from" as string]: String(from) }}
      {...rest}
    >
      {children}
    </ol>
  );
}

export function NdItem({
  children,
  current = false,
  className = "",
  ...rest
}: HTMLAttributes<HTMLLIElement> & {
  current?: boolean;
  children?: ReactNode;
}) {
  return (
    <li
      className={`nd-item ${className}`.trim()}
      data-state={current ? "current" : undefined}
      {...rest}
    >
      {children}
    </li>
  );
}

export function NdBody({
  title,
  detail,
}: {
  title: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="nd-body">
      <p className="nd-title">{title}</p>
      {detail ? <p className="nd-detail">{detail}</p> : null}
    </div>
  );
}

export function NdStamp({
  index,
  current = false,
  className = "",
}: {
  index: number;
  current?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`nd-stamp ${className}`.trim()}
      data-state={current ? "current" : undefined}
      aria-hidden="true"
    >
      <span className="nd-num">{pad(index)}</span>
    </span>
  );
}

export function NdRailNum({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  return (
    <span className={`nd-rail-num ${className}`.trim()} aria-hidden="true">
      <span className="nd-num">{pad(index)}</span>
    </span>
  );
}

export function NdRow({
  index,
  title,
  detail,
  variant = "leading",
  current = false,
  className = "",
}: {
  index: number;
  title: ReactNode;
  detail?: ReactNode;
  variant?: Extract<Variant, "leading" | "stacked">;
  current?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`nd-row ${className}`.trim()}
      data-nd={variant}
      data-state={current ? "current" : undefined}
    >
      <span className="nd-num" aria-hidden="true">
        {pad(index)}
      </span>
      <span className="nd-tick" aria-hidden="true" />
      <NdBody title={title} detail={detail} />
    </div>
  );
}
