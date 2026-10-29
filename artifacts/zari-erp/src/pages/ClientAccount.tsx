import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { ClientAccountIdentity } from "@workspace/api-client-react";
import TaarBrand from "@/components/branding/TaarBrand";

import { clientApi as api, ClientApiError } from "@/components/client-account/api";
import Portal from "@/components/client-account/Portal";
const ROOT = import.meta.env.BASE_URL.replace(/\/$/, "");

type Me = ClientAccountIdentity;

function go(path: string) {
  window.history.pushState(null, "", `${ROOT}${path}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function pwBytes(p: string) { return new TextEncoder().encode(p).length; }
function pwProblem(p: string, c: string): string | null {
  if (p.length < 12) return "Password must be at least 12 characters.";
  if (pwBytes(p) > 72) return "Password is too long (max 72 bytes).";
  if (p !== c) return "Passwords do not match.";
  return null;
}

function readLinkToken(): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const t = hash.get("token") ?? new URLSearchParams(window.location.search).get("token");
  if (t) window.history.replaceState(null, "", window.location.pathname);
  return t;
}

/* ---------- Shell ---------- */
const AUTH_BG = `${import.meta.env.BASE_URL.replace(/\/?$/, "/")}brand/client-auth-background.webp`;

function Shell({ children, wide, backdrop }: { children: React.ReactNode; wide?: boolean; backdrop?: boolean }) {
  return (
    <div className="relative isolate min-h-[100dvh] bg-[#f7f4ec] text-gray-800" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {backdrop && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" data-testid="client-auth-backdrop">
          <div className="absolute inset-0 bg-cover bg-[position:20%_center] sm:bg-center" style={{ backgroundImage: `url("${AUTH_BG}")` }} />
          <div className="absolute inset-0 bg-[#f7f4ec]/45 sm:bg-gradient-to-r sm:from-[#f7f4ec]/10 sm:via-[#f7f4ec]/45 sm:to-[#f7f4ec]/30" />
        </div>
      )}
      <div className={`relative mx-auto px-4 py-10 ${backdrop ? "sm:py-16" : ""} ${wide ? "max-w-4xl" : "max-w-md"}`}>
        <div className="text-center mb-8">
          <TaarBrand width={140} className="mx-auto" />
          <div className="text-xs tracking-widest uppercase text-[#a8923a] mt-1">Client Portal</div>
        </div>
        <div style={{ fontFamily: "system-ui, sans-serif" }}>{children}</div>
      </div>
    </div>
  );
}

function Card({ children, raised }: { children: React.ReactNode; raised?: boolean }) {
  return <div className={`rounded-2xl border border-[#C9B45C]/30 p-6 ${raised ? "bg-white/95 shadow-[0_18px_50px_-20px_rgba(74,58,20,0.45)] backdrop-blur-sm" : "bg-white shadow-sm"}`}>{children}</div>;
}

function Field({ id, label, type = "text", value, onChange, autoComplete }: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input id={id} type={type} value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} required
        data-testid={`input-${id}`}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-900 focus:ring-2 focus:ring-cyan-900/10" />
    </div>
  );
}

function PasswordPair({ p, c, setP, setC }: { p: string; c: string; setP: (v: string) => void; setC: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const t = show ? "text" : "password";
  return (
    <div className="space-y-3">
      <Field id="new-password" label="New password (12+ characters)" type={t} value={p} onChange={setP} autoComplete="new-password" />
      <Field id="confirm-password" label="Confirm password" type={t} value={c} onChange={setC} autoComplete="new-password" />
      <button type="button" onClick={() => setShow((v) => !v)} className="inline-flex items-center gap-1.5 text-xs text-cyan-900" data-testid="button-toggle-reveal">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}{show ? "Hide passwords" : "Show passwords"}
      </button>
    </div>
  );
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={busy} data-testid="button-submit"
      className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-cyan-900 text-white py-2.5 text-sm font-medium hover:bg-cyan-950 disabled:opacity-60">
      {busy && <Loader2 size={15} className="animate-spin" />}{children}
    </button>
  );
}

function ErrorText({ msg }: { msg: string | null }) {
  return msg ? <p role="alert" className="text-sm text-red-600" data-testid="text-error">{msg}</p> : null;
}

