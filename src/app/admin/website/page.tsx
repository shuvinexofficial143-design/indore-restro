import {requireArea} from "@/lib/session";
import {contentFor} from "@/lib/site-content";
import WebsiteEditor from "@/components/website-editor";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function Website(){const s=await requireArea("admin"),c=await contentFor(s.restaurantId);return <main id="main" className="shell section inner"><p className="eyebrow">WEBSITE CONTENT</p><h1>Customize <em>the experience.</em></h1><p className="intro">Change homepage text, sample offers, hours, city and accent palette. The showcase remains fictional.</p><WebsiteEditor content={{headline:c.headline,headlineAccent:c.headlineAccent,intro:c.intro,offerTitle:c.offerTitle,offerText:c.offerText,showOffer:c.showOffer,openingHours:c.openingHours,cityLabel:c.cityLabel,accentColor:c.accentColor}}/><Link className="btn outline" href="/">Preview website</Link></main>}
