import {notFound} from "next/navigation";
import {getTable} from "@/lib/tables";
import {getCatalog} from "@/lib/ordering";
import CustomerApp from "@/components/customer-app";
import TableRequests from "@/components/table-requests";
export const dynamic="force-dynamic";
export default async function Table({params}:{params:Promise<{token:string}>}){const {token}=await params;const table=await getTable(token);if(!table)notFound();const catalog=await getCatalog(table.restaurantId);return <main id="main" className="shell section customer-shell"><div className="booking-card"><h2>{table.label}</h2><p className="muted">Active dine-in demo session. Additional orders are linked to this table.</p><TableRequests token={token}/></div><CustomerApp items={catalog.items} enabled={catalog.enabled} tableToken={token}/></main>}
