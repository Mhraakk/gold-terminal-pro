import { type ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type SmoothInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  type?: "text" | "password" | "number";
  wrapperClassName?: string;
};

const PASSWORD_CHAR =
  typeof navigator !== "undefined" && /firefox|fxios/i.test(navigator.userAgent) ? "\u25CF" : "\u2022";

export function SmoothInput({
  className,
  wrapperClassName,
  value,
  defaultValue,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  style,
  ...props
}: SmoothInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [caret, setCaret] = useState({ x: 0, on: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const isControlled = value !== undefined;
  const inputValue = isControlled ? String(value) : String(internalValue);

  const updateCaretFromInput = (target: HTMLInputElement) => {
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    const hasSelection = start !== end;
    const caretIndex = start === end ? start : target.selectionDirection === "backward" ? start : end;
    const isPassword = target.type === "password";
    const textBeforeCaret = isPassword ? PASSWORD_CHAR.repeat(caretIndex) : target.value.slice(0, caretIndex);
    const measureSpan = measureRef.current;
    if (!measureSpan) return;
    const styles = window.getComputedStyle(target);
    measureSpan.style.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
    measureSpan.style.letterSpacing = styles.letterSpacing;
    measureSpan.textContent = textBeforeCaret;
    const padStart = parseFloat(styles.paddingInlineStart || styles.paddingLeft) || 0;
    const absoluteWidth = textBeforeCaret.length > 0 ? measureSpan.offsetWidth + padStart : padStart;
    const rtl = styles.direction === "rtl";
    const padEnd = parseFloat(rtl ? styles.paddingLeft : styles.paddingRight) || 0;
    const visual = rtl
      ? target.clientWidth - padEnd - (absoluteWidth - padStart)
      : absoluteWidth - target.scrollLeft;
    setCaret({
      x: Math.max(0, Math.min(visual, target.clientWidth - padEnd)),
      on: !hasSelection && document.activeElement === target,
    });
  };

  const updateCaretRef = useRef(updateCaretFromInput);
  updateCaretRef.current = updateCaretFromInput;

  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) updateCaretRef.current(input);
  }, [inputValue]);

  useEffect(() => {
    const input = inputRef.current;
    const container = containerRef.current;
    if (!input || !container) return;
    const onSel = () => {
      if (document.activeElement === input) {
        requestAnimationFrame(() => {
          if (document.activeElement === input) updateCaretRef.current(input);
        });
      }
    };
    document.addEventListener("selectionchange", onSel);
    input.addEventListener("scroll", onSel);
    const ro = new ResizeObserver(onSel);
    ro.observe(container);
    return () => {
      document.removeEventListener("selectionchange", onSel);
      input.removeEventListener("scroll", onSel);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("za-smooth", wrapperClassName)}>
      <div ref={containerRef} className="relative grid grid-cols-1 p-0" style={{ caretColor: "transparent" }}>
        <input
          {...props}
          ref={inputRef}
          type={type === "number" ? "text" : type}
          inputMode={type === "number" ? "decimal" : props.inputMode}
          placeholder={placeholder}
          className={cn("col-start-1 col-end-2 row-start-1 row-end-2 w-full bg-transparent text-inherit outline-none", className)}
          style={style}
          value={inputValue}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            onChange?.(e);
            requestAnimationFrame(() => updateCaretRef.current(e.target));
          }}
          onBlur={(e) => {
            setCaret((c) => ({ ...c, on: false }));
            onBlur?.(e);
          }}
          onFocus={(e) => {
            requestAnimationFrame(() => updateCaretRef.current(e.currentTarget));
          }}
        />
        <span ref={measureRef} aria-hidden className="pointer-events-none invisible absolute top-0 start-0 whitespace-pre" />
        <div
          className="za-caret pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2 h-[0.9em] w-0.5 self-center"
          style={{ transform: `translateX(${caret.x}px)`, opacity: caret.on ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
