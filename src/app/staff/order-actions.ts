"use server";
import {currentSession} from "@/lib/session";
import {transitionOrder,markDishReady} from "@/lib/ordering";
import {finishRequest} from "@/lib/tables";
import {permittedTargets} from "@/lib/domain/staff-order";
import {orderStatuses} from "@/lib/domain/order";
import {z} from "zod";
import {revalidatePath} from "next/cache";
export async function staffTransition(form:FormData){const s=await currentSession();if(!s)throw new Error("Unauthorized");const p=z.object({id:z.string().uuid(),status:z.enum(orderStatuses)}).parse({id:form.get("id"),status:form.get("status")});if(!permittedTargets(s.role).includes(p.status))throw new Error("Forbidden");await transitionOrder(s.restaurantId,s.userId,p.id,p.status,s.role==="waiter"?s.userId:undefined);for(const path of ["/admin/orders","/kitchen","/waiter"])revalidatePath(path)}
export async function completeRequest(form:FormData){const s=await currentSession();if(!s||!["owner","manager","waiter"].includes(s.role))throw new Error("Forbidden");await finishRequest(s.restaurantId,z.string().uuid().parse(form.get("id")),s.role==="waiter"?s.userId:undefined);revalidatePath("/waiter")}

export async function readyDish(form:FormData){const s=await currentSession();if(!s||!["owner","manager","kitchen"].includes(s.role))throw new Error("Forbidden");const p=z.object({id:z.string().uuid(),line:z.string().uuid()}).parse({id:form.get("id"),line:form.get("line")});await markDishReady(s.restaurantId,s.userId,p.id,p.line);revalidatePath("/kitchen");revalidatePath("/admin/orders")}