/* ---------- /client ---------- */
export default function ClientAccount() {
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const loadMe = useCallback(async () => {
    setCheckError(null);
    try { setMe(await api<Me>("/me")); }
    catch (x) {
      // Revoked/disabled session: clear account content. Transient network error: keep current view.
      if (x instanceof ClientApiError && (x.status === 401 || x.status === 403)) setMe(null);
      else setCheckError(x instanceof Error ? x.message : "Could not check your session.");
    }
    finally { setChecking(false); }
  }, []);
  useEffect(() => { void loadMe(); }, [loadMe]);

  // Only drop the session view once the server confirmed logout (or the session is already gone).
  const logout = useCallback(async (): Promise<string | null> => {
    try { await api("/logout", { method: "POST", body: {} }); }
    catch (x) {
      if (!(x instanceof ClientApiError && x.status === 401)) {
        return x instanceof ClientApiError ? x.message : "Could not sign out. Check your connection and try again.";
      }
    }
    setMe(null);
    return null;
  }, []);

  if (checking) return <Shell backdrop><Card raised><div className="h-24 animate-pulse bg-gray-100 rounded-lg" /></Card></Shell>;
  if (!me && checkError) return <Shell backdrop><Card raised><ErrorText msg={checkError} /><button className="mt-3 text-sm text-cyan-900 hover:underline" onClick={() => void loadMe()} data-testid="button-retry">Retry</button></Card></Shell>;
  if (!me) return <LoginView notice={expired ? "Your session has ended. Please sign in again." : null} onLogin={(m) => { setExpired(false); setMe(m); }} />;
  if (me.mustChangePassword) return <ChangePasswordView me={me} onDone={loadMe} onLogout={logout} />;
  return <PortalSession me={me} onLogout={logout} onUnauthorized={() => { setExpired(true); setMe(null); }} onRecheck={loadMe} />;
}

function PortalSession({ me, onLogout, onUnauthorized, onRecheck }: {
  me: Me; onLogout: () => Promise<string | null>; onUnauthorized: () => void; onRecheck: () => Promise<void>;
}) {
  const recheckRef = useRef(onRecheck); recheckRef.current = onRecheck;
  // Re-verify the session on tab focus and every 5 minutes; a disabled account clears content via /me failing.
  useEffect(() => {
    const check = () => { if (document.visibilityState === "visible") void recheckRef.current(); };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    const t = window.setInterval(check, 5 * 60 * 1000);
    return () => { window.removeEventListener("focus", check); document.removeEventListener("visibilitychange", check); window.clearInterval(t); };
  }, []);
  return <Portal me={me} onLogout={onLogout} onUnauthorized={onUnauthorized} />;
}

