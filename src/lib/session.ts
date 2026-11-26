import {cookies} from "next/headers";
import {and,eq,gt} from "drizzle-orm";
import {database} from "@/lib/db";
import {sessions,staff,users,restaurants} from "@/lib/db/schema";
import {tokenHash,canAccess,type Role} from "@/lib/domain/auth";
import {activeDemo,demoRoles,demoRoleCookie,type DemoRole} from "@/lib/demo-context";
import {redirect} from "next/navigation";
export const sessionCookie="royal_session";
export async function currentSession(){
 const jar=await cookies(),token=jar.get(sessionCookie)?.value;
 if(!process.env.DATABASE_URL)return null;
 if(token){if(!/^[a-f0-9]{64}$/.test(token))return null;const [row]=await database().select({userId:users.id,name:users.name,role:staff.role,restaurantId:restaurants.id,restaurantName:restaurants.name}).from(sessions).innerJoin(staff,and(eq(sessions.userId,staff.userId),eq(sessions.restaurantId,staff.restaurantId))).innerJoin(users,eq(staff.userId,users.id)).innerJoin(restaurants,eq(staff.restaurantId,restaurants.id)).where(and(eq(sessions.tokenHash,tokenHash(token)),gt(sessions.expiresAt,new Date()),eq(staff.active,true),eq(users.active,true),eq(users.loginDisabled,false))).limit(1);return row?{...row,isolatedDemo:false}:null;}
 const demo=await activeDemo();if(!demo)return null;const role=jar.get(demoRoleCookie)?.value??"owner";if(!demoRoles.includes(role as DemoRole))return null;
 const [row]=await database().select({userId:users.id,name:users.name,role:staff.role,restaurantId:restaurants.id,restaurantName:restaurants.name}).from(staff).innerJoin(users,eq(staff.userId,users.id)).innerJoin(restaurants,eq(staff.restaurantId,restaurants.id)).where(and(eq(staff.restaurantId,demo.restaurantId),eq(staff.role,role as DemoRole),eq(staff.active,true),eq(users.active,true),eq(users.loginDisabled,true))).limit(1);return row?{...row,isolatedDemo:true}:null;
}
export async function requireArea(area:"admin"|"kitchen"|"waiter"|"billing"){const s=await currentSession();if(!s)redirect("/login");if(!canAccess(s.role as Role,area))redirect("/staff");return s}
