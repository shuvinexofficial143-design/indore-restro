import {chromium} from "playwright";
import postgres from "postgres";
import {randomBytes} from "node:crypto";
import assert from "node:assert/strict";
import {hashPassword,tokenHash} from "../src/lib/domain/auth.ts";
const origin="http://127.0.0.1:3000",db=postgres(process.env.DATABASE_URL_UNPOOLED,{max:1}),browser=await chromium.launch();
const token=()=>randomBytes(32).toString("hex");
try{
 const [r]=await db`select id from restaurants where slug='royal-table'`;
 const [waiter]=await db`select id from users where email='waiter@example.invalid'`;
 await db`update staff set active=true where restaurant_id=${r.id} and user_id=${waiter.id}`;
 const [kitchen]=await db`insert into users(email,name,password_hash) values('kitchen@example.invalid','Test Kitchen',${await hashPassword(process.env.BOOTSTRAP_OWNER_PASSWORD)}) returning id`;
 await db`insert into staff(restaurant_id,user_id,role) values(${r.id},${kitchen.id},'kitchen')`;
 const [table]=await db`insert into restaurant_tables(restaurant_id,label,capacity) values(${r.id},'Test Table 01',4) returning id`;
 const tableToken=token();
 const [session]=await db`insert into table_sessions(restaurant_id,table_id,token_hash,waiter_user_id,expires_at) values(${r.id},${table.id},${tokenHash(tableToken)},${waiter.id},now()+interval '1 hour') returning id`;
 const guest=await browser.newPage({viewport:{width:390,height:844}});
 await guest.goto(origin+"/table/"+tableToken);
 await guest.getByRole("heading",{name:"Test Table 01"}).waitFor();
 await guest.getByLabel("Search food").fill("Paneer Butter Masala");
 await guest.getByRole("button",{name:"Add",exact:true}).click();
 await guest.getByRole("button",{name:"View cart"}).click();
 await guest.getByRole("button",{name:"Continue to checkout"}).click();
 const submission=guest.waitForResponse(r=>r.url().endsWith("/api/orders")&&r.request().method()==="POST");
 await guest.getByRole("button",{name:"Place demo order"}).click();
 const response=await submission;assert.equal(response.status(),201,await response.text());
 await guest.waitForURL("**/track/**");
 await guest.getByRole("heading",{name:"pending",exact:true}).waitFor();
 const tracking=guest.url().split("/").pop();
 const [order]=await db`select id,total_paise,table_session_id from orders where tracking_hash=${tokenHash(tracking)}`;
 assert.equal(order.total_paise,28900);assert.equal(order.table_session_id,session.id);
 const body={token:tracking,kind:"dine_in",tableToken,instructions:"",lines:[{id:"paneer",variant:"full",addon:false,quantity:1}]};
 async function post(path,body){return guest.request.post(origin+path,{headers:{origin,"content-type":"application/json"},data:body})}
 assert.equal((await post("/api/orders",body)).status(),200);
 assert.equal((await post("/api/orders",{...body,lines:[{...body.lines[0],quantity:2}]})).status(),409);
 await db`update menu_items set available=false where restaurant_id=${r.id} and id='paneer'`;
 assert.equal((await post("/api/orders",{...body,token:token()})).status(),409);
 await db`update menu_items set available=true where restaurant_id=${r.id} and id='paneer'`;
 assert.equal((await post("/api/orders",{...body,token:token(),tableToken:token()})).status(),409);
 assert.equal((await post("/api/table-requests",{token:tableToken,kind:"waiter"})).status(),200);
 assert.equal((await post("/api/table-requests",{token:tableToken,kind:"waiter"})).status(),200);
 const [requests]=await db`select count(*)::int as n from waiter_requests where session_id=${session.id}`;assert.equal(requests.n,1);
 async function staff(email){const p=await browser.newPage();await p.goto(origin+"/login");await p.getByLabel("Staff email").fill(email);await p.getByLabel("Password",{exact:true}).fill(process.env.BOOTSTRAP_OWNER_PASSWORD);await p.getByRole("button",{name:"Sign in",exact:true}).click();await p.waitForURL(/\/(admin|staff)$/);return p}
 const owner=await staff(process.env.BOOTSTRAP_OWNER_EMAIL);await owner.goto(origin+"/admin/orders");await owner.getByRole("button",{name:"accepted",exact:true}).click();
 const k=await staff("kitchen@example.invalid");await k.goto(origin+"/kitchen");await k.getByRole("button",{name:"preparing",exact:true}).click();await k.getByRole("button",{name:"ready",exact:true}).click();
 const w=await staff("waiter@example.invalid");await w.goto(origin+"/waiter");await w.getByRole("button",{name:"Mark request complete"}).click();await w.getByRole("button",{name:"served",exact:true}).click();
 await guest.getByRole("heading",{name:"served",exact:true}).waitFor({timeout:15000});
 await owner.reload();await owner.getByRole("button",{name:"completed",exact:true}).click();
 await owner.getByRole("button",{name:"completed",exact:true}).waitFor({state:"hidden"});
 const [final]=await db`select status from orders where id=${order.id}`;assert.equal(final.status,"completed");
 console.log("PASS QR table customer cart, server price, idempotency, out-of-stock, invalid table, duplicate waiter request, owner→kitchen→waiter→tracking");
}finally{await browser.close();await db.end()}