function LoginView({ onLogin, notice }: { onLogin: (m: Me) => void; notice?: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try { onLogin(await api<Me>("/login", { method: "POST", body: { email: email.trim(), password } })); }
    catch (x) { setErr(x instanceof Error ? x.message : "Sign in failed."); }
    finally { setBusy(false); }
  }
  return (
    <Shell backdrop>
      <Card raised>
        <h1 className="text-lg font-semibold mb-4">Sign in</h1>
        {notice && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-[#8a7628]" data-testid="text-session-expired">{notice}</p>}
        <form onSubmit={submit} className="space-y-3">
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="username" />
          <Field id="password" label="Password" type={show ? "text" : "password"} value={password} onChange={setPassword} autoComplete="current-password" />
          <button type="button" onClick={() => setShow((v) => !v)} className="inline-flex items-center gap-1.5 text-xs text-cyan-900" data-testid="button-toggle-reveal">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}{show ? "Hide password" : "Show password"}
          </button>
          <ErrorText msg={err} />
          <Submit busy={busy}>Sign in</Submit>
        </form>
        <button onClick={() => go("/client/forgot-password")} className="mt-4 text-sm text-cyan-900 hover:underline" data-testid="link-forgot-password">Forgot password?</button>
      </Card>
    </Shell>
  );
}

function ChangePasswordView({ me, onDone, onLogout }: { me: Me; onDone: () => Promise<void>; onLogout: () => Promise<string | null> }) {
  const [p, setP] = useState(""); const [c, setC] = useState("");
  const [outErr, setOutErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const prob = pwProblem(p, c); if (prob) { setErr(prob); return; }
    setBusy(true); setErr(null);
    try { await api("/change-password", { method: "POST", body: { password: p } }); await onDone(); }
    catch (x) { setErr(x instanceof Error ? x.message : "Could not change password."); }
    finally { setBusy(false); }
  }
  return (
    <Shell>
      <Card>
        <h1 className="text-lg font-semibold">Choose a new password</h1>
        <p className="text-sm text-gray-500 mb-4">Signed in as {me.client.email}. Your temporary password must be replaced before continuing.</p>
        <form onSubmit={submit} className="space-y-3">
          <PasswordPair p={p} c={c} setP={setP} setC={setC} />
          <ErrorText msg={err} />
          <Submit busy={busy}>Save password</Submit>
        </form>
        <button onClick={async () => setOutErr(await onLogout())} className="mt-4 text-sm text-gray-500 hover:underline" data-testid="button-logout">Sign out</button>
        <ErrorText msg={outErr} />
      </Card>
    </Shell>
  );
}

/* ---------- /client/set-password ---------- */
export function ClientSetPassword() {
  const [token, setToken] = useState<string | null>(() => readLinkToken());
  const tokenRef = useRef(token);
  const [p, setP] = useState(""); const [c, setC] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  useEffect(() => {
    // Wouter keeps this component mounted when only a link's fragment or query
    // changes. A new link must never inherit the previous link's success state.
    const acceptLink = () => {
      const next = readLinkToken();
      if (!next) return;
      tokenRef.current = next;
      setToken(next); setP(""); setC(""); setErr(null); setDone(null); setBusy(false);
    };
    const events = ["hashchange", "popstate", "pushState", "replaceState"];
    events.forEach(event => window.addEventListener(event, acceptLink));
    return () => events.forEach(event => window.removeEventListener(event, acceptLink));
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const prob = pwProblem(p, c); if (prob) { setErr(prob); return; }
    setBusy(true); setErr(null);
    const submittedToken = token;
    try {
      const response = await api<{ message: string }>("/set-password", { method: "POST", body: { token, password: p } });
      if (tokenRef.current !== submittedToken) return;
      setDone(response.message || "Password set."); setP(""); setC("");
    }
    catch (x) { if (tokenRef.current === submittedToken) setErr(x instanceof Error ? x.message : "This link is invalid, expired, or already used."); }
    finally { if (tokenRef.current === submittedToken) setBusy(false); }
  }
  return (
    <Shell backdrop>
      <Card raised>
        <h1 className="text-lg font-semibold mb-4">Set your password</h1>
        {!token ? (
          <p className="text-sm text-red-600" role="alert" data-testid="text-error">This link is missing, expired, or has already been used. Ask TAAR for a new invitation or use “Forgot password”.</p>
        ) : done ? (
          <p className="text-sm text-emerald-700" data-testid="text-success">{done}</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <PasswordPair p={p} c={c} setP={setP} setC={setC} />
            <ErrorText msg={err} />
            <Submit busy={busy}>Set password</Submit>
          </form>
        )}
        <button onClick={() => go("/client")} className="mt-4 text-sm text-cyan-900 hover:underline" data-testid="link-sign-in">Go to sign in</button>
      </Card>
    </Shell>
  );
}

/* ---------- /client/forgot-password ---------- */
export function ClientForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try { setDone((await api<{ message: string }>("/forgot-password", { method: "POST", body: { email: email.trim() } })).message); }
    catch (x) { setErr(x instanceof Error ? x.message : "Could not send reset email."); }
    finally { setBusy(false); }
  }
  return (
    <Shell>
      <Card>
        <h1 className="text-lg font-semibold mb-4">Reset password</h1>
        {done ? <p className="text-sm text-emerald-700" data-testid="text-success">{done}</p> : (
          <form onSubmit={submit} className="space-y-3">
            <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="username" />
            <ErrorText msg={err} />
            <Submit busy={busy}>Send reset link</Submit>
          </form>
        )}
        <button onClick={() => go("/client")} className="mt-4 text-sm text-cyan-900 hover:underline" data-testid="link-sign-in">Back to sign in</button>
      </Card>
    </Shell>
  );
}
