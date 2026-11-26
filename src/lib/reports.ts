import {and,eq,gte,lt,sql,desc} from "drizzle-orm";
import {database} from "@/lib/db";
import {orders,payments,orderItems,tableSessions,restaurantTables,reservations,inventoryTransactions,inventoryItems} from "@/lib/db/schema";
import {reportRange,type Period} from "@/lib/domain/report-range";
export type {Period} from "@/lib/domain/report-range";
export {reportRange} from "@/lib/domain/report-range";
export async function report(restaurantId:string,period:Period,custom?:{from?:string;to?:string}){const db=database(),{start,end}=reportRange(period,new Date(),custom);
 const scope=and(eq(orders.restaurantId,restaurantId),gte(orders.createdAt,start),lt(orders.createdAt,end));
 const statuses=await db.select({status:orders.status,count:sql<number>`count(*)::int`,total:sql<string>`coalesce(sum(${orders.totalPaise}),0)::text`}).from(orders).where(scope).groupBy(orders.status);
 const paid=await db.select({method:payments.method,count:sql<number>`count(*)::int`,total:sql<string>`coalesce(sum(${payments.amountPaise}),0)::text`}).from(payments).where(and(eq(payments.restaurantId,restaurantId),gte(payments.createdAt,start),lt(payments.createdAt,end))).groupBy(payments.method);
 const best=await db.select({name:orderItems.name,quantity:sql<number>`sum(${orderItems.quantity})::int`,total:sql<string>`sum(${orderItems.quantity}::bigint*${orderItems.unitPaise})::text`}).from(orderItems).innerJoin(orders,and(eq(orders.restaurantId,orderItems.restaurantId),eq(orders.id,orderItems.orderId))).where(and(scope,eq(orders.status,"completed"))).groupBy(orderItems.name).orderBy(desc(sql`sum(${orderItems.quantity})`)).limit(10);

 const kinds=await db.select({kind:orders.kind,count:sql<number>`count(*)::int`,total:sql<string>`coalesce(sum(${orders.totalPaise}),0)::text`}).from(orders).where(scope).groupBy(orders.kind);
 const tables=await db.select({label:restaurantTables.label,count:sql<number>`count(*)::int`,total:sql<string>`coalesce(sum(${orders.totalPaise}),0)::text`}).from(orders).innerJoin(tableSessions,and(eq(tableSessions.restaurantId,orders.restaurantId),eq(tableSessions.id,orders.tableSessionId))).innerJoin(restaurantTables,and(eq(restaurantTables.restaurantId,tableSessions.restaurantId),eq(restaurantTables.id,tableSessions.tableId))).where(and(scope,eq(orders.status,"completed"))).groupBy(restaurantTables.label);
 const bookings=await db.select({status:reservations.status,count:sql<number>`count(*)::int`}).from(reservations).where(and(eq(reservations.restaurantId,restaurantId),gte(reservations.startsAt,start),lt(reservations.startsAt,end))).groupBy(reservations.status);
 const stock=await db.select({name:inventoryItems.name,unit:inventoryItems.unit,kind:inventoryTransactions.kind,quantity:sql<string>`coalesce(sum(${inventoryTransactions.delta}),0)::text`,purchaseCost:sql<string>`coalesce(sum(${inventoryTransactions.purchaseCostPaise}),0)::text`}).from(inventoryTransactions).innerJoin(inventoryItems,and(eq(inventoryItems.restaurantId,inventoryTransactions.restaurantId),eq(inventoryItems.id,inventoryTransactions.inventoryId))).where(and(eq(inventoryTransactions.restaurantId,restaurantId),gte(inventoryTransactions.createdAt,start),lt(inventoryTransactions.createdAt,end))).groupBy(inventoryItems.name,inventoryItems.unit,inventoryTransactions.kind);
 return {statuses,paid,best,kinds,tables,bookings,stock,start,end};
}
