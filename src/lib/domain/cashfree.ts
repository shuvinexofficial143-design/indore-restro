import {createHmac,timingSafeEqual} from "node:crypto";
export const SANDBOX_API="https://sandbox.cashfree.com/pg";
export function merchantOrderId(invoiceId:string){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invoiceId))throw new Error("Invalid invoice ID");
 return "rt_"+invoiceId.toLowerCase();
}
export function rupeesToPaise(value:unknown){
 if(typeof value!=="number"||!Number.isFinite(value)||value<0||value>21474836.47)return null;
 const n=Math.round(value*100);return Math.abs(n-value*100)<0.00001?n:null;
}
export function verifyPaidOrder(value:unknown,id:string,amountPaise:number){
 if(!value||typeof value!=="object")return false;
 const v=value as Record<string,unknown>;
 return v.order_id===id&&v.order_currency==="INR"&&v.order_status==="PAID"&&rupeesToPaise(v.order_amount)===amountPaise;
}
export function verifyWebhook(raw:string,timestamp:string|null,signature:string|null,secret:string){
 if(!timestamp||!signature||!secret||!/^\d{10,16}$/.test(timestamp)||!/^[A-Za-z0-9+/]{43}=$/.test(signature))return false;
 const expected=createHmac("sha256",secret).update(timestamp+raw).digest();
 const actual=Buffer.from(signature,"base64");
 return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
