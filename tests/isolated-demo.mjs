import {chromium} from "playwright";
import postgres from "postgres";
import {randomBytes,createHash} from "node:crypto";
import assert from "node:assert/strict";
const origin="http://127.0.0.1:3000",db=postgres(process.env.DATABASE_URL_UNPOOLED,{max:1}),browser=await chromium.launch();
const newToken=()=>randomBytes(32).toString("hex");
try{
 async function create(){const page=await browser.newPage();await page.goto(origin+"/demo");await page.getByLabel("Private invitation code").fill(process.env.DEMO_ACCESS_CODE);await page.getByRole("button",{name:"Start isolated demo"}).click();await page.getByRole("button",{name:"Open owner",exact:true}).waitFor();return page}
 const a=await create(),b=await create();
 async function tenant(page){const cookie=(await page.context().cookies()).find(c=>c.name==="royal_demo");assert.ok(cookie?.httpOnly&&cookie.secure);const hash=createHash("sha256").update(cookie.value).digest("hex");const [s]=await db`select restaurant_id from demo_sessions where token_hash=${hash}`;assert.ok(s);return s;}
 const sa=await tenant(a),sb=await tenant(b);assert.notEqual(sa.restaurant_id,sb.restaurant_id);
 const token=newToken(),body={token,kind:"takeaway",instructions:"",lines:[{id:"paneer",variant:"full",addon:false,quantity:1}]};
 const response=await a.evaluate(async payload=>{const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});return {status:r.status,body:await r.json()}},body);assert.equal(response.status,201,JSON.stringify(response.body));
 const [o]=await db`select restaurant_id from orders where id=${response.body.id}`;assert.equal(o?.restaurant_id,sa.restaurant_id);
 const [other]=await db`select count(*)::int as n from orders where restaurant_id=${sb.restaurant_id}`;assert.equal(other.n,0);
 await a.getByRole("button",{name:"Open owner",exact:true}).click();await a.waitForURL("**/admin");await a.goto(origin+"/admin/orders");await a.getByText("takeaway",{exact:false}).first().waitFor();
 await b.getByRole("button",{name:"Open owner",exact:true}).click();await b.waitForURL("**/admin");await b.goto(origin+"/admin/orders");await b.getByText("No orders in this queue.").waitFor();
 await a.goto(origin+"/demo");await a.getByRole("button",{name:"Open kitchen",exact:true}).click();await a.waitForURL("**/kitchen");await a.goto(origin+"/admin");await a.waitForURL("**/staff");
 await a.goto(origin+"/demo");await a.getByRole("button",{name:"End and invalidate demo"}).click();await a.getByRole("button",{name:"Start isolated demo"}).waitFor();
 assert.equal((await a.request.get(origin+"/api/orders/"+token)).status(),404);
 await b.goto(origin+"/demo");await b.getByRole("button",{name:"Open owner",exact:true}).waitFor();
 console.log("PASS separate tenant catalog/orders, isolated staff roles, revoked tracking token, independent second demo");
}finally{await browser.close();await db.end()}
