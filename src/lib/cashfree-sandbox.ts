import {SANDBOX_API,merchantOrderId} from "@/lib/domain/cashfree";
export function sandboxConfig(){
 const {ENABLE_CASHFREE_SANDBOX,CASHFREE_ENV,CASHFREE_APP_ID,CASHFREE_SECRET_KEY,CASHFREE_TEST_PHONE,APP_URL}=process.env;
 if(ENABLE_CASHFREE_SANDBOX!=="1"||CASHFREE_ENV!=="sandbox"||!CASHFREE_APP_ID||!CASHFREE_SECRET_KEY||!CASHFREE_TEST_PHONE||!/^\d{10}$/.test(CASHFREE_TEST_PHONE)||!APP_URL)return null;
 try{const url=new URL(APP_URL);if(url.protocol!=="https:"||url.username||url.password||url.pathname!=="/"||url.search||url.hash)return null;
 return {appId:CASHFREE_APP_ID,secret:CASHFREE_SECRET_KEY,phone:CASHFREE_TEST_PHONE,origin:url.origin}}catch{return null}
}
export async function sandboxRequest(path:string,method:"GET"|"POST",body?:unknown,idempotency?:string){
 const c=sandboxConfig();if(!c)throw new Error("Sandbox disabled");
 if(!/^\/orders(?:\/rt_[a-f0-9-]{36})?$/.test(path))throw new Error("Invalid gateway endpoint");
 const response=await fetch(SANDBOX_API+path,{method,headers:{"x-api-version":"2025-01-01","x-client-id":c.appId,"x-client-secret":c.secret,"content-type":"application/json",...(idempotency?{"x-idempotency-key":idempotency}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error("Sandbox gateway request failed: "+response.status);
 return await response.json() as Record<string,unknown>;
}
export async function createSandboxOrder(invoiceId:string,amountPaise:number){
 const c=sandboxConfig();if(!c)throw new Error("Sandbox disabled");
 if(!Number.isInteger(amountPaise)||amountPaise<100||amountPaise>1000000)throw new Error("Sandbox invoice amount outside demo limits");
 const id=merchantOrderId(invoiceId);
 return sandboxRequest("/orders","POST",{order_id:id,order_amount:amountPaise/100,order_currency:"INR",customer_details:{customer_id:id,customer_phone:c.phone},order_meta:{return_url:c.origin+"/admin/billing/"+invoiceId,notify_url:c.origin+"/api/payments/cashfree/webhook"}},invoiceId);
}
