import {and,eq,gt,lt,isNull,desc,inArray,ne} from "drizzle-orm";
import {database} from "@/lib/db";
import {restaurantTables,tableSessions,waiterRequests,restaurants,staff,users,orders,reservations,invoices} from "@/lib/db/schema";
import {newToken,tokenHash} from "@/lib/domain/auth";
import {tableContext,lockDemoWrite} from "@/lib/demo-context";
import {audit} from "@/lib/audit";
import {OrderError} from "@/lib/ordering";
export async function getTable(token:string){return tableContext(token)}
export async function listTables(restaurantId:string){
 const db=database();
 const tables=await db.select().from(restaurantTables).where(eq(restaurantTables.restaurantId,restaurantId)).orderBy(restaurantTables.label);
 const sessions=await db.select({id:tableSessions.id,tableId:tableSessions.tableId,waiterUserId:tableSessions.waiterUserId,expiresAt:tableSessions.expiresAt}).from(tableSessions).where(and(eq(tableSessions.restaurantId,restaurantId),isNull(tableSessions.closedAt)));
 const waiters=await db.select({id:staff.userId,name:users.name}).from(staff).innerJoin(users,eq(users.id,staff.userId)).where(and(eq(staff.restaurantId,restaurantId),eq(staff.role,"waiter"),eq(staff.active,true),eq(users.active,true)));
 const now=new Date();const reserved=await db.select({tableId:reservations.tableId}).from(reservations).where(and(eq(reservations.restaurantId,restaurantId),inArray(reservations.status,["confirmed","checked_in"]),lt(reservations.startsAt,new Date(now.getTime()+30*60000)),gt(reservations.endsAt,now)));return {tables,sessions,waiters,reserved};
}
export async function openTable(restaurantId:string,tableId:string,waiterId:string|null){
 const token=newToken(),db=database();
 await db.transaction(async tx=>{
  const [r]=await tx.select().from(restaurants).where(and(eq(restaurants.id,restaurantId),eq(restaurants.demo,true)));
  if(!r)throw new OrderError("Demo restaurant only");
  const [table]=await tx.select().from(restaurantTables).where(and(eq(restaurantTables.restaurantId,restaurantId),eq(restaurantTables.id,tableId),eq(restaurantTables.active,true),eq(restaurantTables.cleaning,false))).for("update");
  if(!table)throw new OrderError("Table unavailable");
  const [existing]=await tx.select().from(tableSessions).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.tableId,tableId),isNull(tableSessions.closedAt)));
  if(existing)throw new OrderError("Close the existing session first",409);
  if(waiterId){const [w]=await tx.select({id:staff.userId}).from(staff).innerJoin(users,eq(staff.userId,users.id)).where(and(eq(staff.restaurantId,restaurantId),eq(staff.userId,waiterId),eq(staff.role,"waiter"),eq(staff.active,true),eq(users.active,true)));if(!w)throw new OrderError("Invalid waiter")}
  await tx.insert(tableSessions).values({restaurantId,tableId,tokenHash:tokenHash(token),waiterUserId:waiterId,expiresAt:new Date(Date.now()+8*60*60*1000)});
 });
 return token;
}
export async function closeTable(restaurantId:string,id:string){
 await database().transaction(async tx=>{
  const [session]=await tx.select().from(tableSessions).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.id,id),isNull(tableSessions.closedAt))).for("update");
  if(!session)throw new OrderError("Session not found");
  const [active]=await tx.select({id:orders.id}).from(orders).where(and(eq(orders.restaurantId,restaurantId),eq(orders.tableSessionId,id),inArray(orders.status,["pending","accepted","preparing","ready","served","out_for_delivery"]))).limit(1);
  if(active)throw new OrderError("Complete or cancel all orders first");
  await tx.update(tableSessions).set({closedAt:new Date()}).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.id,id)));
  await tx.update(waiterRequests).set({completedAt:new Date()}).where(and(eq(waiterRequests.restaurantId,restaurantId),eq(waiterRequests.sessionId,id),isNull(waiterRequests.completedAt)));
 });
}
export async function createTableRequest(token:string,kind:"waiter"|"bill"){
 const context=await tableContext(token);if(!context)throw new OrderError("Session expired",404);
 await database().transaction(async tx=>{
  if(!await lockDemoWrite(tx,context.restaurantId))throw new OrderError("Session expired",404);
  const [s]=await tx.select({id:tableSessions.id,restaurantId:tableSessions.restaurantId}).from(tableSessions).innerJoin(restaurants,and(eq(restaurants.id,tableSessions.restaurantId),eq(restaurants.demo,true))).where(and(eq(tableSessions.restaurantId,context.restaurantId),eq(tableSessions.tokenHash,tokenHash(token)),isNull(tableSessions.closedAt),gt(tableSessions.expiresAt,new Date()))).for("update");
  if(!s)throw new OrderError("Session expired",404);
  await tx.insert(waiterRequests).values({restaurantId:s.restaurantId,sessionId:s.id,kind}).onConflictDoNothing();
 });
}
export async function staffRequests(restaurantId:string,waiterId?:string){
 return database().select({id:waiterRequests.id,kind:waiterRequests.kind,table:restaurantTables.label,createdAt:waiterRequests.createdAt}).from(waiterRequests).innerJoin(tableSessions,and(eq(tableSessions.restaurantId,waiterRequests.restaurantId),eq(tableSessions.id,waiterRequests.sessionId))).innerJoin(restaurantTables,and(eq(restaurantTables.restaurantId,tableSessions.restaurantId),eq(restaurantTables.id,tableSessions.tableId))).where(and(eq(waiterRequests.restaurantId,restaurantId),isNull(waiterRequests.completedAt),isNull(tableSessions.closedAt),waiterId?eq(tableSessions.waiterUserId,waiterId):undefined)).orderBy(desc(waiterRequests.createdAt)).limit(100);
}
export async function finishRequest(restaurantId:string,id:string,waiterId?:string){
 const db=database();
 const [r]=await db.select({id:waiterRequests.id}).from(waiterRequests).innerJoin(tableSessions,and(eq(tableSessions.restaurantId,waiterRequests.restaurantId),eq(tableSessions.id,waiterRequests.sessionId))).where(and(eq(waiterRequests.restaurantId,restaurantId),eq(waiterRequests.id,id),isNull(waiterRequests.completedAt),isNull(tableSessions.closedAt),waiterId?eq(tableSessions.waiterUserId,waiterId):undefined));
 if(!r)throw new OrderError("Request not available");
 await db.update(waiterRequests).set({completedAt:new Date()}).where(and(eq(waiterRequests.restaurantId,restaurantId),eq(waiterRequests.id,id),isNull(waiterRequests.completedAt)));
}

