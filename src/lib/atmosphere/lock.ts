let count = 0;
const subs = new Set<() => void>();

export function atmosphereLocked() {
  return count > 0;
}

export function pauseAtmosphere() {
  count += 1;
  subs.forEach((fn) => fn());
}

export function resumeAtmosphere() {
  count = Math.max(0, count - 1);
  subs.forEach((fn) => fn());
}

export function onAtmosphereLock(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}
