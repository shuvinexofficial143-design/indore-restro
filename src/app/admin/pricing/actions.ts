"use server";
import {requireArea} from "@/lib/session";
import {database} from "@/lib/db";
import {restaurantSettings,coupons,menuItems} from "@/lib/db/schema";
import {and,eq} from "drizzle-orm";
import {z} from "zod";
import {revalidatePath} from "next/cache";
export async function pricingAction(_state:string,form:FormData){const s=await requireArea("admin"),db=database();try{const kind=form.get("kind");if(kind==="tax"){const bps=z.coerce.number().min(0).max(25).transform(n=>Math.round(n*100)).parse(form.get("rate"));await db.insert(restaurantSettings).values({restaurantId:s.restaurantId,demoTaxBps:bps}).onConflictDoUpdate({target:restaurantSettings.restaurantId,set:{demoTaxBps:bps}})}
 else if(kind==="coupon"){const p=z.object({code:z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{2,32}$/),percent:z.coerce.number().min(.01).max(100),minimum:z.coerce.number().min(0).max(100000),cap:z.union([z.literal(""),z.coerce.number().min(.01).max(100000)]),uses:z.coerce.number().int().min(1).max(10000),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),menuId:z.string().max(80)}).parse(Object.fromEntries(form));
 const expiresAt=new Date(p.date+"T23:59:59+05:30");if(!Number.isFinite(expiresAt.getTime())||expiresAt<=new Date())throw new Error("Invalid expiry");if(p.menuId){const [m]=await db.select({id:menuItems.id}).from(menuItems).where(and(eq(menuItems.restaurantId,s.restaurantId),eq(menuItems.id,p.menuId)));if(!m)throw new Error("Invalid menu item")}
 await db.insert(coupons).values({restaurantId:s.restaurantId,code:p.code,percentBps:Math.round(p.percent*100),minimumPaise:Math.round(p.minimum*100),maximumDiscountPaise:p.cap===""?null:Math.round(p.cap*100),maximumUses:p.uses,eligibleMenuId:p.menuId||null,expiresAt})}
 else if(kind==="disable"){const code=z.string().regex(/^[A-Z0-9-]{2,32}$/).parse(form.get("code"));await db.update(coupons).set({active:false}).where(and(eq(coupons.restaurantId,s.restaurantId),eq(coupons.code,code)))}
 else return "Unknown action.";revalidatePath("/admin/pricing");return "Saved."}catch{return "Unable to save. Check expiry, coupon code and limits."}}
