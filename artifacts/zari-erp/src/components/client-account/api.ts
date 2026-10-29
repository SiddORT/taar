/* Isolated client-account API: plain fetch with same-origin cookies.
   Never uses employee tokens, customFetch, or the shared query cache. */
import type {
  ClientAccountDashboard, ClientAccountOrder, ClientAccountOrderContent,
  ClientConversationInput, ClientArtworkDecisionInput, ClientAccountAttachment,
} from "@workspace/api-client-react";

export const CLIENT_API = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api/client-auth`;

export class ClientApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function clientApi<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${CLIENT_API}${path}`, {
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

export const isAuthError = (x: unknown) => x instanceof ClientApiError &&
  (x.status === 401 || (x.status === 403 && x.message.startsWith("Change your temporary password")));

export const getDashboard = () => clientApi<ClientAccountDashboard>("/dashboard");
export const listOrders = async () => (await clientApi<{ data: ClientAccountOrder[] }>("/orders")).data ?? [];
export const getOrder = async (id: number) => (await clientApi<{ data: ClientAccountOrderContent }>(`/orders/${id}`)).data;
export const postMessage = (id: number, body: ClientConversationInput) => clientApi<unknown>(`/orders/${id}/messages`, { method: "POST", body });
export const postFeedback = (id: number, body: ClientArtworkDecisionInput) => clientApi<unknown>(`/orders/${id}/feedback`, { method: "POST", body });

/* ---------- shared bounds ---------- */
export const MAX_TEXT = 4000;
export const MAX_FILE = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "text/plain"];
export const ACCEPT = ALLOWED_TYPES.join(",");

export function readAttachment(file: File): Promise<ClientAccountAttachment> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type)) { reject(new Error("Only JPEG, PNG, WebP, GIF, PDF or plain text files are allowed.")); return; }
    if (file.size === 0 || file.size > MAX_FILE) { reject(new Error("Attachments must be non-empty and 5 MB or smaller.")); return; }
    const r = new FileReader();
    r.onload = () => {
      const data = String(r.result ?? "");
      if (!/^data:[^;]+;base64,/.test(data)) { reject(new Error("Could not read file.")); return; }
      resolve({ name: file.name, type: file.type, data, size: file.size });
    };
    r.onerror = () => reject(new Error("Could not read file."));
    r.readAsDataURL(file);
  });
}

export function fmtDate(v: string | null | undefined, time = false) {
  if (!v) return "Not set";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "Not set";
  return d.toLocaleString("en-IN", time
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtMoney(n: number, currency: string) {
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(n); }
  catch { return `${currency} ${n.toFixed(2)}`; }
}

export function safeHttpUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try { const x = new URL(u); return x.protocol === "http:" || x.protocol === "https:" ? x.href : null; } catch { return null; }
}

export function images(v: ClientAccountAttachment[] | null | undefined) {
  return (v ?? []).filter((x) => x && typeof x.data === "string" && x.data.length > 0 && (!x.type || x.type.startsWith("image/")));
}
