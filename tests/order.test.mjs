import test from "node:test";
import assert from "node:assert/strict";
import { canTransition, lineTotalPaise } from "../src/lib/domain/order.ts";
test("dine-in follows kitchen and serving stages", () => {
  for (const [from,to] of [["pending","accepted"],["accepted","preparing"],["preparing","ready"],["ready","served"],["served","completed"]]) assert.equal(canTransition(from,to,"dine_in"), true);
  assert.equal(canTransition("pending","completed","dine_in"), false);
});
test("order fulfillment differs by type", () => {
  assert.equal(canTransition("ready","out_for_delivery","delivery"), true);
  assert.equal(canTransition("ready","served","delivery"), false);
  assert.equal(canTransition("ready","completed","takeaway"), true);
});
test("terminal orders cannot reopen", () => {
  assert.equal(canTransition("cancelled","accepted","dine_in"), false);
  assert.equal(canTransition("completed","pending","delivery"), false);
});
test("money uses integer paise", () => {
  assert.equal(lineTotalPaise(24900,3),74700);
  for (const [price,qty] of [[-1,1],[100,0],[100,1.5],[1.5,1],[Number.MAX_SAFE_INTEGER,2]]) assert.throws(() => lineTotalPaise(price,qty),RangeError);
});
