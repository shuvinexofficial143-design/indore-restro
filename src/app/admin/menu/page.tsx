import {requireArea} from "@/lib/session";
import {database} from "@/lib/db";
import {menuItems} from "@/lib/db/schema";
import {eq} from "drizzle-orm";
import MenuBulk from "@/components/menu-bulk";
import MenuEditor from "@/components/menu-editor";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function MenuAdmin(){const s=await requireArea("admin");const rows=await database().select().from(menuItems).where(eq(menuItems.restaurantId,s.restaurantId)).orderBy(menuItems.category,menuItems.sortOrder,menuItems.name);return <main id="main" className="shell section inner"><Link className="text-link" href="/admin">← Dashboard</Link><p className="eyebrow">MENU MANAGEMENT</p><h1>Menu <em>studio.</em></h1><p className="intro">{rows.length} dishes. Prices and availability are applied to new orders; historical snapshots remain unchanged.</p><details className="booking-card"><summary>Add a new dish</summary><MenuEditor/></details><MenuBulk items={rows}/><div className="dish-grid">{rows.map(d=><details key={d.id} className="booking-card"><summary>{d.name} · {d.available?"Available":"Sold out"}{d.special?" · Special":""}</summary><MenuEditor item={d}/></details>)}</div></main>}
