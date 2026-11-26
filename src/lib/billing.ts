import {and,eq,desc,inArray,isNull} from "drizzle-orm";
import {database} from "@/lib/db";
import {invoices,invoiceOrders,payments,orders,orderItems,tableSessions,restaurants,sandboxGatewayOrders} from "@/lib/db/schema";
import {OrderError} from "@/lib/ordering";
export async function generateInvoice(restaurantId:string,orderId:string){
 const db=database();
 return db.transaction(async tx=>{
  const [restaurant]=await tx.select({demo:restaurants.demo}).from(restaurants).where(eq(restaurants.id,restaurantId));if(!restaurant?.demo)throw new OrderError("Demo billing only");
  const [initial]=await tx.select().from(orders).where(and(eq(orders.restaurantId,restaurantId),eq(orders.id,orderId)));
  if(!initial)throw new OrderError("Order not found");
  if(initial.tableSessionId){const [s]=await tx.select().from(tableSessions).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.id,initial.tableSessionId))).for("update");if(!s)throw new OrderError("Invalid table session");if(!s.closedAt)throw new OrderError("Close the table after all orders are completed before billing.");}
  const rows=await tx.select().from(orders).where(and(eq(orders.restaurantId,restaurantId),initial.tableSessionId?eq(orders.tableSessionId,initial.tableSessionId):eq(orders.id,orderId))).for("update");
  const [prior]=await tx.select({id:invoiceOrders.invoiceId}).from(invoiceOrders).where(and(eq(invoiceOrders.restaurantId,restaurantId),eq(invoiceOrders.orderId,orderId)));if(prior)return prior.id;
  if(rows.some(r=>r.status!=="completed"&&r.status!=="cancelled"))throw new OrderError("Complete all orders before invoicing");
  const included=rows.filter(r=>r.status==="completed");if(!included.some(r=>r.id===orderId))throw new OrderError("Only completed orders can be invoiced");
  const subtotalPaise=included.reduce((n,o)=>n+o.subtotalPaise,0),discountPaise=included.reduce((n,o)=>n+o.discountPaise,0),taxPaise=included.reduce((n,o)=>n+o.taxPaise,0),totalPaise=included.reduce((n,o)=>n+o.totalPaise,0);if(Math.max(subtotalPaise,discountPaise,taxPaise,totalPaise)>2147483647)throw new OrderError("Invoice total too large");
  const [invoice]=await tx.insert(invoices).values({restaurantId,tableSessionId:initial.tableSessionId,subtotalPaise,discountPaise,taxPaise,totalPaise}).returning({id:invoices.id});
  await tx.insert(invoiceOrders).values(included.map(o=>({restaurantId,invoiceId:invoice.id,orderId:o.id})));
  return invoice.id;
 });
}
export async function recordDemoPayment(restaurantId:string,invoiceId:string,userId:string,method:"cash"|"upi"|"card"){
 await database().transaction(async tx=>{
  const [r]=await tx.select({demo:restaurants.demo}).from(restaurants).where(eq(restaurants.id,restaurantId));if(!r?.demo)throw new OrderError("Demo billing only");
  const [i]=await tx.select().from(invoices).where(and(eq(invoices.restaurantId,restaurantId),eq(invoices.id,invoiceId))).for("update");if(!i)throw new OrderError("Invoice not found");
  const [gateway]=await tx.select({id:sandboxGatewayOrders.invoiceId}).from(sandboxGatewayOrders).where(and(eq(sandboxGatewayOrders.restaurantId,restaurantId),eq(sandboxGatewayOrders.invoiceId,invoiceId)));if(gateway)throw new OrderError("Sandbox checkout already started for this invoice");
  await tx.insert(payments).values({restaurantId,invoiceId,method,amountPaise:i.totalPaise,recordedBy:userId}).onConflictDoNothing({target:[payments.restaurantId,payments.invoiceId]});
 });
}
export async function listBilling(restaurantId:string){
 const db=database();const rows=await db.select({id:invoices.id,totalPaise:invoices.totalPaise,createdAt:invoices.createdAt,method:payments.method,gatewayId:sandboxGatewayOrders.merchantOrderId,gatewayVerifiedAt:sandboxGatewayOrders.verifiedAt}).from(invoices).leftJoin(payments,and(eq(payments.restaurantId,invoices.restaurantId),eq(payments.invoiceId,invoices.id))).leftJoin(sandboxGatewayOrders,and(eq(sandboxGatewayOrders.restaurantId,invoices.restaurantId),eq(sandboxGatewayOrders.invoiceId,invoices.id))).where(eq(invoices.restaurantId,restaurantId)).orderBy(desc(invoices.createdAt)).limit(100);
 const pending=await db.select({id:orders.id,kind:orders.kind,totalPaise:orders.totalPaise,tableSessionId:orders.tableSessionId}).from(orders).leftJoin(invoiceOrders,and(eq(invoiceOrders.restaurantId,orders.restaurantId),eq(invoiceOrders.orderId,orders.id))).where(and(eq(orders.restaurantId,restaurantId),eq(orders.status,"completed"),isNull(invoiceOrders.invoiceId))).limit(100);
 return {rows,pending};
}
export async function invoiceDetails(restaurantId:string,id:string){
 const db=database();const [invoice]=await db.select({id:invoices.id,totalPaise:invoices.totalPaise,subtotalPaise:invoices.subtotalPaise,discountPaise:invoices.discountPaise,taxPaise:invoices.taxPaise,createdAt:invoices.createdAt,method:payments.method}).from(invoices).leftJoin(payments,and(eq(payments.restaurantId,invoices.restaurantId),eq(payments.invoiceId,invoices.id))).leftJoin(sandboxGatewayOrders,and(eq(sandboxGatewayOrders.restaurantId,invoices.restaurantId),eq(sandboxGatewayOrders.invoiceId,invoices.id))).where(and(eq(invoices.restaurantId,restaurantId),eq(invoices.id,id)));
 if(!invoice)return null;
 const included=await db.select({id:invoiceOrders.orderId}).from(invoiceOrders).where(and(eq(invoiceOrders.restaurantId,restaurantId),eq(invoiceOrders.invoiceId,id)));
 const items=included.length?await db.select({id:orderItems.id,name:orderItems.name,quantity:orderItems.quantity,variant:orderItems.variant,addon:orderItems.addon,unitPaise:orderItems.unitPaise}).from(orderItems).where(and(eq(orderItems.restaurantId,restaurantId),inArray(orderItems.orderId,included.map(o=>o.id)))):[];
 return {...invoice,items};
}
