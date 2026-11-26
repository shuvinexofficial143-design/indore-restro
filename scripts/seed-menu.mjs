import postgres from "postgres";
import {sampleCatalog} from "../src/lib/catalog.ts";
if(!process.env.DATABASE_URL_UNPOOLED)throw new Error("DATABASE_URL_UNPOOLED required");
const db=postgres(process.env.DATABASE_URL_UNPOOLED,{max:1,prepare:false});
try{await db.begin(async tx=>{
 const [r]=await tx`select id from restaurants where slug='royal-table' and demo=true`;
 if(!r)throw new Error("Seed demo restaurant first");
 for(const d of sampleCatalog)await tx`insert into menu_items(restaurant_id,id,name,category,description,image,veg,available,price_paise,half_paise,addon_paise,prep_minutes) values(${r.id},${d.id},${d.name},${d.category},${d.description},${d.image},${d.veg},${d.available},${d.pricePaise},${d.halfPaise},${d.addonPaise},${d.prepMinutes}) on conflict(restaurant_id,id) do nothing`;
 console.log("Sample catalog seeded without overwriting existing menu.");
})}finally{await db.end()}
