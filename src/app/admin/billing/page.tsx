import {requireArea} from "@/lib/session";
import {listBilling} from "@/lib/billing";
import {money} from "@/lib/catalog";
import {InvoiceButton,PaymentButton} from "@/components/billing-controls";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function Billing(){const s=await requireArea("billing");const {rows,pending}=await listBilling(s.restaurantId);return <main id="main" className="shell section inner"><p className="eyebrow">DEMO BILLING · NO REAL PAYMENTS</p><h1>Invoices &amp; <em>payments.</em></h1><p className="intro">Completed orders only. Close completed table sessions before generating their combined invoice. Tax and discounts not yet configured.</p><h2>Unbilled orders</h2><div className="dish-grid">{pending.map(o=><article key={o.id} className="booking-card"><h3>#{o.id.slice(0,8)}</h3><p>{money(o.totalPaise)} · {o.kind}</p><InvoiceButton id={o.id}/></article>)}</div>{!pending.length&&<p>No unbilled completed orders.</p>}<h2>Invoices</h2><div className="dish-grid">{rows.map(i=><article className="booking-card" key={i.id}><h3>{money(i.totalPaise)}</h3><p>{i.method?"Demo payment recorded · "+i.method:"Unpaid demo invoice"}</p><Link className="text-link" href={"/admin/billing/"+i.id}>View receipt</Link>{!i.method&&<PaymentButton id={i.id}/>}</article>)}</div></main>}
