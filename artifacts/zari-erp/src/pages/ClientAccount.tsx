import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, LogOut, ArrowLeft, Package } from "lucide-react";
import type {
  ClientAccountIdentity, ClientAccountOrder, ClientAccountOrderContent, ClientAccountAttachment,
} from "@workspace/api-client-react";
import TaarBrand from "@/components/branding/TaarBrand";

/* Isolated client-account API: plain fetch with same-origin cookies.
   Never uses employee tokens, customFetch, or the shared query cache. */
const API = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api/client-auth`;
const ROOT = import.meta.env.BASE_URL.replace(/\/$/, "");

class ClientApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    credentials: "same-origin",
    referrerPolicy: "no-referrer",
    headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) {
    const d = data as { error?: string; message?: string } | null;
    throw new ClientApiError(res.status, d?.error ?? d?.message ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

type Me = ClientAccountIdentity;
type OrderSummary = ClientAccountOrder;
type OrderDetail = ClientAccountOrderContent;

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

function fmtDate(v: string | null | undefined, time = false) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", time
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}

function imageUrls(v: ClientAccountAttachment[] | null | undefined): string[] {
  return (v ?? []).filter((x) => x && typeof x.data === "string" && x.data.length > 0 && (!x.type || x.type.startsWith("image/"))).map((x) => x.data);
}

/* ---------- Shell ---------- */
function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-[100dvh] bg-[#f7f4ec] text-gray-800" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className={`mx-auto px-4 py-10 ${wide ? "max-w-4xl" : "max-w-md"}`}>
        <div className="text-center mb-8">
          <TaarBrand width={140} className="mx-auto" />
          <div className="text-xs tracking-widest uppercase text-[#a8923a] mt-1">Client Portal</div>
        </div>
        <div style={{ fontFamily: "system-ui, sans-serif" }}>{children}</div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl shadow-sm border border-[#C9B45C]/30 p-6">{children}</div>;
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

  const loadMe = useCallback(async () => {
    try { setMe(await api<Me>("/me")); }
    catch (x) {
      // Revoked/disabled session: clear account content. Transient network error: keep current view.
      if (x instanceof ClientApiError) setMe(null);
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

  if (checking) return <Shell><Card><div className="h-24 animate-pulse bg-gray-100 rounded-lg" /></Card></Shell>;
  if (!me) return <LoginView onLogin={setMe} />;
  if (me.mustChangePassword) return <ChangePasswordView me={me} onDone={loadMe} onLogout={logout} />;
  return <HomeView me={me} onLogout={logout} onUnauthorized={() => setMe(null)} onRecheck={loadMe} />;
}

function LoginView({ onLogin }: { onLogin: (m: Me) => void }) {
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
    <Shell>
      <Card>
        <h1 className="text-lg font-semibold mb-4">Sign in</h1>
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

function HomeView({ me, onLogout, onUnauthorized, onRecheck }: {
  me: Me; onLogout: () => Promise<string | null>; onUnauthorized: () => void; onRecheck: () => Promise<void>;
}) {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [logoutErr, setLogoutErr] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const recheckRef = useRef(onRecheck); recheckRef.current = onRecheck;

  // Re-verify the session on tab focus and every 5 minutes; a disabled account clears content via /me failing.
  useEffect(() => {
    const check = () => { if (document.visibilityState === "visible") void recheckRef.current(); };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    const t = window.setInterval(check, 5 * 60 * 1000);
    return () => { window.removeEventListener("focus", check); document.removeEventListener("visibilitychange", check); window.clearInterval(t); };
  }, []);
  const [selected, setSelected] = useState<number | null>(null);
  const unauthRef = useRef(onUnauthorized); unauthRef.current = onUnauthorized;

  const load = useCallback(async () => {
    setErr(null); setOrders(null);
    try { setOrders((await api<{ data: OrderSummary[] }>("/orders")).data ?? []); }
    catch (x) {
      if (x instanceof ClientApiError && (x.status === 401 || x.status === 403)) { setOrders([]); unauthRef.current(); return; }
      setErr(x instanceof Error ? x.message : "Could not load orders.");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function handleLogout() {
    setLoggingOut(true); setLogoutErr(null);
    const e = await onLogout();
    setLoggingOut(false);
    if (e) setLogoutErr(e);
  }

  return (
    <Shell wide>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">Welcome</p>
          <p className="text-lg font-semibold" data-testid="text-client-name">{me.client.name}</p>
        </div>
        <button onClick={() => void handleLogout()} disabled={loggingOut} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50 disabled:opacity-60" data-testid="button-logout">
          {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />} Sign out
        </button>
      </div>
      {logoutErr && <div className="mb-4"><ErrorText msg={logoutErr} /></div>}
      {selected !== null ? (
        <OrderView id={selected} onBack={() => setSelected(null)} onUnauthorized={onUnauthorized} />
      ) : err ? (
        <Card><ErrorText msg={err} /><button onClick={() => void load()} className="mt-3 text-sm text-cyan-900 hover:underline" data-testid="button-retry">Retry</button></Card>
      ) : orders === null ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-white/70 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <Card><div className="text-center py-8 text-gray-500"><Package className="mx-auto mb-2 text-[#C6AF4B]" />No orders have been shared with you yet.</div></Card>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <button onClick={() => setSelected(o.id)} data-testid={`card-order-${o.id}`}
                className="w-full text-left bg-white rounded-xl border border-[#C9B45C]/30 px-5 py-4 hover:border-cyan-900 transition-colors">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{o.portalTitle || o.orderName}</span>
                  <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-50 text-[#8a7628]">{o.orderType}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{o.orderCode} · {o.orderName}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

function OrderView({ id, onBack, onUnauthorized }: { id: number; onBack: () => void; onUnauthorized: () => void }) {
  const [d, setD] = useState<OrderDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const unauthRef = useRef(onUnauthorized); unauthRef.current = onUnauthorized;
  useEffect(() => {
    let alive = true;
    api<{ data: OrderDetail }>(`/orders/${id}`).then((r) => { if (alive) setD(r.data); }).catch((x) => {
      if (!alive) return;
      if (x instanceof ClientApiError && (x.status === 401 || x.status === 403)) { unauthRef.current(); return; }
      setErr(x instanceof Error ? x.message : "Could not load order.");
    });
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-cyan-900 hover:underline" data-testid="button-back"><ArrowLeft size={15} /> All orders</button>
      {err ? <Card><ErrorText msg={err} /></Card> : !d ? <div className="h-40 rounded-xl bg-white/70 animate-pulse" /> : (
        <>
          <Card>
            <h2 className="text-lg font-semibold" data-testid="text-order-title">{d.link.portalTitle || d.order.orderName}</h2>
            <p className="text-xs text-gray-500">{d.order.orderCode} · {d.link.orderType}</p>
            {d.order.description && <p className="text-sm mt-3 whitespace-pre-wrap">{d.order.description}</p>}
            <div className="flex gap-6 mt-3 text-sm">
              <span><span className="text-gray-500">Status:</span> {d.order.orderStatus ?? "—"}</span>
              <span><span className="text-gray-500">Delivery:</span> {fmtDate(d.order.deliveryDate)}</span>
            </div>
          </Card>
          {d.artworks.length === 0 ? <Card><p className="text-sm text-gray-500">No artworks published yet.</p></Card> : d.artworks.map((a) => {
            const imgs = [...imageUrls(a.finalImages), ...imageUrls(a.wipImages)];
            const msgs = d.messages.filter((m) => m.artworkId === a.id);
            return (
              <Card key={a.id}>
                <div className="flex justify-between gap-3">
                  <div><p className="font-medium">{a.artworkName}</p><p className="text-xs text-gray-500">{a.artworkCode}</p></div>
                  <span className="text-xs text-gray-500">{a.decision ?? (a.isClosed ? "Closed" : "In progress")}</span>
                </div>
                {imgs.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    {imgs.map((u, i) => <img key={i} src={u} alt={`${a.artworkName} ${i + 1}`} referrerPolicy="no-referrer" className="aspect-square object-cover rounded-lg border border-gray-100" />)}
                  </div>
                )}
                {msgs.length > 0 && (
                  <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                    {msgs.map((m) => <li key={m.id} className="text-sm"><span className="font-medium">{m.sender}</span> <span className="text-xs text-gray-400">{fmtDate(m.createdAt, true)}</span>{m.message && <p className="whitespace-pre-wrap">{m.message}</p>}{m.attachment?.type?.startsWith("image/") && <img src={m.attachment.data} alt={m.attachment.name} referrerPolicy="no-referrer" className="mt-1 max-h-40 rounded-md border border-gray-100" />}</li>)}
                  </ul>
                )}
              </Card>
            );
          })}
        </>
      )}
    </div>
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
    <Shell>
      <Card>
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
