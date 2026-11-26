import Link from "next/link";
import OrderHistory from "@/components/order-history";
export default function Orders(){return <main id="main" className="shell section inner"><p className="eyebrow">CUSTOMER · DEMO</p><h1>Your <em>orders.</em></h1><OrderHistory/><Link className="btn outline" href="/account">Account order history</Link></main>}
