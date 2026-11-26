import {staffOrders} from "@/lib/ordering";
import {staffRequests} from "@/lib/tables";
import {permittedTargets} from "@/lib/domain/staff-order";
import {canTransition} from "@/lib/domain/order";
import {money} from "@/lib/catalog";
import {type Role} from "@/lib/domain/auth";
import {staffTransition,completeRequest} from "@/app/staff/order-actions";
import AutoRefresh from "@/components/auto-refresh";
import Link from "next/link";
export default async function StaffBoard({restaurantId,userId,role,area}:{restaurantId:string;userId:string;role:Role;area:"admin"|"kitchen"|"waiter"}){
 const rows=(await staffOrders(restaurantId,area==="waiter"&&role==="waiter"?userId:undefined)).filter(o=>area==="kitchen"?["accepted","preparing","ready"].includes(o.status):area==="waiter"?o.kind==="dine_in"&&["ready","served"].includes(o.status):true);
 const requests=area==="waiter"?await staffRequests(restaurantId,role==="waiter"?userId:undefined):[];
 const targets=area==="kitchen"?["preparing","ready"]:area==="waiter"?["served"]:permittedTargets(role);
 return <main id="main" className="shell section inner"><Link href={area==="admin"?"/admin":"/staff"} className="text-link">← Dashboard</Link><p className="eyebrow">AUTHORIZED STAFF · DEMO</p><h1>{area==="admin"?"Live orders":area==="kitchen"?"Kitchen display":"Waiter station"}<em>.</em></h1>{area==="admin"&&<Link className="btn gold" href="/admin/orders/manual">New manual order</Link>}<AutoRefresh/>{area==="waiter"&&<section className="section"><h2>Customer requests</h2>{!requests.length&&<p>No pending requests.</p>}<div className="dish-grid">{requests.map(r=><article className="booking-card" key={r.id}><h3>{r.table} · {r.kind==="bill"?"Bill request":"Call waiter"}</h3><form action={completeRequest}><input type="hidden" name="id" value={r.id}/><button className="btn outline">Mark request complete</button></form></article>)}</div></section>}{!rows.length&&<p className="empty">No orders in this queue.</p>}<div className="dish-grid">{rows.map(o=><article className="booking-card" key={o.id}><h3>#{o.id.slice(0,8)} · {o.tableLabel??o.kind.replaceAll("_"," ")}</h3><p>{o.status.replaceAll("_"," ")}</p><p className="muted small">{o.createdAt.toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata"})} IST</p>{o.items.map(l=><p key={l.id}>{l.quantity} × {l.name} · {l.variant}{l.addon?" + naan":""}</p>)}<p className="muted small">{o.instructions||"No special instructions"}</p>{area==="admin"&&<strong>{money(o.totalPaise)}</strong>}<div className="actions">{permittedTargets(role).filter(s=>targets.includes(s)&&canTransition(o.status,s,o.kind)).map(s=><form key={s} action={staffTransition}><input type="hidden" name="id" value={o.id}/><input type="hidden" name="status" value={s}/><button className="btn outline">{s.replaceAll("_"," ")}</button></form>)}</div></article>)}</div></main>
}
