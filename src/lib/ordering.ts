import {and,eq,inArray,desc,isNull,gt,sql} from "drizzle-orm";
import {z} from "zod";
import {database} from "@/lib/db";
import {restaurants,menuItems,orders,orderItems,orderStatusHistory,tableSessions,restaurantTables,restaurantSettings,coupons,couponUsages,customerAddresses} from "@/lib/db/schema";
import {sampleCatalog,type CatalogItem} from "@/lib/catalog";
import {currentCustomer} from "@/lib/customer-session";
import {priceOrder} from "@/lib/domain/pricing";
import {unitPrice} from "@/lib/domain/cart";
import {tokenHash} from "@/lib/domain/auth";
import {orderingRestaurant,allowedRestaurant,tableContext,lockDemoWrite} from "@/lib/demo-context";
import {consumeOrder} from "@/lib/inventory";
import {canTransition,type OrderStatus} from "@/lib/domain/order";
export const tokenSchema=z.string().regex(/^[a-f0-9]{64}$/);
export const orderInput=z.object({token:tokenSchema,kind:z.enum(["dine_in","takeaway","delivery"]),instructions:z.string().trim().max(300).default(""),tableToken:tokenSchema.optional(),couponCode:z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{0,32}$/).default(""),addressId:z.string().uuid().optional(),lines:z.array(z.object({id:z.string().min(1).max(80),variant:z.enum(["full","half"]),addon:z.boolean(),quantity:z.number().int().min(1).max(20)})).min(1).max(30)});
export class OrderError extends Error{constructor(message:string,public status=400){super(message)}}
export async function getCatalog(verifiedTableRestaurantId?:string):Promise<{items:CatalogItem[];enabled:boolean}>{
 const r=verifiedTableRestaurantId?(await allowedRestaurant(verifiedTableRestaurantId)?{id:verifiedTableRestaurantId}:null):await orderingRestaurant();
 if(!r)return {items:sampleCatalog,enabled:false};const db=database();
 const items=await db.select({id:menuItems.id,name:menuItems.name,category:menuItems.category,description:menuItems.description,image:menuItems.image,veg:menuItems.veg,available:menuItems.available,pricePaise:menuItems.pricePaise,halfPaise:menuItems.halfPaise,addonPaise:menuItems.addonPaise,prepMinutes:menuItems.prepMinutes}).from(menuItems).where(eq(menuItems.restaurantId,r.id)).orderBy(menuItems.category,menuItems.name);
 return {items,enabled:items.length>0};
}
export async function createDemoOrder(raw:unknown){
 if(!process.env.DATABASE_URL)throw new OrderError("Demo ordering is not enabled.",503);
 const parsed=orderInput.safeParse(raw);if(!parsed.success)throw new OrderError("Invalid order details");
 const {token,lines,kind,instructions,tableToken,couponCode,addressId}=parsed.data;
 const key=tokenHash(token),requestHash=tokenHash(JSON.stringify({lines,kind,instructions,tableToken,couponCode,addressId}));
 const table=tableToken?await tableContext(tableToken):null;
 if(tableToken&&!table)throw new OrderError("Table session expired",409);
 const r=table?{id:table.restaurantId}:await orderingRestaurant();if(!r)throw new OrderError("Demo restaurant unavailable",503);
 const customer=await currentCustomer(r.id);
 const db=database();
 return db.transaction(async tx=>{
  const mode=await lockDemoWrite(tx,r.id);if(!mode)throw new OrderError("Demo session expired",409);
  const [existing]=await tx.select({id:orders.id,requestHash:orders.requestHash,restaurantId:orders.restaurantId,totalPaise:orders.totalPaise}).from(orders).where(eq(orders.trackingHash,key));
  if(existing){if(existing.requestHash!==requestHash||existing.restaurantId!==r.id)throw new OrderError("Order key already used",409);return {id:existing.id,totalPaise:existing.totalPaise,reused:true};}
  if(mode==="isolated"){const [count]=await tx.select({n:sql<number>`count(*)::int`}).from(orders).where(eq(orders.restaurantId,r.id));if(count.n>=100)throw new OrderError("Demo order limit reached",429);}
  let tableSessionId:string|null=null;
  if(tableToken){if(kind!=="dine_in")throw new OrderError("Table orders must be dine-in");const [session]=await tx.select({id:tableSessions.id}).from(tableSessions).innerJoin(restaurantTables,and(eq(restaurantTables.restaurantId,tableSessions.restaurantId),eq(restaurantTables.id,tableSessions.tableId),eq(restaurantTables.active,true))).where(and(eq(tableSessions.restaurantId,r.id),eq(tableSessions.tokenHash,tokenHash(tableToken)),isNull(tableSessions.closedAt),gt(tableSessions.expiresAt,new Date()))).for("update");if(!session)throw new OrderError("Table session expired",409);tableSessionId=session.id;}
  let deliveryAddress:string|null=null;
  if(addressId){if(kind!=="delivery"||!customer)throw new OrderError("Sign in to use a saved sample address",400);const [address]=await tx.select({address:customerAddresses.address}).from(customerAddresses).where(and(eq(customerAddresses.restaurantId,r.id),eq(customerAddresses.customerId,customer.id),eq(customerAddresses.id,addressId)));if(!address)throw new OrderError("Sample address unavailable",400);deliveryAddress=address.address;}
  const items=await tx.select().from(menuItems).where(and(eq(menuItems.restaurantId,r.id),inArray(menuItems.id,lines.map(l=>l.id)))).for("share");
  const snapshots=lines.map(l=>{const d=items.find(i=>i.id===l.id);if(!d?.available)throw new OrderError("A dish is unavailable",409);let unitPaise:number;try{unitPaise=unitPrice(d,l.variant,l.addon)}catch{throw new OrderError("Invalid dish options")}return {restaurantId:r.id,menuId:d.id,name:d.name,variant:l.variant,addon:l.addon,quantity:l.quantity,unitPaise};});
  const subtotalPaise=snapshots.reduce((sum,l)=>sum+l.unitPaise*l.quantity,0);
  if(subtotalPaise>10000000)throw new OrderError("Order exceeds demo limit");
  const [settings]=await tx.select({tax:restaurantSettings.demoTaxBps}).from(restaurantSettings).where(eq(restaurantSettings.restaurantId,r.id)).limit(1);
  let eligiblePaise=0,bps=0,cap:number|null=null;
  if(couponCode){const [coupon]=await tx.select().from(coupons).where(and(eq(coupons.restaurantId,r.id),eq(coupons.code,couponCode),eq(coupons.active,true),gt(coupons.expiresAt,new Date()))).for("update");
   if(!coupon||subtotalPaise<coupon.minimumPaise)throw new OrderError("Coupon unavailable or minimum subtotal not reached",409);
   const [usage]=await tx.select({n:sql<number>`count(*)::int`}).from(couponUsages).where(and(eq(couponUsages.restaurantId,r.id),eq(couponUsages.code,couponCode)));
   if(usage.n>=coupon.maximumUses)throw new OrderError("Coupon usage limit reached",409);
   eligiblePaise=snapshots.filter(l=>!coupon.eligibleMenuId||l.menuId===coupon.eligibleMenuId).reduce((n,l)=>n+l.unitPaise*l.quantity,0);
   if(!eligiblePaise)throw new OrderError("Coupon does not apply to these dishes",409);bps=coupon.percentBps;cap=coupon.maximumDiscountPaise;
  }
  const pricing=priceOrder(subtotalPaise,eligiblePaise,bps,cap,settings?.tax??0);
  if(couponCode&&!pricing.discountPaise)throw new OrderError("Coupon discount is zero",409);
  const [order]=await tx.insert(orders).values({restaurantId:r.id,trackingHash:key,requestHash,kind,instructions,tableSessionId,...pricing,couponCode:couponCode||null,customerId:customer?.id??null,deliveryAddress}).onConflictDoNothing({target:orders.trackingHash}).returning({id:orders.id,totalPaise:orders.totalPaise});
  if(!order){const [prior]=await tx.select().from(orders).where(eq(orders.trackingHash,key));if(!prior||prior.requestHash!==requestHash||prior.restaurantId!==r.id)throw new OrderError("Order key already used",409);return {id:prior.id,totalPaise:prior.totalPaise,reused:true};}
  if(couponCode)await tx.insert(couponUsages).values({restaurantId:r.id,orderId:order.id,code:couponCode,discountPaise:pricing.discountPaise});
  await tx.insert(orderItems).values(snapshots.map(l=>({...l,orderId:order.id})));
  await tx.insert(orderStatusHistory).values({restaurantId:r.id,orderId:order.id,status:"pending"});
  return {...order,reused:false};
 });
}
export async function trackDemoOrder(token:string){
 if(!tokenSchema.safeParse(token).success||!process.env.DATABASE_URL)return null;
 const db=database();
 const [order]=await db.select({id:orders.id,status:orders.status,kind:orders.kind,totalPaise:orders.totalPaise,subtotalPaise:orders.subtotalPaise,discountPaise:orders.discountPaise,taxPaise:orders.taxPaise,couponCode:orders.couponCode,createdAt:orders.createdAt,restaurantId:orders.restaurantId}).from(orders).innerJoin(restaurants,and(eq(restaurants.id,orders.restaurantId),eq(restaurants.demo,true))).where(eq(orders.trackingHash,tokenHash(token))).limit(1);
 if(!order||!await allowedRestaurant(order.restaurantId))return null;
 const items=await db.select({name:orderItems.name,quantity:orderItems.quantity,variant:orderItems.variant,addon:orderItems.addon,unitPaise:orderItems.unitPaise}).from(orderItems).where(and(eq(orderItems.restaurantId,order.restaurantId),eq(orderItems.orderId,order.id)));
 const history=await db.select({status:orderStatusHistory.status,createdAt:orderStatusHistory.createdAt}).from(orderStatusHistory).where(and(eq(orderStatusHistory.restaurantId,order.restaurantId),eq(orderStatusHistory.orderId,order.id))).orderBy(desc(orderStatusHistory.createdAt));
 return {id:order.id,status:order.status,kind:order.kind,totalPaise:order.totalPaise,subtotalPaise:order.subtotalPaise,discountPaise:order.discountPaise,taxPaise:order.taxPaise,couponCode:order.couponCode,createdAt:order.createdAt,items,history};
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
