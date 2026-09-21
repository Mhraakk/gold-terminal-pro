import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { AppNotFound } from "@/components/not-found";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppErrorComponent } from "@/lib/error-component";
import { QueryRoot } from "@/lib/query";
import appCss from "../styles.css?url";
import faFontCss from "../styles-fa.css?url";

const APP_NAME = "زرین — آتلیه کانسپت";

export const Route = createRootRoute({
  notFoundComponent: AppNotFound,
  errorComponent: AppErrorComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "آتلیهٔ کانسپت طلای لوکس — ایده، ساخت، پکیج و شناسنامه بدون تکرار.",
      },
      { name: "theme-color", content: "#030305" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: faFontCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <QueryRoot>
            <Outlet />
          </QueryRoot>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
