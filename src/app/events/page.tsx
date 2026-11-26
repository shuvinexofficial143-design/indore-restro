import {orderingRestaurant} from "@/lib/demo-context";
import type { Metadata } from "next";
import DemoBookingRequest from "@/components/demo-booking-request";
export const dynamic="force-dynamic";
import BookingPreview from "@/components/booking-preview";
import {Photo} from "@/components/site";
import {photos} from "@/lib/demo-menu";
export const metadata:Metadata={title:"Private Dining"};
export default async function Events(){const enabled=Boolean(await orderingRestaurant());return <main id="main" className="shell section inner booking-layout"><div><p className="eyebrow">PRIVATE DINING · DEMO</p><h1>Celebrate <em>together.</em></h1><p className="intro">Birthdays, anniversaries, family gatherings and corporate occasions. Explore a sample event enquiry.</p>{enabled?<DemoBookingRequest event/>:<BookingPreview event/>}</div><div className="booking-image"><Photo src={photos.interior} alt="Illustrative private dining space" sizes="(max-width: 750px) 100vw, 40vw"/></div></main>}
