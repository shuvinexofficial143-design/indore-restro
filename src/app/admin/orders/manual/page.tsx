import {requireArea} from "@/lib/session";
import {database} from "@/lib/db";
import {menuItems,tableSessions,restaurantTables} from "@/lib/db/schema";
import {and,eq,isNull,gt} from "drizzle-orm";
import ManualOrder from "@/components/manual-order";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function Page(){const s=await requireArea("admin"),db=database();const items=await db.select().from(menuItems).where(and(eq(menuItems.restaurantId,s.restaurantId),eq(menuItems.available,true))).orderBy(menuItems.name);const sessions=await db.select({id:tableSessions.id,label:restaurantTables.label}).from(tableSessions).innerJoin(restaurantTables,and(eq(restaurantTables.restaurantId,tableSessions.restaurantId),eq(restaurantTables.id,tableSessions.tableId))).where(and(eq(tableSessions.restaurantId,s.restaurantId),isNull(tableSessions.closedAt),gt(tableSessions.expiresAt,new Date()),eq(restaurantTables.active,true)));return <main id="main" className="shell section inner"><Link className="text-link" href="/admin/orders">← Live orders</Link><p className="eyebrow">AUTHORIZED STAFF · SAMPLE ORDER</p><h1>Manual <em>order.</em></h1><p className="intro">Record a fictional counter order without sharing a guest QR. Backend prices, stock and status rules are unchanged.</p><ManualOrder items={items} sessions={sessions}/></main>}
