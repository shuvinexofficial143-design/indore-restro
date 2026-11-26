import {and,eq,inArray,desc,isNull,gt} from "drizzle-orm";
import {z} from "zod";
import {database} from "@/lib/db";
import {restaurants,menuItems,orders,orderItems,orderStatusHistory,tableSessions,restaurantTables} from "@/lib/db/schema";
import {sampleCatalog,type CatalogItem} from "@/lib/catalog";
import {unitPrice} from "@/lib/domain/cart";
import {tokenHash} from "@/lib/domain/auth";
import {consumeOrder} from "@/lib/inventory";
import {canTransition,type OrderStatus} from "@/lib/domain/order";
export const tokenSchema=z.string().regex(/^[a-f0-9]{64}$/);
export const orderInput=z.object({token:tokenSchema,kind:z.enum(["dine_in","takeaway","delivery"]),instructions:z.string().trim().max(300).default(""),tableToken:tokenSchema.optional(),lines:z.array(z.object({id:z.string().min(1).max(80),variant:z.enum(["full","half"]),addon:z.boolean(),quantity:z.number().int().min(1).max(20)})).min(1).max(30)});
export class OrderError extends Error{constructor(message:string,public status=400){super(message)}}
export async function getCatalog():Promise<{items:CatalogItem[];enabled:boolean}>{
 if(!process.env.DATABASE_URL||process.env.ENABLE_DEMO_ORDERS!=="1")return {items:sampleCatalog,enabled:false};
 const db=database(),[r]=await db.select({id:restaurants.id}).from(restaurants).where(and(eq(restaurants.slug,"royal-table"),eq(restaurants.demo,true))).limit(1);
 if(!r)return {items:sampleCatalog,enabled:false};
 const items=await db.select({id:menuItems.id,name:menuItems.name,category:menuItems.category,description:menuItems.description,image:menuItems.image,veg:menuItems.veg,available:menuItems.available,pricePaise:menuItems.pricePaise,halfPaise:menuItems.halfPaise,addonPaise:menuItems.addonPaise,prepMinutes:menuItems.prepMinutes}).from(menuItems).where(eq(menuItems.restaurantId,r.id)).orderBy(menuItems.category,menuItems.name);
 return {items,enabled:items.length>0};
}
export async function createDemoOrder(raw:unknown){
 if(!process.env.DATABASE_URL||process.env.ENABLE_DEMO_ORDERS!=="1")throw new OrderError("Demo ordering is not enabled.",503);
 const parsed=orderInput.safeParse(raw);if(!parsed.success)throw new OrderError("Invalid order details");
 const {token,lines,kind,instructions,tableToken}=parsed.data;
 const key=tokenHash(token),requestHash=tokenHash(JSON.stringify({lines,kind,instructions,tableToken}));
 const db=database();
 return db.transaction(async tx=>{
  const [r]=await tx.select({id:restaurants.id}).from(restaurants).where(and(eq(restaurants.slug,"royal-table"),eq(restaurants.demo,true))).limit(1);
  if(!r)throw new OrderError("Demo restaurant unavailable",503);
  const [existing]=await tx.select({id:orders.id,requestHash:orders.requestHash,restaurantId:orders.restaurantId,totalPaise:orders.totalPaise}).from(orders).where(eq(orders.trackingHash,key));
  if(existing){if(existing.requestHash!==requestHash||existing.restaurantId!==r.id)throw new OrderError("Order key already used",409);return {id:existing.id,totalPaise:existing.totalPaise,reused:true};}
  let tableSessionId:string|null=null;
  if(tableToken){if(kind!=="dine_in")throw new OrderError("Table orders must be dine-in");const [session]=await tx.select({id:tableSessions.id}).from(tableSessions).innerJoin(restaurantTables,and(eq(restaurantTables.restaurantId,tableSessions.restaurantId),eq(restaurantTables.id,tableSessions.tableId),eq(restaurantTables.active,true))).where(and(eq(tableSessions.restaurantId,r.id),eq(tableSessions.tokenHash,tokenHash(tableToken)),isNull(tableSessions.closedAt),gt(tableSessions.expiresAt,new Date()))).for("update");if(!session)throw new OrderError("Table session expired",409);tableSessionId=session.id;}
  const items=await tx.select().from(menuItems).where(and(eq(menuItems.restaurantId,r.id),inArray(menuItems.id,lines.map(l=>l.id)))).for("share");
  const snapshots=lines.map(l=>{const d=items.find(i=>i.id===l.id);if(!d?.available)throw new OrderError("A dish is unavailable",409);let unitPaise:number;try{unitPaise=unitPrice(d,l.variant,l.addon)}catch{throw new OrderError("Invalid dish options")}return {restaurantId:r.id,menuId:d.id,name:d.name,variant:l.variant,addon:l.addon,quantity:l.quantity,unitPaise};});
  const totalPaise=snapshots.reduce((sum,l)=>sum+l.unitPaise*l.quantity,0);
  if(totalPaise>10000000)throw new OrderError("Order exceeds demo limit");
  const [order]=await tx.insert(orders).values({restaurantId:r.id,trackingHash:key,requestHash,kind,instructions,tableSessionId,subtotalPaise:totalPaise,totalPaise}).onConflictDoNothing({target:orders.trackingHash}).returning({id:orders.id,totalPaise:orders.totalPaise});
  if(!order){const [prior]=await tx.select().from(orders).where(eq(orders.trackingHash,key));if(!prior||prior.requestHash!==requestHash||prior.restaurantId!==r.id)throw new OrderError("Order key already used",409);return {id:prior.id,totalPaise:prior.totalPaise,reused:true};}
  await tx.insert(orderItems).values(snapshots.map(l=>({...l,orderId:order.id})));
  await tx.insert(orderStatusHistory).values({restaurantId:r.id,orderId:order.id,status:"pending"});
  return {...order,reused:false};
 });
}
export async function trackDemoOrder(token:string){
 if(!tokenSchema.safeParse(token).success||!process.env.DATABASE_URL||process.env.ENABLE_DEMO_ORDERS!=="1")return null;
 const db=database();
 const [order]=await db.select({id:orders.id,status:orders.status,kind:orders.kind,totalPaise:orders.totalPaise,createdAt:orders.createdAt,restaurantId:orders.restaurantId}).from(orders).innerJoin(restaurants,and(eq(restaurants.id,orders.restaurantId),eq(restaurants.demo,true),eq(restaurants.slug,"royal-table"))).where(eq(orders.trackingHash,tokenHash(token))).limit(1);
 if(!order)return null;
 const items=await db.select({name:orderItems.name,quantity:orderItems.quantity,variant:orderItems.variant,addon:orderItems.addon,unitPaise:orderItems.unitPaise}).from(orderItems).where(and(eq(orderItems.restaurantId,order.restaurantId),eq(orderItems.orderId,order.id)));
 const history=await db.select({status:orderStatusHistory.status,createdAt:orderStatusHistory.createdAt}).from(orderStatusHistory).where(and(eq(orderStatusHistory.restaurantId,order.restaurantId),eq(orderStatusHistory.orderId,order.id))).orderBy(desc(orderStatusHistory.createdAt));
 return {id:order.id,status:order.status,kind:order.kind,totalPaise:order.totalPaise,createdAt:order.createdAt,items,history};
}
export async function staffOrders(restaurantId:string,waiterId?:string){
 const db=database();
 const rows=await db.select({id:orders.id,kind:orders.kind,status:orders.status,totalPaise:orders.totalPaise,createdAt:orders.createdAt,instructions:orders.instructions,tableLabel:restaurantTables.label}).from(orders).leftJoin(tableSessions,and(eq(tableSessions.restaurantId,orders.restaurantId),eq(tableSessions.id,orders.tableSessionId))).leftJoin(restaurantTables,and(eq(restaurantTables.restaurantId,tableSessions.restaurantId),eq(restaurantTables.id,tableSessions.tableId))).where(and(eq(orders.restaurantId,restaurantId),waiterId?eq(tableSessions.waiterUserId,waiterId):undefined)).orderBy(desc(orders.createdAt)).limit(100);
 const items=rows.length?await db.select({id:orderItems.id,orderId:orderItems.orderId,name:orderItems.name,variant:orderItems.variant,addon:orderItems.addon,quantity:orderItems.quantity}).from(orderItems).where(and(eq(orderItems.restaurantId,restaurantId),inArray(orderItems.orderId,rows.map(o=>o.id)))):[];
 return rows.map(o=>({...o,items:items.filter(l=>l.orderId===o.id)}));
}
export async function transitionOrder(restaurantId:string,userId:string,id:string,to:OrderStatus,waiterId?:string){
 return database().transaction(async tx=>{
  const [o]=await tx.select().from(orders).where(and(eq(orders.restaurantId,restaurantId),eq(orders.id,id))).for("update");
  if(!o||!canTransition(o.status,to,o.kind))throw new OrderError("Invalid order transition",409);
  if(waiterId){if(!o.tableSessionId)throw new OrderError("Forbidden",403);const [assigned]=await tx.select({id:tableSessions.id}).from(tableSessions).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.id,o.tableSessionId),eq(tableSessions.waiterUserId,waiterId),isNull(tableSessions.closedAt)));if(!assigned)throw new OrderError("Forbidden",403);}

  if(to==="completed")await consumeOrder(tx,restaurantId,id,userId);
  await tx.update(orders).set({status:to,updatedAt:new Date()}).where(and(eq(orders.restaurantId,restaurantId),eq(orders.id,id)));
  await tx.insert(orderStatusHistory).values({restaurantId,orderId:id,status:to,actorUserId:userId});
 });
}
