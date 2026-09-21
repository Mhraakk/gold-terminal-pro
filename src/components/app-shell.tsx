import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Fingerprint,
  FolderKanban,
  LayoutDashboard,
  Library,
  Package,
  Printer,
  ScrollText,
  Sparkles,
  Workflow,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";

export const DESK_META = [
  { id: "board", label: "خانه", Icon: LayoutDashboard },
  { id: "brief", label: "تولید", Icon: Sparkles },
  { id: "atelier", label: "آرشیو", Icon: Library },
  { id: "dossier", label: "شناسنامه", Icon: ScrollText },
  { id: "production", label: "ساخت", Icon: Workflow },
  { id: "set", label: "ست", Icon: Package },
  { id: "collections", label: "کالکشن", Icon: FolderKanban },
  { id: "dna", label: "دی‌ان‌ای", Icon: Fingerprint },
  { id: "papers", label: "اصالت", Icon: Award },
  { id: "sheet", label: "برگه", Icon: Printer },
] as const;

export function AppShell({
  desk,
  title,
  children,
}: {
  desk: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="za-shell">
      <header className="za-top">
        <div>
          <p className="za-brand">زرین</p>
          <p className="za-title">{title}</p>
        </div>
        <UserButton />
      </header>
      <nav className="za-nav" aria-label="میزها">
        {DESK_META.map((item) => {
          const active = desk === item.id;
          return (
            <Link
              key={item.id}
              to="/"
              search={{ desk: item.id } as { desk: "board" }}
              className={active ? "za-tab is-active" : "za-tab"}
              aria-current={active ? "page" : undefined}
            >
              <item.Icon size={18} strokeWidth={1.75} aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <main className="za-main" id="desk">
        {children}
      </main>
    </div>
  );
}
