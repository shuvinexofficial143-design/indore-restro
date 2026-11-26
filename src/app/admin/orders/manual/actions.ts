"use server";
import {requireArea} from "@/lib/session";
import {createDemoOrder,OrderError} from "@/lib/ordering";
import {z} from "zod";
import {revalidatePath} from "next/cache";
export async function manualOrder(_state:{message?:string;token?:string},form:FormData):Promise<{message?:string;token?:string}>{const s=await requireArea("admin");try{const session=z.union([z.literal(""),z.string().uuid()]).parse(form.get("session")),token=z.string().regex(/^[a-f0-9]{64}$/).parse(form.get("token"));const raw=JSON.parse(z.string().max(12000).parse(form.get("lines")));const result=await createDemoOrder({token,kind:form.get("kind"),lines:raw,instructions:form.get("instructions")??"",couponCode:form.get("couponCode")??""},{restaurantId:s.restaurantId,tableSessionId:session||undefined,actorId:s.userId});revalidatePath("/admin/orders");return {message:"Demo order #"+result.id.slice(0,8)+" recorded.",token}}catch(e){return {message:e instanceof OrderError?e.message:"Unable to record manual demo order."}}}
