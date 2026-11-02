import { test } from "node:test";
import assert from "node:assert/strict";
import { artworkGroup, NO_PRODUCT, resolveSendTopic, topicInScope } from "./topicSelection.ts";

const general = { key: "order", kind: "order" };
const jacket = { key: "product:10", kind: "product", id: 10, label: "Jacket" };
const trousers = { key: "product:20", kind: "product", id: 20, label: "Trousers" };
const jacketLogo = { key: "artwork:1", kind: "artwork", id: 1, productId: 10, label: "Logo" };
const trousersLogo = { key: "artwork:2", kind: "artwork", id: 2, productId: 20, label: "Logo" };
const standalone = { key: "artwork:3", kind: "artwork", id: 3, productId: null };
const topics = new Map([general, jacket, trousers, jacketLogo, trousersLogo, standalone].map(t => [t.key, t]));

test("incomplete and stale selections cannot fall back to General or another target", () => {
  for (const key of ["", "product:", "artwork:999", "unknown"]) {
    assert.equal(resolveSendTopic(key, topics), null);
  }
  assert.equal(resolveSendTopic("order", topics), general);
});

test("same-named artwork under different products retains its exact identity", () => {
  assert.equal(resolveSendTopic("artwork:1", topics), jacketLogo);
  assert.equal(resolveSendTopic("artwork:2", topics), trousersLogo);
  assert.notEqual(resolveSendTopic("artwork:1", topics), resolveSendTopic("artwork:2", topics));
});

test("closed and withdrawn topics remain unsendable without blocking other topics", () => {
  for (const state of [{ closed: true }, { unavailable: true }]) {
    const map = new Map(topics).set(jacketLogo.key, { ...jacketLogo, ...state });
    assert.equal(resolveSendTopic(jacketLogo.key, map), null);
    assert.equal(resolveSendTopic(trousersLogo.key, map), trousersLogo);
    assert.equal(resolveSendTopic("order", map), general);
  }
});

test("product history includes its product discussion and its artworks, never another product", () => {
  assert.equal(topicInScope("pp:10", jacket, jacket.key), true);
  assert.equal(topicInScope("pp:10", jacketLogo, jacketLogo.key), true);
  for (const t of [general, trousers, trousersLogo, standalone]) {
    assert.equal(topicInScope("pp:10", t, t.key), false);
  }
});

test("specific artwork history excludes every other artwork and product discussion", () => {
  for (const t of topics.values()) {
    assert.equal(topicInScope("artwork:1", t, t.key), t === jacketLogo);
  }
});

test("product-discussion-only history does not accidentally include child artworks", () => {
  assert.equal(topicInScope(jacket.key, jacket, jacket.key), true);
  assert.equal(topicInScope(jacket.key, jacketLogo, jacketLogo.key), false);
});

test("Show all restores General, products, standalone and same-named artworks", () => {
  for (const t of topics.values()) assert.equal(topicInScope("", t, t.key), true);
  assert.equal(topicInScope("", undefined, "legacy:1"), true);
});

test("swatch and unassigned style artwork have a usable order-level group", () => {
  assert.equal(artworkGroup(standalone), NO_PRODUCT);
  assert.equal(artworkGroup({}), NO_PRODUCT);
  assert.equal(artworkGroup(jacketLogo), "p:10");
  assert.equal(artworkGroup(trousersLogo), "p:20");
  assert.equal(resolveSendTopic(standalone.key, topics), standalone);
});
