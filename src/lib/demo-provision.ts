import {and,eq,gt,isNull,sql} from "drizzle-orm";
import {timingSafeEqual} from "node:crypto";
import {database} from "@/lib/db";
import {demoSessions,restaurants,users,staff,restaurantTables,menuItems,loginAttempts} from "@/lib/db/schema";
import {hashPassword,newToken,tokenHash} from "@/lib/domain/auth";
import {demoEnabled,demoRoles} from "@/lib/demo-context";
import {sampleCatalog} from "@/lib/catalog";
export async function provisionDemo(code:string){
 if(!demoEnabled())throw new Error("Isolated demo is disabled.");
 const db=database(),key=tokenHash("isolated-demo-global-attempts");
 const [attempt]=await db.insert(loginAttempts).values({key,count:1,windowStart:new Date()}).onConflictDoUpdate({target:loginAttempts.key,set:{count:sql`case when ${loginAttempts.windowStart}<now()-interval '15 minutes' then 1 else ${loginAttempts.count}+1 end`,windowStart:sql`case when ${loginAttempts.windowStart}<now()-interval '15 minutes' then now() else ${loginAttempts.windowStart} end`}}).returning({count:loginAttempts.count});
 if(attempt.count>40)throw new Error("Demo capacity limit reached. Try again later.");
 if(code.length>128||!timingSafeEqual(Buffer.from(tokenHash(code),"hex"),Buffer.from(tokenHash(process.env.DEMO_ACCESS_CODE!),"hex")))throw new Error("Invalid invitation code.");
 const token=newToken(),slug="demo-"+newToken().slice(0,24),expiresAt=new Date(Date.now()+2*60*60*1000),hash=await hashPassword(newToken());
 await db.transaction(async tx=>{
  await tx.execute(sql`select pg_advisory_xact_lock(721035)`);
  const [active]=await tx.select({n:sql<number>`count(*)::int`}).from(demoSessions).where(and(isNull(demoSessions.revokedAt),gt(demoSessions.expiresAt,new Date())));
  const [all]=await tx.select({n:sql<number>`count(*)::int`}).from(demoSessions);
  if(active.n>=20||all.n>=200)throw new Error("Demo capacity limit reached.");
  const [r]=await tx.insert(restaurants).values({slug,name:"The Royal Table",demo:true}).returning({id:restaurants.id});
  const people=await tx.insert(users).values(demoRoles.map(role=>({name:"Demo "+role,email:slug+"-"+role+"@example.invalid",passwordHash:hash,loginDisabled:true}))).returning({id:users.id,email:users.email});
  await tx.insert(staff).values(demoRoles.map(role=>({restaurantId:r.id,userId:people.find(x=>x.email===slug+"-"+role+"@example.invalid")!.id,role})));
  await tx.insert(menuItems).values(sampleCatalog.map(d=>({...d,restaurantId:r.id})));
  await tx.insert(restaurantTables).values([2,4,6].map((capacity,i)=>({restaurantId:r.id,label:"Demo Table 0"+(i+1),capacity})));
  await tx.insert(demoSessions).values({restaurantId:r.id,tokenHash:tokenHash(token),expiresAt});
 });
 return {token,expiresAt};
}
