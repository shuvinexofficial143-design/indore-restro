import {sandboxConfig} from "@/lib/cashfree-sandbox";
import {verifyWebhook} from "@/lib/domain/cashfree";
import {reconcileSandbox} from "@/lib/gateway-billing";
export const runtime="nodejs";
export async function POST(req:Request){
 const c=sandboxConfig();if(!c)return Response.json({error:"Not available"},{status:404});
 const raw=await req.text();if(raw.length>100000)return Response.json({error:"Too large"},{status:413});
 if(!verifyWebhook(raw,req.headers.get("x-webhook-timestamp"),req.headers.get("x-webhook-signature"),c.secret))return Response.json({error:"Invalid signature"},{status:401});
 try{const event=JSON.parse(raw);if(event.type!=="PAYMENT_SUCCESS_WEBHOOK")return Response.json({received:true});
 const id=event.data?.order?.order_id;if(typeof id!=="string")return Response.json({error:"Invalid event"},{status:400});
 if(!await reconcileSandbox(id))return Response.json({error:"Not verified"},{status:409});return Response.json({received:true,verified:true});
 }catch{return Response.json({error:"Unable to reconcile"},{status:503})}
}
