import { useEffect, useRef, useState } from "react";
import { X, Mail, KeyRound, Eye, EyeOff, RefreshCw, ShieldOff, Loader2 } from "lucide-react";
import type { ClientRecord } from "@/hooks/useClients";
import {
  useSendPortalAccess, useGenerateTemporaryPassword, useDisablePortalAccess, errorMessage,
  type PortalAccessMethod,
} from "@/hooks/useClientAccess";

interface Props {
  client: ClientRecord | null;
  onClose: () => void;
  onDone?: (message: string) => void;
}

const STATE_LABEL: Record<string, string> = {
  not_enabled: "Not enabled",
  pending: "Pending setup (invitation or temporary password)",
  enabled: "Enabled",
  disabled: "Disabled",
  delivery_failed: "Delivery failed",
};

function fmt(v: string | null | undefined) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return v; }
}

export default function ClientAccessModal({ client, onClose, onDone }: Props) {
  const open = client !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [method, setMethod] = useState<PortalAccessMethod>("invitation");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const send = useSendPortalAccess();
  const gen = useGenerateTemporaryPassword();
  const disable = useDisablePortalAccess();
  const busy = send.isPending || gen.isPending || disable.isPending;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  // Reset draft whenever a different client opens.
  useEffect(() => {
    setMethod("invitation"); setPassword(""); setReveal(false); setError(null); setConfirmDisable(false);
  }, [client?.id]);

  // Focus trap + Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const sel = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    node?.querySelector<HTMLElement>(sel)?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busyRef.current) { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(sel));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, [open]);

  if (!client) return null;
  const access = client.portalAccess;
  const state = access?.state ?? "not_enabled";
  const expired = !!access?.expiresAt && new Date(access.expiresAt).getTime() < Date.now() && state === "pending";
  const existing = state !== "not_enabled" && state !== "disabled";
  const canActivate = access?.eligible ?? false;

  async function generate() {
    if (!client) return;
    setError(null);
    try {
      const r = await gen.mutateAsync(client.id);
      setPassword(r.password); setReveal(false);
    } catch (e) { setError(errorMessage(e, "Could not generate a temporary password.")); }
  }

  function pick(m: PortalAccessMethod) {
    setMethod(m); setError(null);
    if (m === "temporary" && !password) void generate();
  }

  async function submit() {
    if (!client) return;
    setError(null);
    if (method === "temporary" && !password) { setError("Generate a temporary password first."); return; }
    try {
      await send.mutateAsync({ id: client.id, method, temporaryPassword: method === "temporary" ? password : undefined });
      setPassword("");
      onDone?.(method === "invitation" ? "Invitation email sent." : "Temporary credentials emailed.");
      onClose();
    } catch (e) {
      setError(errorMessage(e, "Email could not be delivered. Access state was refreshed; you can retry."));
    }
  }

  async function doDisable() {
    if (!client) return;
    setError(null);
    try {
      await disable.mutateAsync(client.id);
      onDone?.("Client login disabled.");
      onClose();
    } catch (e) { setError(errorMessage(e, "Could not disable access.")); setConfirmDisable(false); }
  }

  const sendLabel = existing
    ? (method === "invitation" ? "Resend invitation" : "Send replacement credentials")
    : (method === "invitation" ? "Send invitation" : "Send credentials");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="client-access-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md" data-testid="modal-client-access">
        <div className="flex items-start justify-between px-6 pt-6 pb-3 border-b border-gray-100">
          <div>
            <h2 id="client-access-title" className="text-lg font-semibold text-gray-900">Client Login Access</h2>
            <p className="text-sm text-gray-500">{client.brandName}</p>
          </div>
          <button aria-label="Close" onClick={onClose} disabled={busy} className="p-1 rounded hover:bg-gray-100 text-gray-500" data-testid="button-close-access">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="access-email" className="block text-xs font-medium text-gray-500 mb-1">Login email</label>
            <input id="access-email" readOnly value={client.email} data-testid="input-access-email"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700" />
          </div>

          <div className="rounded-lg bg-amber-50/60 border border-[#C9B45C]/40 px-3 py-2 text-xs text-gray-700" data-testid="text-access-state">
            <span className="font-semibold">Status:</span> {expired ? "Setup expired" : (STATE_LABEL[state] ?? state)}
            {access?.expiresAt && <> · {expired ? "expired" : "expires"} {fmt(access.expiresAt)}</>}
            {access?.deliveryStatus && <> · delivery: {access.deliveryStatus}</>}
          </div>

          {!canActivate && (
            <p className="text-xs text-red-600" data-testid="text-access-ineligible">
              {access?.reason ?? "This client needs at least one order and must be active before login can be issued."}
            </p>
          )}

          {canActivate && (
            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-gray-500 mb-1">Delivery method</legend>
              {([
                ["invitation", Mail, "Set-password invitation", "Recommended. Client chooses their own password (link valid 24h)."],
                ["temporary", KeyRound, "Temporary password", "Emailed password valid 24h; must be changed on first login."],
              ] as const).map(([m, Icon, title, desc]) => (
                <label key={m} className={`flex gap-3 rounded-lg border px-3 py-2.5 cursor-pointer ${method === m ? "border-cyan-900 bg-cyan-900/5" : "border-gray-200"}`}>
                  <input type="radio" name="access-method" value={m} checked={method === m} disabled={busy}
                    onChange={() => pick(m)} className="mt-1" data-testid={`radio-method-${m}`} />
                  <Icon size={16} className="mt-0.5 text-[#C6AF4B] shrink-0" />
                  <span><span className="block text-sm font-medium text-gray-800">{title}</span><span className="block text-xs text-gray-500">{desc}</span></span>
                </label>
              ))}
            </fieldset>
          )}

          {canActivate && method === "temporary" && (
            <div>
              <label htmlFor="temp-pass" className="block text-xs font-medium text-gray-500 mb-1">Temporary password (draft, not saved until sent)</label>
              <div className="flex gap-2">
                <input id="temp-pass" readOnly type={reveal ? "text" : "password"} value={gen.isPending ? "" : password}
                  placeholder={gen.isPending ? "Generating…" : ""} data-testid="input-temp-password"
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono" />
                <button type="button" onClick={() => setReveal((v) => !v)} aria-label={reveal ? "Hide password" : "Reveal password"}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" data-testid="button-reveal-password">
                  {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button type="button" onClick={() => void generate()} disabled={busy} aria-label="Regenerate password"
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50" data-testid="button-regenerate-password">
                  <RefreshCw size={16} className={gen.isPending ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          )}

          {error && <p role="alert" className="text-sm text-red-600" data-testid="text-access-error">{error}</p>}

          {confirmDisable && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Disable login? Pending links and active client sessions are revoked immediately.
              <div className="flex gap-2 mt-2">
                <button onClick={() => void doDisable()} disabled={busy} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium disabled:opacity-60" data-testid="button-confirm-disable">
                  {disable.isPending ? "Disabling…" : "Yes, disable"}
                </button>
                <button onClick={() => setConfirmDisable(false)} disabled={busy} className="px-3 py-1.5 rounded-md border border-red-200 text-xs" data-testid="button-cancel-disable">Keep access</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-6 pb-6">
          {existing ? (
            <button onClick={() => setConfirmDisable(true)} disabled={busy || confirmDisable}
              className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-50" data-testid="button-disable-access">
              <ShieldOff size={15} /> Disable login
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} disabled={busy} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50" data-testid="button-cancel-access">Cancel</button>
            {canActivate && (
              <button onClick={() => void submit()} disabled={busy || (method === "temporary" && !password)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-900 text-white text-sm font-medium hover:bg-cyan-950 disabled:opacity-50" data-testid="button-send-access">
                {send.isPending && <Loader2 size={15} className="animate-spin" />}{sendLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
