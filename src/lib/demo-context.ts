import {cookies} from "next/headers";
import {and,eq,isNull,gt} from "drizzle-orm";
import {database} from "@/lib/db";
import {demoSessions,restaurants,tableSessions,restaurantTables} from "@/lib/db/schema";
import {tokenHash} from "@/lib/domain/auth";
export const demoCookie="royal_demo",demoRoleCookie="royal_demo_role";
export const demoRoles=["owner","kitchen","waiter","cashier"] as const;
export type DemoRole=typeof demoRoles[number];
export function demoEnabled(){return Boolean(process.env.DATABASE_URL&&process.env.ENABLE_ISOLATED_DEMO==="1"&&process.env.DEMO_ACCESS_CODE&&process.env.DEMO_ACCESS_CODE.length>=12)}
export async function activeDemo(){
 if(!demoEnabled())return null;const jar=await cookies();if(jar.get("royal_session"))return null;const token=jar.get(demoCookie)?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const [s]=await database().select({restaurantId:demoSessions.restaurantId,expiresAt:demoSessions.expiresAt}).from(demoSessions).innerJoin(restaurants,and(eq(restaurants.id,demoSessions.restaurantId),eq(restaurants.demo,true))).where(and(eq(demoSessions.tokenHash,tokenHash(token)),isNull(demoSessions.revokedAt),gt(demoSessions.expiresAt,new Date()))).limit(1);
 return s??null;
}
export async function allowedRestaurant(id:string){
 if(!process.env.DATABASE_URL)return false;
 const db=database(),[r]=await db.select({slug:restaurants.slug,demo:restaurants.demo}).from(restaurants).where(eq(restaurants.id,id)).limit(1);
 if(!r?.demo)return false;
 if(r.slug==="royal-table")return process.env.ENABLE_DEMO_ORDERS==="1";
 if(!demoEnabled())return false;
 const [s]=await db.select({id:demoSessions.restaurantId}).from(demoSessions).where(and(eq(demoSessions.restaurantId,id),isNull(demoSessions.revokedAt),gt(demoSessions.expiresAt,new Date()))).limit(1);
 return Boolean(s);
}
export async function orderingRestaurant(){
 if(!process.env.DATABASE_URL)return null;
 const isolated=await activeDemo();if(isolated)return {id:isolated.restaurantId};
 if(process.env.ENABLE_DEMO_ORDERS!=="1")return null;
 const [r]=await database().select({id:restaurants.id}).from(restaurants).where(and(eq(restaurants.slug,"royal-table"),eq(restaurants.demo,true))).limit(1);return r??null;
}
export async function tableContext(token:string){
 if(!process.env.DATABASE_URL||!/^[a-f0-9]{64}$/.test(token))return null;
 const [t]=await database().select({restaurantId:tableSessions.restaurantId,id:tableSessions.id,label:restaurantTables.label,expiresAt:tableSessions.expiresAt}).from(tableSessions).innerJoin(restaurantTables,and(eq(restaurantTables.restaurantId,tableSessions.restaurantId),eq(restaurantTables.id,tableSessions.tableId),eq(restaurantTables.active,true))).where(and(eq(tableSessions.tokenHash,tokenHash(token)),isNull(tableSessions.closedAt),gt(tableSessions.expiresAt,new Date()))).limit(1);
 if(!t||!await allowedRestaurant(t.restaurantId))return null;return t;
}
export async function revokeCurrentDemo(){const jar=await cookies(),token=jar.get(demoCookie)?.value;if(token&&/^[a-f0-9]{64}$/.test(token)&&process.env.DATABASE_URL){await database().update(demoSessions).set({revokedAt:new Date()}).where(and(eq(demoSessions.tokenHash,tokenHash(token)),isNull(demoSessions.revokedAt)));}jar.delete(demoCookie);jar.delete(demoRoleCookie)}
