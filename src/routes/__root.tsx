import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { AppNotFound } from "@/components/not-found";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppErrorComponent } from "@/lib/error-component";
import { QueryRoot } from "@/lib/query";
import "@/lib/gsap-boot";
import appCss from "../styles.css?url";

const APP_NAME = "زرین — گلد ترمینال";

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
        content: "ترمینال طلا و ارز تهران — قیمت زنده، مظنه، کوانت و ساختار بازار.",
      },
      { name: "theme-color", content: "#030305" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Noto+Naskh+Arabic:wght@400;500;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css",
      },
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
