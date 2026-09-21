export function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className={open ? "za-burger is-open" : "za-burger"} aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

export function ArrowGo() {
  return (
    <span className="za-arrow" aria-hidden>
      <span className="za-arrow-shaft" />
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
