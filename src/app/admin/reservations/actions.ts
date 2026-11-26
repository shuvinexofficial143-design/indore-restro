"use server";
import {requireArea} from "@/lib/session";
import {confirmReservation,bookingStatus} from "@/lib/bookings";
import {revalidatePath} from "next/cache";
import {z} from "zod";
export async function decideBooking(_previous:string,form:FormData){const s=await requireArea("admin");try{const p=z.object({id:z.string().uuid(),event:z.boolean(),status:z.enum(["confirmed","rejected","cancelled","checked_in","completed","no_show"]),tableId:z.string().optional()}).parse({id:form.get("id"),event:form.get("event")==="true",status:form.get("status"),tableId:form.get("tableId")??undefined});if(!p.event&&p.status==="confirmed")await confirmReservation(s.restaurantId,p.id,z.string().uuid().parse(p.tableId));else await bookingStatus(s.restaurantId,p.id,p.event,p.status);revalidatePath("/admin/reservations");return "Request updated."}catch{return "Unable to update. Check availability and table capacity."}}
