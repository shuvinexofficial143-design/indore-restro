import {getCatalog} from "@/lib/ordering";
import {currentCustomer,savedAddresses} from "@/lib/customer-session";
import CustomerApp from "@/components/customer-app";
export const dynamic="force-dynamic";
export default async function Page(){const {items,enabled}=await getCatalog(),c=await currentCustomer(),addresses=c?await savedAddresses(c.restaurantId,c.id):[];return <main id="main" className="shell section customer-shell"><CustomerApp items={items} enabled={enabled} addresses={addresses} customerName={c?.name}/></main>}
