import {requireArea} from "@/lib/session";
import {invoiceDetails} from "@/lib/billing";
import {money} from "@/lib/catalog";
import {notFound} from "next/navigation";
import {PrintButton} from "@/components/billing-controls";
export const dynamic="force-dynamic";
export default async function Receipt({params}:{params:Promise<{id:string}>}){const s=await requireArea("billing");const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))notFound();const i=await invoiceDetails(s.restaurantId,id);if(!i)notFound();return <main id="main" className="shell section inner receipt"><div className="booking-card"><p className="eyebrow">SAMPLE RECEIPT · NOT A TAX INVOICE</p><h1>{s.restaurantName}</h1><p>Invoice #{i.id.slice(0,8)} · {i.createdAt.toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</p>{i.items.map(l=><div key={l.id} className="cart-line"><span>{l.quantity} × {l.name} ({l.variant}{l.addon?" + naan":""})</span><strong>{money(l.quantity*l.unitPaise)}</strong></div>)}<p>Subtotal: {money(i.subtotalPaise)}</p><p>Discount: −{money(i.discountPaise)}</p><p>Fictional tax: {money(i.taxPaise)}</p><div className="cart-total"><span>Total</span><strong>{money(i.totalPaise)}</strong></div><p>{i.method?"Demo payment recorded: "+i.method:"Unpaid demo receipt"}</p><p>No real money collected. Fictional tax is a demonstration calculation only; not a GST invoice.</p><PrintButton/></div></main>}
