import {and,eq,desc,lt,gt,inArray,ne,sql} from "drizzle-orm";
import {z} from "zod";
import {database} from "@/lib/db";
import {reservations,eventBookings,restaurantTables} from "@/lib/db/schema";
import {tokenHash} from "@/lib/domain/auth";
import {orderingRestaurant,lockDemoWrite} from "@/lib/demo-context";
import {allowedBookingTransition,type BookingStatus} from "@/lib/domain/booking";
import {OrderError} from "@/lib/ordering";
export const bookingInput=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),event:z.boolean(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),time:z.enum(["12:00","13:00","14:00","15:00","17:00","18:00","19:00","20:00","21:00","22:00"]),guests:z.number().int().min(1).max(100),occasion:z.enum(["Casual dining","Birthday","Anniversary","Family gathering","Corporate party","Private dining","Other"]),budgetPaise:z.number().int().min(0).max(100000000).optional()});
export async function createBooking(raw:unknown){
 const r=await orderingRestaurant();if(!r)throw new OrderError("Demo bookings unavailable",503);
 const data=bookingInput.parse(raw),startsAt=new Date(data.date+"T"+data.time+":00+05:30");
 if(!Number.isFinite(startsAt.getTime())||new Date(startsAt.getTime()+19800000).toISOString().slice(0,10)!==data.date||startsAt<=new Date()||startsAt.getTime()>Date.now()+365*86400000||(!data.event&&data.guests>30))throw new OrderError("Invalid future date or guest count");
 return database().transaction(async tx=>{
 const mode=await lockDemoWrite(tx,r.id);if(!mode)throw new OrderError("Demo session expired",409);
 if(mode==="isolated"){const [a]=await tx.select({n:sql<number>`count(*)::int`}).from(reservations).where(eq(reservations.restaurantId,r.id));const [b]=await tx.select({n:sql<number>`count(*)::int`}).from(eventBookings).where(eq(eventBookings.restaurantId,r.id));if(a.n+b.n>=100)throw new OrderError("Demo booking limit reached",429);}
 const key=tokenHash(data.token);
 if(data.event){const [row]=await tx.insert(eventBookings).values({restaurantId:r.id,requestHash:key,startsAt,guests:data.guests,occasion:data.occasion,budgetPaise:data.budgetPaise??null}).onConflictDoNothing().returning({id:eventBookings.id});if(!row){const [existing]=await tx.select({id:eventBookings.id,status:eventBookings.status}).from(eventBookings).where(and(eq(eventBookings.restaurantId,r.id),eq(eventBookings.requestHash,key)));if(!existing)throw new OrderError("Request key already used",409);return existing;}return {id:row.id,status:"requested"};}
 const [row]=await tx.insert(reservations).values({restaurantId:r.id,requestHash:key,startsAt,endsAt:new Date(startsAt.getTime()+90*60000),guests:data.guests,occasion:data.occasion}).onConflictDoNothing().returning({id:reservations.id});if(!row){const [existing]=await tx.select({id:reservations.id,status:reservations.status}).from(reservations).where(and(eq(reservations.restaurantId,r.id),eq(reservations.requestHash,key)));if(!existing)throw new OrderError("Request key already used",409);return existing;}return {id:row.id,status:"requested"};
 });
}
export async function listBookings(restaurantId:string){const db=database();return {reservations:await db.select().from(reservations).where(eq(reservations.restaurantId,restaurantId)).orderBy(desc(reservations.startsAt)).limit(100),events:await db.select().from(eventBookings).where(eq(eventBookings.restaurantId,restaurantId)).orderBy(desc(eventBookings.startsAt)).limit(100),tables:await db.select().from(restaurantTables).where(and(eq(restaurantTables.restaurantId,restaurantId),eq(restaurantTables.active,true)))}}
export async function confirmReservation(restaurantId:string,id:string,tableId:string){
 await database().transaction(async tx=>{
  const [r]=await tx.select().from(reservations).where(and(eq(reservations.restaurantId,restaurantId),eq(reservations.id,id),eq(reservations.status,"requested"))).for("update");if(!r||r.startsAt<=new Date())throw new OrderError("Reservation not available");
  const [t]=await tx.select().from(restaurantTables).where(and(eq(restaurantTables.restaurantId,restaurantId),eq(restaurantTables.id,tableId),eq(restaurantTables.active,true))).for("update");if(!t||t.capacity<r.guests)throw new OrderError("Table capacity insufficient");
  const [overlap]=await tx.select({id:reservations.id}).from(reservations).where(and(eq(reservations.restaurantId,restaurantId),eq(reservations.tableId,tableId),ne(reservations.id,id),inArray(reservations.status,["confirmed","checked_in"]),lt(reservations.startsAt,r.endsAt),gt(reservations.endsAt,r.startsAt))).limit(1);
  if(overlap)throw new OrderError("Table already reserved at this time");
  await tx.update(reservations).set({tableId,status:"confirmed"}).where(and(eq(reservations.restaurantId,restaurantId),eq(reservations.id,id)));
 });
}
export async function bookingStatus(restaurantId:string,id:string,event:boolean,status:BookingStatus){
 await database().transaction(async tx=>{
 if(event){const [r]=await tx.select().from(eventBookings).where(and(eq(eventBookings.restaurantId,restaurantId),eq(eventBookings.id,id))).for("update");if(!r||!allowedBookingTransition(r.status,status,r.startsAt,true))throw new OrderError("Invalid event transition");await tx.update(eventBookings).set({status}).where(and(eq(eventBookings.restaurantId,restaurantId),eq(eventBookings.id,id)));return}
 const [r]=await tx.select().from(reservations).where(and(eq(reservations.restaurantId,restaurantId),eq(reservations.id,id))).for("update");if(!r||!allowedBookingTransition(r.status,status,r.startsAt,false))throw new OrderError("Invalid reservation transition");
 await tx.update(reservations).set({status}).where(and(eq(reservations.restaurantId,restaurantId),eq(reservations.id,id)));
 });
}
