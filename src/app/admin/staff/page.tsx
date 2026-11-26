import {requireArea} from "@/lib/session";
import {database} from "@/lib/db";
import {staff,users} from "@/lib/db/schema";
import {eq} from "drizzle-orm";
import StaffEditor from "@/components/staff-editor";
import {toggleStaff} from "./actions";
export const dynamic="force-dynamic";
export default async function Staff(){const s=await requireArea("admin");const rows=await database().select({id:users.id,name:users.name,email:users.email,role:staff.role,active:staff.active}).from(staff).innerJoin(users,eq(staff.userId,users.id)).where(eq(staff.restaurantId,s.restaurantId));return <main id="main" className="shell section inner"><p className="eyebrow">TEAM ACCESS</p><h1>Manage <em>staff.</em></h1>{s.role==="owner"?<StaffEditor/>:<p>Only the owner may change staff access.</p>}<div className="dish-grid">{rows.map(u=><article key={u.id} className="booking-card"><h3>{u.name}</h3><p>{u.email} · {u.role}</p><p>{u.active?"Active":"Disabled"}</p>{s.role==="owner"&&u.role!=="owner"&&<form action={toggleStaff}><input type="hidden" name="id" value={u.id}/><input type="hidden" name="active" value={String(!u.active)}/><button className="btn outline">{u.active?"Disable":"Enable"} access</button></form>}</article>)}</div></main>}
