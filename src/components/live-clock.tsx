import { useEffect, useState } from "react";
import { formatTehranDate, formatTehranTime } from "@/lib/format";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="text-left">
      <p className="label-tech mb-1">{now ? formatTehranDate(now) : "—"}</p>
      <p className="num text-xl font-medium tracking-widest text-fg">{now ? formatTehranTime(now) : "—:—:—"}</p>
    </div>
  );
}
