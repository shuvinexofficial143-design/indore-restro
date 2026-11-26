import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Crown, Clock3, MapPin, UtensilsCrossed } from "lucide-react";
import type {defaultContent} from "@/lib/site-content";
import type { Dish } from "@/lib/demo-menu";

export function Brand() {
  return <Link className="brand" href="/" aria-label="The Royal Table home"><span className="brand-icon"><Crown size={23} strokeWidth={1.3}/></span><span>THE ROYAL TABLE<small>INDORE · EST. CONCEPT</small></span></Link>;
}
export function Header() {
  return <><div className="demo-strip">SHUVI 360 SHOWCASE <span>· Fictional restaurant · Sample menu &amp; prices</span></div><header className="site-header"><div className="nav-wrap"><Brand/><nav aria-label="Main navigation"><Link href="/menu">Menu</Link><Link href="/app">Order app</Link><Link href="/#experience">Experience</Link><Link href="/events">Events</Link></nav><Link className="btn gold nav-cta" href="/reserve">Reserve <ArrowUpRight size={16}/></Link></div></header><nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/">Home</Link><Link href="/menu">Menu</Link><Link href="/app">Order</Link><Link href="/events">Events</Link><Link href="/reserve">Book</Link></nav></>;
}
export function Photo({src,alt,priority=false,sizes="(max-width: 700px) 100vw, 35vw"}:{src:string;alt:string;priority?:boolean;sizes?:string}) {
  return <Image src={src} alt={alt} fill sizes={sizes} preload={priority} className="photo"/>;
}
export function DishCard({dish}:{dish:Dish}) {
  return <article className="dish-card">{ "image" in dish ? <div className="dish-image"><Photo src={dish.image} alt={dish.name}/><span className="image-label">{dish.category}</span></div> : <div className="dish-symbol"><UtensilsCrossed size={27} strokeWidth={1.3}/><span>{dish.category}</span></div>}<div className="dish-body"><div className="dish-title"><h3>{dish.name}</h3><span>₹{dish.price}</span></div><p>{dish.description}</p><span className="diet"><i className={dish.veg?"veg":"nonveg"}/>{dish.veg?"Vegetarian":"Non-vegetarian"}</span></div></article>;
}
export function Footer({content}:{content:typeof defaultContent}){
 return <footer id="contact" className="site-footer"><div className="shell footer-grid"><div><Brand/><p>Indian flavours, thoughtful hospitality and memorable moments. A fictional restaurant concept created by Shuvi 360.</p></div><div><h3>Explore</h3><Link href="/menu">Sample menu</Link><Link href="/reserve">Reservation preview</Link><Link href="/events">Private events</Link><Link href="/demo">Explore demo</Link><Link href="/assistant">Menu assistant</Link></div><div><h3>Visit concept</h3><p><MapPin size={16}/> {content.cityLabel}</p><p><Clock3 size={16}/> Sample hours: {content.openingHours}</p><p>Phone, WhatsApp, Instagram and exact location will be configured by the restaurant owner.</p></div></div><div className="shell footer-bottom"><span>© 2026 The Royal Table · Demo only</span><Link href="/credits">Photography credits</Link><span>Designed by Shuvi 360</span></div></footer>
}
