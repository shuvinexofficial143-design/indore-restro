import postgres from "postgres";
import {randomBytes} from "node:crypto";
import assert from "node:assert/strict";
const db=postgres(process.env.DATABASE_URL_UNPOOLED,{max:1}),origin="http://127.0.0.1:3000";
try{const [r]=await db`select id from restaurants where slug='royal-table'`;
 await db`update restaurant_settings set demo_tax_bps=500 where restaurant_id=${r.id}`;
 await db`insert into coupons(restaurant_id,code,percent_bps,minimum_paise,maximum_discount_paise,maximum_uses,eligible_menu_id,expires_at) values(${r.id},'DEMO10',1000,10000,2000,1,'paneer',now()+interval '1 day')`;
 const body={token:randomBytes(32).toString("hex"),kind:"takeaway",couponCode:"DEMO10",lines:[{id:"paneer",variant:"full",addon:false,quantity:1}]};
 async function submit(data){return fetch(origin+"/api/orders",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify(data)})}
 const response=await submit(body),result=await response.json();assert.equal(response.status,201,JSON.stringify(result));
 const [o]=await db`select subtotal_paise,discount_paise,tax_paise,total_paise from orders where id=${result.id}`;assert.deepEqual({...o},{subtotal_paise:28900,discount_paise:2000,tax_paise:1345,total_paise:28245});
 assert.equal((await submit(body)).status,200);assert.equal((await submit({...body,token:randomBytes(32).toString("hex")})).status,409);
 const [u]=await db`select count(*)::int as n from coupon_usages where restaurant_id=${r.id} and code='DEMO10'`;assert.equal(u.n,1);
 await db`update restaurant_settings set demo_tax_bps=0 where restaurant_id=${r.id}`;
 console.log("PASS server coupon limits, capped discount, tax snapshot and idempotency");
}finally{await db.end()}
