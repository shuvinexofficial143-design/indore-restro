"use server";
import {requireArea} from "@/lib/session";
import {database} from "@/lib/db";
import {restaurantTables} from "@/lib/db/schema";
import {openTable,closeTable,setTableAvailability,rotateTableToken} from "@/lib/tables";
import {z} from "zod";
import {revalidatePath} from "next/cache";
export async function addTable(form:FormData){const s=await requireArea("admin");const {label,capacity}=z.object({label:z.string().trim().min(1).max(40),capacity:z.coerce.number().int().min(1).max(30)}).parse({label:form.get("label"),capacity:form.get("capacity")});await database().insert(restaurantTables).values({restaurantId:s.restaurantId,label,capacity}).onConflictDoNothing();revalidatePath("/admin/tables")}
export async function startTable(_state:{token?:string;error?:string},form:FormData):Promise<{token?:string;error?:string}>{const s=await requireArea("admin");try{const {tableId,waiterId}=z.object({tableId:z.string().uuid(),waiterId:z.union([z.literal(""),z.string().uuid()])}).parse({tableId:form.get("tableId"),waiterId:form.get("waiterId")});const token=await openTable(s.restaurantId,tableId,waiterId||null);revalidatePath("/admin/tables");return {token}}catch{return {error:"Could not start session. Check existing session or waiter."}}}
export async function endTable(_state:{error?:string},form:FormData):Promise<{error?:string}>{const s=await requireArea("admin");try{await closeTable(s.restaurantId,z.string().uuid().parse(form.get("id")));revalidatePath("/admin/tables");return {}}catch{return {error:"Unable to close. Complete all active orders first."}}}

export async function editTable(_state:string,form:FormData){const s=await requireArea("admin");try{const p=z.object({id:z.string().uuid(),floor:z.string().trim().min(1).max(40),capacity:z.coerce.number().int().min(1).max(30),state:z.enum(["available","cleaning","disabled"])}).parse(Object.fromEntries(form));await setTableAvailability(s.restaurantId,p.id,p.floor,p.capacity,p.state);revalidatePath("/admin/tables");return "Table updated."}catch{return "Unable to edit. Close any open session first."}}
export async function rotateTable(_state:{token?:string;error?:string},form:FormData):Promise<{token?:string;error?:string}>{const s=await requireArea("admin");try{const token=await rotateTableToken(s.restaurantId,z.string().uuid().parse(form.get("id")));revalidatePath("/admin/tables");return {token}}catch{return {error:"Cannot regenerate an expired or closed session."}}}
