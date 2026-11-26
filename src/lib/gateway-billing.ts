import {and,eq} from "drizzle-orm";
import {database} from "@/lib/db";
import {invoices,payments,restaurants,sandboxGatewayOrders} from "@/lib/db/schema";
import {createSandboxOrder,sandboxConfig,sandboxRequest} from "@/lib/cashfree-sandbox";
import {merchantOrderId,rupeesToPaise,verifyPaidOrder} from "@/lib/domain/cashfree";
export async function gatewayState(restaurantId:string,invoiceId:string){
 const [r]=await database().select({verifiedAt:sandboxGatewayOrders.verifiedAt,merchantOrderId:sandboxGatewayOrders.merchantOrderId}).from(sandboxGatewayOrders).where(and(eq(sandboxGatewayOrders.restaurantId,restaurantId),eq(sandboxGatewayOrders.invoiceId,invoiceId)));return r??null;
}
export async function prepareSandbox(restaurantId:string,invoiceId:string){
 if(!sandboxConfig())throw new Error("Sandbox disabled");
 const db=database();
 const row=await db.transaction(async tx=>{
 const [r]=await tx.select({demo:restaurants.demo}).from(restaurants).where(eq(restaurants.id,restaurantId));if(!r?.demo)throw new Error("Sandbox demo only");
 const [i]=await tx.select().from(invoices).where(and(eq(invoices.restaurantId,restaurantId),eq(invoices.id,invoiceId))).for("update");if(!i||i.totalPaise<100||i.totalPaise>1000000)throw new Error("Invoice unavailable for sandbox");
 const [manual]=await tx.select({id:payments.id}).from(payments).where(and(eq(payments.restaurantId,restaurantId),eq(payments.invoiceId,invoiceId)));if(manual)throw new Error("Demo payment already recorded");
 await tx.insert(sandboxGatewayOrders).values({restaurantId,invoiceId,merchantOrderId:merchantOrderId(invoiceId),amountPaise:i.totalPaise}).onConflictDoNothing();
 const [g]=await tx.select().from(sandboxGatewayOrders).where(and(eq(sandboxGatewayOrders.restaurantId,restaurantId),eq(sandboxGatewayOrders.invoiceId,invoiceId)));return g;
 });
 if(row.verifiedAt)return {paid:true,session:null};
 let response:Record<string,unknown>;
 try{response=await sandboxRequest("/orders/"+row.merchantOrderId,"GET")}catch{response=await createSandboxOrder(invoiceId,row.amountPaise)}
 if(verifyPaidOrder(response,row.merchantOrderId,row.amountPaise)){await reconcileSandbox(row.merchantOrderId);return {paid:true,session:null}}
 if(response.order_id!==row.merchantOrderId||response.order_currency!=="INR"||rupeesToPaise(response.order_amount)!==row.amountPaise||response.order_status!=="ACTIVE"||typeof response.payment_session_id!=="string"||!response.payment_session_id)throw new Error("Gateway response did not match invoice");
 await db.update(sandboxGatewayOrders).set({paymentSessionId:response.payment_session_id}).where(and(eq(sandboxGatewayOrders.restaurantId,restaurantId),eq(sandboxGatewayOrders.invoiceId,invoiceId)));
 return {paid:false,session:response.payment_session_id};
}
export async function reconcileSandbox(id:string){
 if(!sandboxConfig()||!/^rt_[a-f0-9-]{36}$/.test(id))return false;
 const db=database();const [row]=await db.select().from(sandboxGatewayOrders).where(eq(sandboxGatewayOrders.merchantOrderId,id));if(!row)return false;
 if(row.verifiedAt)return true;
 const remote=await sandboxRequest("/orders/"+id,"GET");
 if(!verifyPaidOrder(remote,id,row.amountPaise))return false;
 await db.transaction(async tx=>{
 const [i]=await tx.select().from(invoices).where(and(eq(invoices.restaurantId,row.restaurantId),eq(invoices.id,row.invoiceId))).for("update");if(!i||i.totalPaise!==row.amountPaise)throw new Error("Invoice mismatch");
 const [manual]=await tx.select({id:payments.id}).from(payments).where(and(eq(payments.restaurantId,row.restaurantId),eq(payments.invoiceId,row.invoiceId)));if(manual)throw new Error("Conflicting payment");
 await tx.update(sandboxGatewayOrders).set({verifiedAt:new Date()}).where(eq(sandboxGatewayOrders.merchantOrderId,id));
 });return true;
}
