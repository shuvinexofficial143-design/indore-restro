"use server";
import {requireArea} from "@/lib/session";
import {generateInvoice,recordDemoPayment} from "@/lib/billing";
import {z} from "zod";
import {revalidatePath} from "next/cache";
export async function createInvoice(_state:string,form:FormData){const s=await requireArea("billing");try{await generateInvoice(s.restaurantId,z.string().uuid().parse(form.get("id")));revalidatePath("/admin/billing");return "Demo invoice created."}catch(e){return e instanceof Error&&e.name==="Error"&&["Close the table after all orders are completed before billing.","Complete all orders before invoicing"].includes(e.message)?e.message:"Unable to generate invoice."}}
export async function recordPayment(_state:string,form:FormData){const s=await requireArea("billing");try{const p=z.object({id:z.string().uuid(),method:z.enum(["cash","upi","card"])}).parse({id:form.get("id"),method:form.get("method")});await recordDemoPayment(s.restaurantId,p.id,s.userId,p.method);revalidatePath("/admin/billing");return "Demo payment record saved. No money collected."}catch{return "Unable to record demo payment."}}
