import type {Metadata} from "next";
import Link from "next/link";
import MenuExplorer from "@/components/menu-explorer";
import {getCatalog} from "@/lib/ordering";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Sample Menu"};
export default async function Menu(){const catalog=await getCatalog();const dishes=catalog.enabled?catalog.items.map(d=>({id:d.id,name:d.name,category:d.category,price:d.pricePaise/100,veg:d.veg,description:d.description,image:d.image??undefined,available:d.available})):undefined;return <main id="main" className="shell section inner"><p className="eyebrow">THE ROYAL TABLE · SAMPLE MENU</p><h1>Made to <em>savour.</em></h1><p className="intro">Browse our concept dishes and illustrative prices. {catalog.enabled?"This menu reflects the current demo restaurant catalog.":"Ordering is disabled in this preview."}</p><Link className="btn outline" href="/app">Open order app</Link><MenuExplorer dishes={dishes}/></main>}
