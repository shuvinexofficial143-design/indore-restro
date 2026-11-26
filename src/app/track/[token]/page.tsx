import Tracker from "@/components/order-tracker";
import {notFound} from "next/navigation";
export const dynamic="force-dynamic";
export default async function Track({params}:{params:Promise<{token:string}>}){const {token}=await params;if(!/^[a-f0-9]{64}$/.test(token))notFound();return <main id="main" className="shell section inner"><Tracker token={token}/></main>}
