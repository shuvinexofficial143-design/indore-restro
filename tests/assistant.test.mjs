import test from "node:test";import assert from "node:assert/strict";import {sampleCatalog} from "../src/lib/catalog.ts";import {menuAnswer} from "../src/lib/domain/assistant.ts";
test("grounded vegetarian budget answer",()=>{const a=menuAnswer("vegetarian under 250",sampleCatalog);assert.ok(a.ids.length);for(const id of a.ids){const d=sampleCatalog.find(x=>x.id===id);assert.ok(d.veg&&d.pricePaise<=25000&&d.available)}});
test("no unverified allergen promises",()=>{const a=menuAnswer("nut allergy",sampleCatalog);assert.equal(a.ids.length,0);assert.match(a.text,/verified allergen/)});
