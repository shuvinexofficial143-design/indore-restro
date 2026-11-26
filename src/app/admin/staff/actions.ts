"use server";
import {requireArea} from "@/lib/session";
import {audit} from "@/lib/audit";
import {database} from "@/lib/db";
import {staff,users,sessions} from "@/lib/db/schema";
import {and,eq,ne} from "drizzle-orm";
import {hashPassword} from "@/lib/domain/auth";
import {z} from "zod";
import {revalidatePath} from "next/cache";
export async function createStaff(_state:string,form:FormData){const s=await requireArea("admin");if(s.role!=="owner")return "Only owners can create staff.";if(s.isolatedDemo)return "Persistent staff credentials are disabled in isolated demos.";try{const p=z.object({email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),name:z.string().trim().min(2).max(100),role:z.enum(["manager","kitchen","waiter","cashier"]),password:z.string().min(12).max(128)}).parse(Object.fromEntries(form));const hash=await hashPassword(p.password);await database().transaction(async tx=>{const [u]=await tx.insert(users).values({email:p.email,name:p.name,passwordHash:hash}).returning({id:users.id});await tx.insert(staff).values({restaurantId:s.restaurantId,userId:u.id,role:p.role});await audit(tx,s.restaurantId,s.userId,"staff.created",u.id,"Role: "+p.role)});revalidatePath("/admin/staff");return "Staff created. Share the password privately."}catch{return "Unable to create staff; check details or existing email."}}
export async function toggleStaff(form:FormData){const s=await requireArea("admin");if(s.role!=="owner")throw new Error("Forbidden");const id=z.string().uuid().parse(form.get("id")),active=form.get("active")==="true";await database().transaction(async tx=>{const changed=await tx.update(staff).set({active}).where(and(eq(staff.restaurantId,s.restaurantId),eq(staff.userId,id),ne(staff.role,"owner"))).returning({id:staff.userId});if(changed.length&&!active)await tx.delete(sessions).where(and(eq(sessions.restaurantId,s.restaurantId),eq(sessions.userId,id)));if(changed.length)await audit(tx,s.restaurantId,s.userId,"staff.access",id,active?"Enabled":"Disabled")});revalidatePath("/admin/staff")}
