"use client";
import {useActionState} from "react";
import {createInvoice,recordPayment} from "@/app/admin/billing/actions";
export function InvoiceButton({id}:{id:string}){const [message,action,pending]=useActionState(createInvoice,"");return <form action={action}><input type="hidden" name="id" value={id}/><button className="btn outline" disabled={pending}>Generate invoice</button><p role="status">{message}</p></form>}
export function PaymentButton({id}:{id:string}){const [message,action,pending]=useActionState(recordPayment,"");return <form action={action} className="booking-form"><input type="hidden" name="id" value={id}/><label>Demo method<select name="method"><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option></select></label><button className="btn outline" disabled={pending}>Record demo payment</button><p role="status" className="form-submit">{message}</p></form>}
export function PrintButton(){return <button className="btn gold no-print" onClick={()=>window.print()}>Print / Save as PDF</button>}
