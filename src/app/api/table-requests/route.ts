import {sameOrigin} from "@/lib/request-origin";
import {z} from "zod";
import {createTableRequest} from "@/lib/tables";
import {OrderError,tokenSchema} from "@/lib/ordering";
export async function POST(req:Request){if(!sameOrigin(req))return Response.json({error:"Origin not allowed"},{status:403});if(!req.headers.get("content-type")?.includes("application/json"))return Response.json({error:"JSON required"},{status:415});try{const text=await req.text();if(text.length>2000)return Response.json({error:"Request too large"},{status:413});const p=z.object({token:tokenSchema,kind:z.enum(["waiter","bill"])}).parse(JSON.parse(text));await createTableRequest(p.token,p.kind);return Response.json({ok:true})}catch(e){return Response.json({error:e instanceof OrderError?e.message:"Request unavailable"},{status:e instanceof OrderError?e.status:400})}}
