import {sameOrigin} from "@/lib/request-origin";
import {currentSession} from "@/lib/session";
import {canAccess} from "@/lib/domain/auth";
import {sandboxConfig} from "@/lib/cashfree-sandbox";
import {prepareSandbox} from "@/lib/gateway-billing";
export async function POST(req:Request){
 if(!sandboxConfig())return Response.json({error:"Sandbox disabled"},{status:404});
 if(!sameOrigin(req))return Response.json({error:"Origin not allowed"},{status:403});
 const s=await currentSession();if(!s||s.isolatedDemo||!canAccess(s.role,"billing"))return Response.json({error:"Forbidden"},{status:403});
 try{const body=await req.json();if(typeof body.invoiceId!=="string"||!/^[a-f0-9-]{36}$/.test(body.invoiceId))return Response.json({error:"Invalid invoice"},{status:400});
 return Response.json(await prepareSandbox(s.restaurantId,body.invoiceId),{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({error:"Sandbox checkout unavailable; check invoice and configuration"},{status:409})}
}
