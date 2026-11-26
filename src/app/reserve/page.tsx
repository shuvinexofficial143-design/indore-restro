import type { Metadata } from "next";
import BookingPreview from "@/components/booking-preview";
import {Photo} from "@/components/site";
import {photos} from "@/lib/demo-menu";
export const metadata:Metadata={title:"Reservation Preview"};
export default function Reserve(){return <main id="main" className="shell section inner booking-layout"><div><p className="eyebrow">RESERVATIONS · DEMO</p><h1>A table <em>for you.</em></h1><p className="intro">Plan an evening with your favourite people. Explore the booking experience below.</p><BookingPreview/></div><div className="booking-image"><Photo src={photos.interior} alt="Illustrative restaurant dining room" sizes="(max-width: 750px) 100vw, 40vw"/></div></main>}
