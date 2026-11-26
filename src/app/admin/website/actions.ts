"use server";
import {requireArea} from "@/lib/session";
import {audit} from "@/lib/audit";
import {database} from "@/lib/db";
import {websiteContent} from "@/lib/db/schema";
import {z} from "zod";
import {revalidatePath} from "next/cache";
const input=z.object({headline:z.string().trim().min(2).max(65),headlineAccent:z.string().trim().min(2).max(65),intro:z.string().trim().min(2).max(350),offerTitle:z.string().trim().min(2).max(100),offerText:z.string().trim().max(350),openingHours:z.string().trim().min(2).max(100),cityLabel:z.string().trim().min(2).max(100),accentColor:z.enum(["#d5b578","#e9c46a","#d6a09a","#a9c8a1"]),showOffer:z.boolean()});
export async function saveWebsite(_state:string,form:FormData){const s=await requireArea("admin");try{const p=input.parse({...Object.fromEntries(form),showOffer:form.get("showOffer")==="on"});await database().transaction(async tx=>{await tx.insert(websiteContent).values({restaurantId:s.restaurantId,...p}).onConflictDoUpdate({target:websiteContent.restaurantId,set:{...p,updatedAt:new Date()}});await audit(tx,s.restaurantId,s.userId,"website.updated",s.restaurantId,"Homepage settings changed")});revalidatePath("/","layout");return "Website content saved."}catch{return "Unable to save. Check all text limits."}}
