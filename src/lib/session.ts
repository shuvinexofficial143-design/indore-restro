import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { database } from "@/lib/db";
import { sessions, staff, users, restaurants } from "@/lib/db/schema";
import { tokenHash, canAccess, type Role } from "@/lib/domain/auth";
import { redirect } from "next/navigation";
export const sessionCookie="royal_session";
export async function currentSession(){
 const token=(await cookies()).get(sessionCookie)?.value;
 if(!token || !/^[a-f0-9]{64}$/.test(token) || !process.env.DATABASE_URL)return null;
 const [row]=await database().select({userId:users.id,name:users.name,role:staff.role,restaurantId:restaurants.id,restaurantName:restaurants.name}).from(sessions).innerJoin(staff,and(eq(sessions.userId,staff.userId),eq(sessions.restaurantId,staff.restaurantId))).innerJoin(users,eq(staff.userId,users.id)).innerJoin(restaurants,eq(staff.restaurantId,restaurants.id)).where(and(eq(sessions.tokenHash,tokenHash(token)),gt(sessions.expiresAt,new Date()),eq(staff.active,true),eq(users.active,true))).limit(1);
 return row??null;
}
export async function requireArea(area:"admin"|"kitchen"|"waiter"|"billing"){
 const session=await currentSession();
 if(!session)redirect("/login");
 if(!canAccess(session.role as Role,area))redirect("/staff");
 return session;
}
