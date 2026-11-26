import type { Metadata } from "next";
import MenuExplorer from "@/components/menu-explorer";
export const metadata: Metadata={title:"Sample Menu"};
export default function Menu(){return <main id="main" className="shell section inner"><p className="eyebrow">THE ROYAL TABLE · SAMPLE MENU</p><h1>Made to <em>savour.</em></h1><p className="intro">Browse our concept dishes and illustrative prices. Online ordering will be connected in a later phase.</p><MenuExplorer/></main>}
