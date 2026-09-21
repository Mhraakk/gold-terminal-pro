import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Fingerprint,
  FolderKanban,
  House,
  Library,
  MoreHorizontal,
  Package,
  Printer,
  ScrollText,
  Sparkles,
  Workflow,
} from "lucide-react";
import { MusicToggle } from "@/components/music-toggle";
import { TextRoll } from "@/components/text-roll";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@/lib/auth/gates";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const DESK_META = [
  { id: "board", label: "خانه", Icon: House },
  { id: "brief", label: "ساخت", Icon: Sparkles },
  { id: "atelier", label: "آرشیو", Icon: Library },
  { id: "dossier", label: "شناسنامه", Icon: ScrollText },
  { id: "production", label: "خط تولید", Icon: Workflow },
  { id: "set", label: "ست پکیج", Icon: Package },
  { id: "collections", label: "کالکشن", Icon: FolderKanban },
  { id: "dna", label: "دی‌ان‌ای", Icon: Fingerprint },
  { id: "papers", label: "اصالت", Icon: Award },
  { id: "sheet", label: "برگه ارائه", Icon: Printer },
] as const;

const PRIMARY = ["board", "brief", "atelier"] as const;
const MORE = DESK_META.filter((d) => !PRIMARY.includes(d.id as (typeof PRIMARY)[number]));

export function AppShell({
  desk,
  title,
  children,
}: {
  desk: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const moreActive = MORE.some((d) => d.id === desk);

  return (
    <TooltipProvider>
    <div className="za-shell">
      <header className="za-top">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="za-brand">زرین</button>
          </TooltipTrigger>
          <TooltipContent side="bottom">آتلیه کانسپت طلا</TooltipContent>
        </Tooltip>
        <div className="za-top-actions">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <MusicToggle />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">صدای آتلیه</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <ThemeToggle />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">تغییر زمینه</TooltipContent>
          </Tooltip>
          <UserButton />
        </div>
      </header>
      <main className="za-main" id="desk">
        <p className="za-kicker">{title}</p>
        {children}
      </main>
      {open ? (
        <div className="za-sheet" role="dialog" aria-label="میزهای دیگر">
          <button type="button" className="za-sheet-dismiss" onClick={() => setOpen(false)} aria-label="بستن" />
          <div className="za-sheet-panel">
            <p className="za-kicker">بقیه میزها</p>
            {MORE.map((item) => (
              <Link
                key={item.id}
                to="/"
                search={{ desk: item.id } as { desk: "board" }}
                className={desk === item.id ? "za-more is-active" : "za-more"}
                onClick={() => setOpen(false)}
              >
                <item.Icon size={18} strokeWidth={1.75} aria-hidden />
                <TextRoll>{item.label}</TextRoll>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <nav className="za-dock" aria-label="میزها">
        {DESK_META.filter((d) => PRIMARY.includes(d.id as (typeof PRIMARY)[number])).map((item) => {
          const active = desk === item.id;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Link
                  to="/"
                  search={{ desk: item.id } as { desk: "board" }}
                  className={active ? "za-tab is-active" : "za-tab"}
                  aria-current={active ? "page" : undefined}
                >
                  <item.Icon size={22} strokeWidth={1.7} aria-hidden />
                  <TextRoll>{item.label}</TextRoll>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={moreActive || open ? "za-tab is-active" : "za-tab"}
              onClick={() => setOpen((v) => !v)}
            >
              <MoreHorizontal size={22} strokeWidth={1.7} aria-hidden />
              <TextRoll>بیشتر</TextRoll>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">شناسنامه، ست، کالکشن</TooltipContent>
        </Tooltip>
      </nav>
    </div>
    </TooltipProvider>
  );
}
