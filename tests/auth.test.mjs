import test from "node:test";
import assert from "node:assert/strict";
import {hashPassword,verifyPassword,newToken,tokenHash,canAccess} from "../src/lib/domain/auth.ts";
test("password hash is salted and rejects invalid password",async()=>{const a=await hashPassword("long-test-password"),b=await hashPassword("long-test-password");assert.notEqual(a,b);assert.equal(await verifyPassword("long-test-password",a),true);assert.equal(await verifyPassword("wrong",a),false);assert.equal(await verifyPassword("wrong","malformed"),false);await assert.rejects(hashPassword("short"))});
test("session secrets are random and hashed",()=>{const a=newToken(),b=newToken();assert.match(a,/^[a-f0-9]{64}$/);assert.notEqual(a,b);assert.notEqual(a,tokenHash(a));assert.equal(tokenHash(a),tokenHash(a))});
test("role authorization denies unrelated staff",()=>{assert.equal(canAccess("owner","admin"),true);assert.equal(canAccess("manager","admin"),true);for(const role of ["kitchen","waiter","cashier"])assert.equal(canAccess(role,"admin"),false);assert.equal(canAccess("kitchen","kitchen"),true);assert.equal(canAccess("waiter","billing"),false)});
