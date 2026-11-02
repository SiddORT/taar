/** Pure helpers for the guided order-conversation selector. No React; safe to unit test. */
export type SelKind = "order" | "product" | "artwork";
export type SelTopic = { key: string; kind: SelKind; id?: number; closed?: boolean; unavailable?: boolean; productId?: number | null };

export const NO_PRODUCT = "none";
/** Artwork parent group: "p:<productId>" or "none" for order-level artwork. */
export const artworkGroup = (t: { productId?: number | null }) => t.productId != null ? `p:${t.productId}` : NO_PRODUCT;

/**
 * History scope: "" = everything, "pp:<productId>" = that product's own
 * messages plus every artwork message under it, any topic key = exactly that topic.
 */
export function topicInScope(scope: string, t: SelTopic | undefined, key: string): boolean {
  if (!scope) return true;
  if (scope.startsWith("pp:")) {
    const pid = Number(scope.slice(3));
    return (t?.kind === "product" && t.id === pid) || (t?.kind === "artwork" && t.productId === pid);
  }
  return key === scope;
}

/** Returns the topic to send to, or null when the selection is incomplete or read-only. Never falls back to General. */
export function resolveSendTopic<T extends SelTopic>(selectedKey: string, topics: Map<string, T>): T | null {
  if (!selectedKey) return null;
  const t = topics.get(selectedKey);
  if (!t || t.closed || t.unavailable) return null;
  return t;
}
