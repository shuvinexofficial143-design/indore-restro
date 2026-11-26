import {chromium} from "playwright";
import postgres from "postgres";
import assert from "node:assert/strict";
import {hashPassword} from "../src/lib/domain/auth.ts";
const db=postgres(process.env.DATABASE_URL_UNPOOLED,{max:1});
const browser=await chromium.launch();
const origin="http://127.0.0.1:3000";
try{
 const [restaurant]=await db`select id from restaurants where slug='royal-table'`;
 assert.ok(restaurant.id);
 const [migration]=await db`select count(*)::int as n from schema_migrations`;
 assert.equal(migration.n,11);
 const password=process.env.BOOTSTRAP_OWNER_PASSWORD;
 const [staffUser]=await db`insert into users(email,name,password_hash) values('waiter@example.invalid','Test Waiter',${await hashPassword(password)}) returning id`;
 await db`insert into staff(restaurant_id,user_id,role) values(${restaurant.id},${staffUser.id},'waiter')`;
 const page=await browser.newPage();
 await page.goto(origin+"/admin");await page.waitForURL("**/login");
 async function login(email,pw){await page.getByLabel("Staff email").fill(email);await page.getByLabel("Password",{exact:true}).fill(pw);await page.getByRole("button",{name:"Sign in",exact:true}).click()}
 await login(process.env.BOOTSTRAP_OWNER_EMAIL,"wrong");await page.locator("form [role=alert]").waitFor();assert.equal(await page.locator("form [role=alert]").textContent(),"Invalid email or password.");
 await login(process.env.BOOTSTRAP_OWNER_EMAIL,password);await page.waitForURL("**/admin");await page.getByRole("heading",{name:"The Royal Table"}).waitFor();
 const cookie=(await page.context().cookies()).find(c=>c.name==="royal_session");assert.ok(cookie?.httpOnly&&cookie.secure);assert.equal(cookie.sameSite,"Lax");
 const [count]=await db`select count(*)::int as n from sessions`;assert.equal(count.n,1);
 await page.getByRole("button",{name:"Sign out"}).click();await page.waitForURL("**/login");
 const [after]=await db`select count(*)::int as n from sessions`;assert.equal(after.n,0);
 await login("waiter@example.invalid",password);await page.waitForURL("**/staff");
 await page.goto(origin+"/admin");await page.waitForURL("**/staff");
 await db`update staff set active=false where user_id=${staffUser.id}`;
 await page.goto(origin+"/staff");await page.waitForURL("**/login");
 console.log("PASS migration repeat safety, invalid login, owner login, cookie flags, logout, waiter role denial and disabled staff");
}finally{await browser.close();await db.end()}
