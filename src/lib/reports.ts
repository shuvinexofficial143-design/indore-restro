import {and,eq,gte,lt,sql,desc} from "drizzle-orm";
import {database} from "@/lib/db";
import {orders,payments,orderItems} from "@/lib/db/schema";
export type Period="today"|"week"|"month";
export function reportRange(period:Period,now=new Date()){const local=new Date(now.getTime()+19800000);local.setUTCHours(0,0,0,0);const end=new Date(local.getTime()-19800000+86400000);if(period==="week")local.setUTCDate(local.getUTCDate()-6);if(period==="month")local.setUTCDate(1);return {start:new Date(local.getTime()-19800000),end}}
export async function report(restaurantId:string,period:Period){const db=database(),{start,end}=reportRange(period);
 const scope=and(eq(orders.restaurantId,restaurantId),gte(orders.createdAt,start),lt(orders.createdAt,end));
 const statuses=await db.select({status:orders.status,count:sql<number>`count(*)::int`,total:sql<string>`coalesce(sum(${orders.totalPaise}),0)::text`}).from(orders).where(scope).groupBy(orders.status);
 const paid=await db.select({method:payments.method,count:sql<number>`count(*)::int`,total:sql<string>`coalesce(sum(${payments.amountPaise}),0)::text`}).from(payments).where(and(eq(payments.restaurantId,restaurantId),gte(payments.createdAt,start),lt(payments.createdAt,end))).groupBy(payments.method);
 const best=await db.select({name:orderItems.name,quantity:sql<number>`sum(${orderItems.quantity})::int`,total:sql<string>`sum(${orderItems.quantity}::bigint*${orderItems.unitPaise})::text`}).from(orderItems).innerJoin(orders,and(eq(orders.restaurantId,orderItems.restaurantId),eq(orders.id,orderItems.orderId))).where(and(scope,eq(orders.status,"completed"))).groupBy(orderItems.name).orderBy(desc(sql`sum(${orderItems.quantity})`)).limit(10);
 return {statuses,paid,best,start,end};
}
