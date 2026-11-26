"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { database } from "@/lib/db";
import { users, staff, sessions, loginAttempts } from "@/lib/db/schema";
import { newToken, tokenHash, verifyPassword } from "@/lib/domain/auth";
import { sessionCookie } from "@/lib/session";
const input=z.object({email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(1).max(128)});
const dummy="scrypt:"+"0".repeat(32)+":"+"0".repeat(128);
export async function login(_previous:string,form:FormData):Promise<string>{
 const parsed=input.safeParse({email:form.get("email"),password:form.get("password")});
 if(!parsed.success)return "Invalid email or password.";
 if(!process.env.DATABASE_URL)return "Database setup is pending. Sign-in is unavailable.";
 let destination="/staff";
 try{
  const db=database(),{email,password}=parsed.data,now=new Date(),key=tokenHash(email);
  const [attempt]=await db.insert(loginAttempts).values({key,count:1,windowStart:now}).onConflictDoUpdate({target:loginAttempts.key,set:{count:sql`case when ${loginAttempts.windowStart} < now() - interval '15 minutes' then 1 else ${loginAttempts.count}+1 end`,windowStart:sql`case when ${loginAttempts.windowStart} < now() - interval '15 minutes' then now() else ${loginAttempts.windowStart} end`}}).returning({count:loginAttempts.count});
  if(attempt.count>8)return "Too many sign-in attempts. Try again in 15 minutes.";
  const [row]=await db.select({id:users.id,hash:users.passwordHash,restaurantId:staff.restaurantId,role:staff.role}).from(users).innerJoin(staff,eq(users.id,staff.userId)).where(and(eq(users.email,email),eq(users.active,true),eq(staff.active,true))).limit(1);
  const valid=await verifyPassword(password,row?.hash??dummy);
  if(!row||!valid)return "Invalid email or password.";
  const token=newToken(),expiresAt=new Date(now.getTime()+8*60*60*1000),jar=await cookies(),old=jar.get(sessionCookie)?.value;
  await db.transaction(async tx=>{if(old)await tx.delete(sessions).where(eq(sessions.tokenHash,tokenHash(old)));await tx.insert(sessions).values({tokenHash:tokenHash(token),userId:row.id,restaurantId:row.restaurantId,expiresAt});await tx.delete(loginAttempts).where(eq(loginAttempts.key,key));});
  jar.set(sessionCookie,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiresAt});
  destination=row.role==="owner"||row.role==="manager"?"/admin":"/staff";
 }catch(error){const cause=error instanceof Error ? error.cause : undefined; const code=cause && typeof cause==="object" && "code" in cause ? String(cause.code) : "unknown"; console.error("Staff login failed",{code});return "Sign-in is temporarily unavailable."}
 redirect(destination);
}
export async function logout(){
 const jar=await cookies(),token=jar.get(sessionCookie)?.value;
 if(token&&process.env.DATABASE_URL)await database().delete(sessions).where(eq(sessions.tokenHash,tokenHash(token)));
 jar.delete(sessionCookie);redirect("/login");
}
