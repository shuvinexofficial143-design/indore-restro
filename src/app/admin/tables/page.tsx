import Link from "next/link";
import {requireArea} from "@/lib/session";
import {listTables} from "@/lib/tables";
import {addTable} from "./actions";
import {TableOpen,TableClose} from "@/components/table-controls";
export const dynamic="force-dynamic";
export default async function Tables(){const s=await requireArea("admin");const {tables,sessions,waiters}=await listTables(s.restaurantId);return <main id="main" className="shell section inner"><Link href="/admin" className="text-link">← Dashboard</Link><p className="eyebrow">TABLE MANAGEMENT</p><h1>Tables &amp; <em>QR.</em></h1><form action={addTable} className="booking-card booking-form"><label>Table label<input name="label" required maxLength={40} placeholder="Table 01"/></label><label>Capacity<input name="capacity" type="number" min={1} max={30} required defaultValue={4}/></label><button className="btn gold form-submit">Add table</button></form><div className="dish-grid">{tables.map(t=>{const session=sessions.find(s=>s.tableId===t.id);return <article className="booking-card" key={t.id}><h3>{t.label}</h3><p>{t.capacity} seats · {session?"Session open":"Available"}</p>{session?<><p className="muted small">Ends {session.expiresAt.toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</p><TableClose id={session.id}/></>:null}<TableOpen id={t.id} waiters={waiters} open={!!session}/></article>})}</div></main>}
