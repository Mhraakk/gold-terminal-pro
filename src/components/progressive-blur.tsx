export function ProgressiveBlur({ position }: { position: "top" | "bottom" }) {
  return <div className={position === "top" ? "za-pblur is-top" : "za-pblur is-bot"} aria-hidden />;
}
