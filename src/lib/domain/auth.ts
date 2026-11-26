import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
const derive = promisify(scrypt);
export const roles = ["owner","manager","kitchen","waiter","cashier"] as const;
export type Role = typeof roles[number];
export function canAccess(role: Role, area: "admin"|"kitchen"|"waiter"|"billing") {
  return role==="owner" || role==="manager" || (role==="kitchen"&&area==="kitchen") || (role==="waiter"&&area==="waiter") || (role==="cashier"&&area==="billing");
}
export async function hashPassword(password:string) {
 if(password.length<12 || password.length>128) throw new Error("Password must contain 12–128 characters");
 const salt=randomBytes(16).toString("hex");
 const key=await derive(password,salt,64) as Buffer;
 return "scrypt:"+salt+":"+key.toString("hex");
}
export async function verifyPassword(password:string,stored:string) {
 if(password.length>128 || !/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/.test(stored)) return false;
 const [,salt,key]=stored.split(":");
 return timingSafeEqual(await derive(password,salt,64) as Buffer,Buffer.from(key,"hex"));
}
export function newToken(){return randomBytes(32).toString("hex")}
export function tokenHash(token:string){return createHash("sha256").update(token).digest("hex")}
