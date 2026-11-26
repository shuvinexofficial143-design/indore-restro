import {getCatalog} from "@/lib/ordering";
import MenuAssistant from "@/components/menu-assistant";
export const dynamic="force-dynamic";
export default async function Assistant(){const {items}=await getCatalog();return <main id="main" className="shell section inner"><p className="eyebrow">RESTAURANT ASSISTANT · SIMULATION</p><h1>Find your <em>next favourite.</em></h1><MenuAssistant items={items}/></main>}
