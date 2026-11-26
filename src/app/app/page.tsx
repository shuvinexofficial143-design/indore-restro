import {getCatalog} from "@/lib/ordering";
import CustomerApp from "@/components/customer-app";
export const dynamic="force-dynamic";
export default async function App(){let catalog;try{catalog=await getCatalog()}catch{catalog={items:[],enabled:false}}return <main id="main" className="shell section customer-shell"><CustomerApp items={catalog.items} enabled={catalog.enabled}/></main>}
