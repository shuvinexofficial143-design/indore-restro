"use server";
import {requireArea} from "@/lib/session";
import {transitionOrder} from "@/lib/ordering";
import {orderStatuses} from "@/lib/domain/order";
import {z} from "zod";
import {revalidatePath} from "next/cache";
export async function updateOrder(form:FormData){const session=await requireArea("admin");const result=z.object({id:z.string().uuid(),status:z.enum(orderStatuses)}).safeParse({id:form.get("id"),status:form.get("status")});if(!result.success)throw new Error("Invalid order action");await transitionOrder(session.restaurantId,session.userId,result.data.id,result.data.status);revalidatePath("/admin/orders")}
