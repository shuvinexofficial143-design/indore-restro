import {and,eq} from "drizzle-orm";
import {database} from "@/lib/db";
import {activeDemo} from "@/lib/demo-context";
import {restaurants,websiteContent} from "@/lib/db/schema";
export const defaultContent={headline:"Good food.",headlineAccent:"Grand moments.",intro:"Rediscover the warmth of Indian hospitality, rich regional flavours and beautifully considered dining.",offerTitle:"A little more to celebrate.",offerText:"Concept weekday dining offer: 10% off food for a table of four. This illustrates an editable restaurant promotion.",showOffer:true,openingHours:"12 PM – 11 PM",cityLabel:"Indore, Madhya Pradesh (demo)",accentColor:"#d5b578"};
export async function contentFor(restaurantId:string){const [row]=await database().select().from(websiteContent).where(eq(websiteContent.restaurantId,restaurantId));return row??defaultContent}
export async function publicContent(){if(!process.env.DATABASE_URL)return defaultContent;try{const d=await activeDemo();if(d)return await contentFor(d.restaurantId);const db=database(),[r]=await db.select({id:restaurants.id}).from(restaurants).where(and(eq(restaurants.slug,"royal-table"),eq(restaurants.demo,true)));return r?await contentFor(r.id):defaultContent}catch{return defaultContent}}
