import {createDemoOrder,OrderError} from "@/lib/ordering";
export async function POST(req:Request){
 if(req.headers.get("origin")!==new URL(req.url).origin)return Response.json({error:"Origin not allowed"},{status:403});
 if(!req.headers.get("content-type")?.includes("application/json"))return Response.json({error:"JSON required"},{status:415});
 try{const body=await req.text();if(body.length>20000)return Response.json({error:"Request too large"},{status:413});const result=await createDemoOrder(JSON.parse(body));return Response.json(result,{status:result.reused?200:201,headers:{"Cache-Control":"no-store"}})}
 catch(e){return Response.json({error:e instanceof OrderError?e.message:e instanceof SyntaxError?"Invalid JSON":"Order service unavailable"},{status:e instanceof OrderError?e.status:e instanceof SyntaxError?400:503})}
}
