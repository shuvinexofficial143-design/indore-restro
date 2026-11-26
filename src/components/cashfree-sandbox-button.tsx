"use client";
import {useState} from "react";
export function CashfreeSandboxButton({id}:{id:string}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function checkout(){setBusy(true);setMessage("");try{
 const r=await fetch("/api/payments/cashfree/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({invoiceId:id})});const data=await r.json();if(!r.ok)throw new Error(data.error);
 if(data.paid){window.location.reload();return}
 if(typeof data.session!=="string")throw new Error("No checkout session");
 const sdk=await new Promise<void>((resolve,reject)=>{const script=document.createElement("script");script.src="https://sdk.cashfree.com/js/v3/cashfree.js";script.onload=()=>resolve();script.onerror=()=>reject(new Error("Sandbox SDK unavailable"));document.head.appendChild(script)});void sdk;
 const cf=(window as unknown as {Cashfree?:(options:{mode:"sandbox"})=>{checkout:(opts:{paymentSessionId:string,redirectTarget:"_self"})=>Promise<unknown>}}).Cashfree;
 if(!cf)throw new Error("Sandbox SDK unavailable");await cf({mode:"sandbox"}).checkout({paymentSessionId:data.session,redirectTarget:"_self"});
 }catch(e){setMessage(e instanceof Error?e.message:"Sandbox checkout unavailable")}finally{setBusy(false)}}
 return <div className="no-print"><button className="btn outline" disabled={busy} onClick={checkout}>{busy?"Opening sandbox…":"Test Cashfree checkout / refresh status"}</button><p role="status">{message}</p></div>
}
