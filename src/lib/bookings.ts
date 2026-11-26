import {and,eq,desc,lt,gt,inArray,ne} from "drizzle-orm";
import {z} from "zod";
import {database} from "@/lib/db";
import {restaurants,reservations,eventBookings,restaurantTables} from "@/lib/db/schema";
import {tokenHash} from "@/lib/domain/auth";
import {OrderError} from "@/lib/ordering";
export const bookingInput=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),event:z.boolean(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),time:z.enum(["12:00","13:00","14:00","15:00","17:00","18:00","19:00","20:00","21:00","22:00"]),guests:z.number().int().min(1).max(100),occasion:z.enum(["Casual dining","Birthday","Anniversary","Family gathering","Corporate party","Private dining","Other"]),budgetPaise:z.number().int().min(0).max(100000000).optional()});
export async function createBooking(raw:unknown){
 if(process.env.ENABLE_DEMO_ORDERS!=="1"||!process.env.DATABASE_URL)throw new OrderError("Demo bookings unavailable",503);
 const data=bookingInput.parse(raw),startsAt=new Date(data.date+"T"+data.time+":00+05:30");
 if(!Number.isFinite(startsAt.getTime())||new Date(startsAt.getTime()+19800000).toISOString().slice(0,10)!==data.date||startsAt<=new Date()||startsAt.getTime()>Date.now()+365*86400000||(!data.event&&data.guests>30))throw new OrderError("Invalid future date or guest count");
 const db=database(),[r]=await db.select({id:restaurants.id}).from(restaurants).where(and(eq(restaurants.slug,"royal-table"),eq(restaurants.demo,true)));
 if(!r)throw new OrderError("Demo restaurant unavailable",503);
 const key=tokenHash(data.token);
 if(data.event){const [row]=await db.insert(eventBookings).values({restaurantId:r.id,requestHash:key,startsAt,guests:data.guests,occasion:data.occasion,budgetPaise:data.budgetPaise??null}).onConflictDoNothing().returning({id:eventBookings.id});return {id:row?.id??null,status:"requested"};}
 const [row]=await db.insert(reservations).values({restaurantId:r.id,requestHash:key,startsAt,endsAt:new Date(startsAt.getTime()+90*60000),guests:data.guests,occasion:data.occasion}).onConflictDoNothing().returning({id:reservations.id});return {id:row?.id??null,status:"requested"};
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
export async function bookingStatus(restaurantId:string,id:string,event:boolean,status:"rejected"|"cancelled"|"confirmed"){
 const db=database();if(event){await db.update(eventBookings).set({status}).where(and(eq(eventBookings.restaurantId,restaurantId),eq(eventBookings.id,id),eq(eventBookings.status,"requested")));return}
 if(status==="confirmed")throw new OrderError("Assign a table first");
 await db.update(reservations).set({status}).where(and(eq(reservations.restaurantId,restaurantId),eq(reservations.id,id),inArray(reservations.status,["requested","confirmed"])));
}
