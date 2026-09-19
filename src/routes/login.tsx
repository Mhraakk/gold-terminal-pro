import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="nss-section min-h-dvh">
      <div className="nss-shell mx-auto max-w-sm">
        <div className="nss-face">
          <p className="nss-label">ZARIN</p>
          <h1 className="nss-display" style={{ fontSize: 32, lineHeight: 1.1 }}>ورود آتلیه</h1>
          <p className="nss-body mt-2">دادهٔ هر سازمان جدا است. کلید سکرت روی کلاینت نیست.</p>
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="nss-chip nss-link mt-4 w-full justify-center"
              >
                ادامه با {p.label}
              </button>
            ))
          ) : (
            <p className="nss-meta mt-4">ورود خاموش است.</p>
          )}
        </div>
      </div>
    </main>
  );
}
