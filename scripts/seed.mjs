import postgres from "postgres";
import {hashPassword} from "../src/lib/domain/auth.ts";
const {DATABASE_URL_UNPOOLED,BOOTSTRAP_OWNER_EMAIL,BOOTSTRAP_OWNER_PASSWORD}=process.env;
if(!DATABASE_URL_UNPOOLED||!BOOTSTRAP_OWNER_EMAIL||!BOOTSTRAP_OWNER_PASSWORD)throw new Error("Set database and private bootstrap credentials in local environment");
const email=BOOTSTRAP_OWNER_EMAIL.trim().toLowerCase();
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Invalid owner email");
const passwordHash=await hashPassword(BOOTSTRAP_OWNER_PASSWORD);
const db=postgres(DATABASE_URL_UNPOOLED,{max:1,prepare:false});
try{await db.begin(async tx=>{
 const [restaurant]=await tx`insert into restaurants(slug,name,demo) values('royal-table','The Royal Table',true) on conflict(slug) do nothing returning id`;
 if(!restaurant)throw new Error("Restaurant already seeded; refusing to overwrite");
 await tx`insert into restaurant_settings(restaurant_id) values(${restaurant.id})`;
 const [user]=await tx`insert into users(email,name,password_hash) values(${email},'Restaurant Owner',${passwordHash}) returning id`;
 await tx`insert into staff(restaurant_id,user_id,role) values(${restaurant.id},${user.id},'owner')`;
 console.log("Demo restaurant and private owner created.");
})}finally{await db.end()}
