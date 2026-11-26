import {requireArea} from "@/lib/session";
import {staffOrders} from "@/lib/ordering";
import {canTransition,orderStatuses} from "@/lib/domain/order";
import {money} from "@/lib/catalog";
import {updateOrder} from "./actions";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function Orders(){const session=await requireArea("admin");const rows=await staffOrders(session.restaurantId);return <main id="main" className="shell section inner"><Link className="text-link" href="/admin">← Dashboard</Link><p className="eyebrow">STAFF ONLY · {session.restaurantName}</p><h1>Live <em>orders.</em></h1><p className="intro">Latest 100 orders. Refresh to see new activity. Sample orders only.</p>{!rows.length&&<p className="empty">No orders yet.</p>}<div className="dish-grid">{rows.map(o=><article className="booking-card" key={o.id}><h3>#{o.id.slice(0,8)} · {money(o.totalPaise)}</h3><p>{o.kind.replaceAll("_"," ")} · {o.status.replaceAll("_"," ")}</p><p className="muted small">{o.instructions||"No special instructions"}</p><div className="actions">{orderStatuses.filter(s=>canTransition(o.status,s,o.kind)).map(s=><form key={s} action={updateOrder}><input type="hidden" name="id" value={o.id}/><input type="hidden" name="status" value={s}/><button className="btn outline">{s.replaceAll("_"," ")}</button></form>)}</div></article>)}</div></main>}
