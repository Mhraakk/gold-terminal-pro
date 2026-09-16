import type { AssetId } from "@/data/market/types";

const PORT_KEY = "zarin-portfolio-v1";
const ALERT_KEY = "zarin-alerts-v1";

export interface Position {
  id: string;
  assetId: AssetId;
  side: "buy" | "sell";
  qty: number;
  entry: number;
  note: string;
  at: number;
}

export interface PriceAlert {
  id: string;
  assetId: AssetId;
  direction: "above" | "below";
  price: number;
  createdAt: number;
  fired: boolean;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadPositions(): Position[] {
  return read(PORT_KEY, [] as Position[]);
}

export function savePositions(items: Position[]): void {
  localStorage.setItem(PORT_KEY, JSON.stringify(items));
}

export function loadAlerts(): PriceAlert[] {
  return read(ALERT_KEY, [] as PriceAlert[]);
}

export function saveAlerts(items: PriceAlert[]): void {
  localStorage.setItem(ALERT_KEY, JSON.stringify(items));
}
