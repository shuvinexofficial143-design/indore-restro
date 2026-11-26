"use server";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {and,eq,sql} from "drizzle-orm";
import {z} from "zod";
import {database} from "@/lib/db";
import {customers,customerSessions,customerAddresses,loginAttempts} from "@/lib/db/schema";
import {orderingRestaurant,lockDemoWrite} from "@/lib/demo-context";
import {customerCookie,currentCustomer} from "@/lib/customer-session";
import {hashPassword,verifyPassword,newToken,tokenHash} from "@/lib/domain/auth";
const input=z.object({mode:z.enum(["login","register"]),email:z.string().trim().toLowerCase().email().max(100).refine(v=>v.endsWith("@example.invalid")),name:z.string().trim().max(60),password:z.string().min(12).max(128)});
export async function customerLogin(_state:string,form:FormData){const r=await orderingRestaurant();if(!r)return "Demo accounts are not enabled.";const parsed=input.safeParse(Object.fromEntries(form));if(!parsed.success)return "Use a fictional @example.invalid email and a password of at least 12 characters.";const d=parsed.data;if(d.mode==="register"&&!d.name)return "Enter a fictional display name.";try{
const db=database(),key=tokenHash("customer:"+r.id+":"+d.email);
const [attempt]=await db.insert(loginAttempts).values({key,count:1,windowStart:new Date()}).onConflictDoUpdate({target:loginAttempts.key,set:{count:sql`case when ${loginAttempts.windowStart}<now()-interval '15 minutes' then 1 else ${loginAttempts.count}+1 end`,windowStart:sql`case when ${loginAttempts.windowStart}<now()-interval '15 minutes' then now() else ${loginAttempts.windowStart} end`}}).returning({count:loginAttempts.count});
if(attempt.count>8)return "Too many attempts. Try again later.";
const token=newToken(),expiry=new Date(Date.now()+2*60*60*1000),jar=await cookies(),old=jar.get(customerCookie)?.value;
const ok=await db.transaction(async tx=>{if(!await lockDemoWrite(tx,r.id))return false;let [c]=await tx.select().from(customers).where(and(eq(customers.restaurantId,r.id),eq(customers.email,d.email))).limit(1);
if(d.mode==="register"){if(c)return false;const [n]=await tx.select({n:sql<number>`count(*)::int`}).from(customers).where(eq(customers.restaurantId,r.id));if(n.n>=100)return false;[c]=await tx.insert(customers).values({restaurantId:r.id,email:d.email,name:d.name,passwordHash:await hashPassword(d.password)}).returning();}
else{const valid=await verifyPassword(d.password,c?.passwordHash??("scrypt:"+"0".repeat(32)+":"+"0".repeat(128)));if(!c||!valid)return false;}
if(old)await tx.delete(customerSessions).where(eq(customerSessions.tokenHash,tokenHash(old)));await tx.insert(customerSessions).values({restaurantId:r.id,customerId:c.id,tokenHash:tokenHash(token),expiresAt:expiry});await tx.delete(loginAttempts).where(eq(loginAttempts.key,key));return true});
if(!ok)return "Account could not be accessed or created. Check credentials.";
jar.set(customerCookie,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiry});
}catch{return "Demo account service unavailable."}redirect("/account")}
export async function customerLogout(){const jar=await cookies(),token=jar.get(customerCookie)?.value;if(token&&process.env.DATABASE_URL)await database().delete(customerSessions).where(eq(customerSessions.tokenHash,tokenHash(token)));jar.delete(customerCookie);redirect("/account")}
export async function saveAddress(_state:string,form:FormData){const c=await currentCustomer();if(!c)return "Sign in first.";try{const d=z.object({label:z.string().trim().min(2).max(40),address:z.string().trim().min(4).max(200)}).parse(Object.fromEntries(form));await database().transaction(async tx=>{if(!await lockDemoWrite(tx,c.restaurantId))throw new Error("Expired");const [count]=await tx.select({n:sql<number>`count(*)::int`}).from(customerAddresses).where(and(eq(customerAddresses.restaurantId,c.restaurantId),eq(customerAddresses.customerId,c.id)));if(count.n>=5)throw new Error("Limit");await tx.insert(customerAddresses).values({restaurantId:c.restaurantId,customerId:c.id,...d})});revalidatePath("/account");return "Fictional address saved."}catch{return "Unable to save address (maximum five)."}}