export async function setTableAvailability(restaurantId:string,id:string,floor:string,capacity:number,state:"available"|"cleaning"|"disabled"){
 await database().transaction(async tx=>{
  const [t]=await tx.select().from(restaurantTables).where(and(eq(restaurantTables.restaurantId,restaurantId),eq(restaurantTables.id,id))).for("update");if(!t)throw new OrderError("Table not found");
  const [s]=await tx.select({id:tableSessions.id}).from(tableSessions).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.tableId,id),isNull(tableSessions.closedAt)));if(s)throw new OrderError("Close the session before editing table availability");
  await tx.update(restaurantTables).set({floor,capacity,active:state!=="disabled",cleaning:state==="cleaning"}).where(and(eq(restaurantTables.restaurantId,restaurantId),eq(restaurantTables.id,id)));
 });
}
export async function rotateTableToken(restaurantId:string,id:string){
 const token=newToken();
 const changed=await database().update(tableSessions).set({tokenHash:tokenHash(token)}).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.id,id),isNull(tableSessions.closedAt),gt(tableSessions.expiresAt,new Date()))).returning({id:tableSessions.id});
 if(!changed.length)throw new OrderError("Session expired or closed");return token;
}

export async function moveTableSession(restaurantId:string,id:string,targetId:string,waiterId:string|null,actorUserId:string){
 const token=newToken();
 await database().transaction(async tx=>{
 if(!await lockDemoWrite(tx,restaurantId))throw new OrderError("Demo session expired");
 const [s]=await tx.select().from(tableSessions).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.id,id),isNull(tableSessions.closedAt),gt(tableSessions.expiresAt,new Date()))).for("update");if(!s)throw new OrderError("Session unavailable");
 const [target]=await tx.select().from(restaurantTables).where(and(eq(restaurantTables.restaurantId,restaurantId),eq(restaurantTables.id,targetId),eq(restaurantTables.active,true),eq(restaurantTables.cleaning,false))).for("update");if(!target)throw new OrderError("Target table unavailable");
 const [occupied]=await tx.select({id:tableSessions.id}).from(tableSessions).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.tableId,targetId),ne(tableSessions.id,id),isNull(tableSessions.closedAt)));if(occupied)throw new OrderError("Target table occupied");
 const now=new Date();const [reservation]=await tx.select({id:reservations.id}).from(reservations).where(and(eq(reservations.restaurantId,restaurantId),eq(reservations.tableId,targetId),inArray(reservations.status,["confirmed","checked_in"]),lt(reservations.startsAt,new Date(now.getTime()+30*60000)),gt(reservations.endsAt,now)));if(targetId!==s.tableId&&reservation)throw new OrderError("Target table reserved");
 if(waiterId){const [w]=await tx.select({id:staff.userId}).from(staff).innerJoin(users,eq(staff.userId,users.id)).where(and(eq(staff.restaurantId,restaurantId),eq(staff.userId,waiterId),eq(staff.role,"waiter"),eq(staff.active,true),eq(users.active,true)));if(!w)throw new OrderError("Waiter unavailable");}
 const [billed]=await tx.select({id:invoices.id}).from(invoices).where(and(eq(invoices.restaurantId,restaurantId),eq(invoices.tableSessionId,id))).limit(1);if(billed)throw new OrderError("Invoiced sessions cannot move");
 await tx.update(tableSessions).set({tableId:targetId,waiterUserId:waiterId,tokenHash:tokenHash(token)}).where(and(eq(tableSessions.restaurantId,restaurantId),eq(tableSessions.id,id)));
 await audit(tx,restaurantId,actorUserId,"table.transferred",id,`Table ${s.tableId} → ${targetId}; waiter assignment updated`);
 });
 return token;
}
