"use server";
import {requireArea} from "@/lib/session";
import {database} from "@/lib/db";
import {menuItems} from "@/lib/db/schema";
import {and,eq,inArray} from "drizzle-orm";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {randomUUID} from "node:crypto";
const price=z.coerce.number().finite().min(0).max(100000).transform(n=>Math.round(n*100));
const optionalPrice=z.union([z.literal(""),price]).transform(n=>n===""?null:n);
const formSchema=z.object({id:z.string().max(80),name:z.string().trim().min(2).max(100),category:z.string().trim().min(2).max(60),description:z.string().trim().max(400),pricePaise:price,halfPaise:optionalPrice,addonPaise:optionalPrice,prepMinutes:z.coerce.number().int().min(1).max(180),veg:z.boolean(),available:z.boolean(),sortOrder:z.coerce.number().int().min(0).max(9999),special:z.boolean()});
export async function saveMenu(_state:string,form:FormData){const s=await requireArea("admin");try{
 const p=formSchema.parse({id:form.get("id")??"",name:form.get("name"),category:form.get("category"),description:form.get("description"),pricePaise:form.get("price"),halfPaise:form.get("half"),addonPaise:form.get("addon"),prepMinutes:form.get("prep"),veg:form.get("veg")==="on",available:form.get("available")==="on",sortOrder:form.get("sortOrder")??0,special:form.get("special")==="on"});
 const {id,...fields}=p;
 if(id){const rows=await database().update(menuItems).set(fields).where(and(eq(menuItems.restaurantId,s.restaurantId),eq(menuItems.id,id))).returning({id:menuItems.id});if(!rows.length)return "Menu item not found."}
 else await database().insert(menuItems).values({restaurantId:s.restaurantId,id:randomUUID(),...fields});
 for(const path of ["/admin/menu","/app","/menu"])revalidatePath(path);return "Saved.";
 }catch{return "Unable to save. Check the fields and price limits."}}

export async function bulkMenu(_state:string,form:FormData){const s=await requireArea("admin");try{const ids=z.array(z.string().min(1).max(80)).min(1).max(100).parse(form.getAll("ids")),available=z.enum(["true","false"]).parse(form.get("available"))==="true";const rows=await database().update(menuItems).set({available}).where(and(eq(menuItems.restaurantId,s.restaurantId),inArray(menuItems.id,ids))).returning({id:menuItems.id});for(const path of ["/admin/menu","/app","/menu"])revalidatePath(path);return rows.length+" dishes updated."}catch{return "Select dishes and a valid availability."}}
