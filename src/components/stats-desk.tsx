import { FrameCard } from "@/components/frame";
import { formatPct, formatPrice } from "@/lib/format";
import type { MarketQuote } from "@/data/market/types";

export function StatsDesk({ quotes }: { quotes: MarketQuote[] }) {
  const live = quotes.filter((q) => q.freshness !== "unavailable" && q.price > 0);
  return (
    <div className="fg-grid" data-recipe="builder">
      <FrameCard className="p-5">
        <p className="label-tech">RANGE · LIVE</p>
        <h3 className="mt-1 text-lg font-light">نوسان روز از سقف و کف زنده</h3>
        <p className="mt-2 text-xs text-muted">این نوسان از high/low همان چاپ است، نه از تاریخچهٔ ساختگی.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {live.map((q) => {
            const range = q.high > 0 && q.low > 0 ? ((q.high - q.low) / q.price) * 100 : 0;
            return (
              <li key={q.id} className="well flex items-center justify-between p-3 text-sm">
                <span>{q.persianName}</span>
                <span className="num text-gold">
                  {formatPct(range)} · {formatPrice(q.low, q.decimals)}–{formatPrice(q.high, q.decimals)}
                </span>
              </li>
            );
          })}
        </ul>
      </FrameCard>
      <FrameCard className="p-5">
        <p className="label-tech">CO-MOVE TODAY</p>
        <h3 className="mt-1 text-lg font-light">هم‌جهتی تغییر امروز</h3>
        <p className="mt-2 text-xs text-muted">
          علامت تغییر درصد امروز بین جفت‌ها. همبستگی تاریخی نیست — فقط هم‌جهتی همین چاپ.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-right text-xs">
            <thead>
              <tr>
                <th className="p-2 text-muted"> </th>
                {live.map((q) => (
                  <th key={q.id} className="p-2 font-normal text-muted">
                    {q.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {live.map((a) => (
                <tr key={a.id}>
                  <td className="p-2 text-muted">{a.symbol}</td>
                  {live.map((b) => {
                    const same = Math.sign(a.changePercent) === Math.sign(b.changePercent);
                    const zero = a.changePercent === 0 || b.changePercent === 0;
                    return (
                      <td key={b.id} className="num p-2">
                        <span className={zero ? "text-muted" : same ? "text-up" : "text-down"}>
                          {zero ? "—" : same ? "+" : "−"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FrameCard>
    </div>
  );
}
