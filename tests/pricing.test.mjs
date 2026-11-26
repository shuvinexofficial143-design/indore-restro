import test from "node:test";import assert from "node:assert/strict";import {priceOrder} from "../src/lib/domain/pricing.ts";
test("discount cap and demo tax use paise and round once",()=>{assert.deepEqual(priceOrder(100000,60000,1000,5000,500),{subtotalPaise:100000,discountPaise:5000,taxPaise:4750,totalPaise:99750})});
test("zero defaults preserve subtotal",()=>assert.equal(priceOrder(28900,0,0,null,0).totalPaise,28900));
test("rejects negative and excessive tax",()=>{assert.throws(()=>priceOrder(100,200,100,0,0));assert.throws(()=>priceOrder(100,100,100,0,2501))});
