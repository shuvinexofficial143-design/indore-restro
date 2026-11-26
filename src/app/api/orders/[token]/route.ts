import {trackDemoOrder} from "@/lib/ordering";
export const dynamic="force-dynamic";
export async function GET(_req:Request,{params}:{params:Promise<{token:string}>}){try{const data=await trackDemoOrder((await params).token);return Response.json(data??{error:"Order not found"},{status:data?200:404,headers:{"Cache-Control":"no-store"}})}catch{return Response.json({error:"Tracking unavailable"},{status:503,headers:{"Cache-Control":"no-store"}})}}
