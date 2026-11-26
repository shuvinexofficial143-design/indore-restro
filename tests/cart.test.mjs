import test from "node:test";
import assert from "node:assert/strict";
import {sampleCatalog} from "../src/lib/catalog.ts";
import {unitPrice,cartTotal} from "../src/lib/domain/cart.ts";
test("44 unique sample dishes and positive prices",()=>{assert.equal(sampleCatalog.length,44);assert.equal(new Set(sampleCatalog.map(d=>d.id)).size,44);assert.ok(sampleCatalog.every(d=>d.pricePaise>0))});
test("cart includes variants and addons",()=>{const item=sampleCatalog.find(d=>d.id==="paneer");assert.equal(unitPrice(item,"full",true),35800);assert.equal(cartTotal([{id:"paneer",variant:"full",addon:true,quantity:2}],sampleCatalog),71600)});
test("invalid option or quantity rejected",()=>{const item=sampleCatalog.find(d=>d.id==="jamun");assert.throws(()=>unitPrice(item,"half",false));assert.throws(()=>cartTotal([{id:"jamun",variant:"full",addon:false,quantity:21}],sampleCatalog))});
