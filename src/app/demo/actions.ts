"use server";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {activeDemo,demoCookie,demoRoleCookie,demoRoles,revokeCurrentDemo} from "@/lib/demo-context";
import {provisionDemo} from "@/lib/demo-provision";
export async function startDemo(_state:string,form:FormData){const jar=await cookies();if(jar.get("royal_session"))return "Sign out of the private staff account before creating a demo.";if(await activeDemo())return "End the current demo before starting another.";try{const code=z.string().min(1).max(128).parse(form.get("code")),s=await provisionDemo(code),opts={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",expires:s.expiresAt};jar.set(demoCookie,s.token,opts);jar.set(demoRoleCookie,"owner",opts)}catch(e){const message=e instanceof Error?e.message:"";return ["Invalid invitation code.","Demo capacity limit reached. Try again later.","Demo capacity limit reached.","Isolated demo is disabled."].includes(message)?message:"Unable to create demo."}revalidatePath("/","layout");redirect("/demo")}
export async function switchDemoRole(form:FormData){const d=await activeDemo();if(!d)redirect("/demo");const role=z.enum(demoRoles).parse(form.get("role")),jar=await cookies();jar.set(demoRoleCookie,role,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:d.expiresAt});redirect(role==="owner"?"/admin":role==="kitchen"?"/kitchen":role==="waiter"?"/waiter":"/admin/billing")}
export async function endDemo(){await revokeCurrentDemo();revalidatePath("/","layout");redirect("/demo")}
