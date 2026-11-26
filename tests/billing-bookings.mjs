import {chromium} from "playwright";
import postgres from "postgres";
import {randomBytes} from "node:crypto";
import assert from "node:assert/strict";
const origin="http://127.0.0.1:3000",db=postgres(process.env.DATABASE_URL_UNPOOLED,{max:1}),browser=await chromium.launch();
try{
 const [r]=await db`select id from restaurants where slug='royal-table'`;
 const [table]=await db`select id from restaurant_tables where restaurant_id=${r.id} and label='Test Table 01'`;
 const page=await browser.newPage();await page.goto(origin+"/login");await page.getByLabel("Staff email").fill(process.env.BOOTSTRAP_OWNER_EMAIL);await page.getByLabel("Password",{exact:true}).fill(process.env.BOOTSTRAP_OWNER_PASSWORD);await page.getByRole("button",{name:"Sign in",exact:true}).click();await page.waitForURL("**/admin");
 await page.goto(origin+"/admin/tables");await page.getByRole("button",{name:"Close session"}).click();await page.getByRole("button",{name:"Start session & QR"}).waitFor();
 await page.goto(origin+"/admin/billing");await page.getByRole("button",{name:"Generate invoice"}).click();await page.getByRole("button",{name:"Record demo payment"}).waitFor();await page.getByRole("button",{name:"Record demo payment"}).click();await page.getByText("Demo payment recorded · cash",{exact:true}).waitFor();
 const [invoice]=await db`select id,total_paise from invoices where restaurant_id=${r.id}`;assert.equal(invoice.total_paise,28900);
 assert.equal((await page.request.post(origin+"/api/payments/cashfree/checkout",{headers:{origin},data:{invoiceId:invoice.id}})).status(),404);
 assert.equal((await page.request.post(origin+"/api/payments/cashfree/webhook",{data:{type:"PAYMENT_SUCCESS_WEBHOOK"}})).status(),404);
 const [payment]=await db`select amount_paise from payments where restaurant_id=${r.id}`;assert.equal(payment.amount_paise,28900);
 await page.getByRole("link",{name:"View receipt"}).click();await page.getByText("SAMPLE RECEIPT · NOT A TAX INVOICE").waitFor();
 const tomorrow=new Date(Date.now()+2*86400000+19800000).toISOString().slice(0,10),make=()=>({event:false,date:tomorrow,time:"18:00",guests:2,occasion:"Casual dining",token:randomBytes(32).toString("hex")});
 for(let i=0;i<2;i++){const response=await page.request.post(origin+"/api/bookings",{headers:{origin,"content-type":"application/json"},data:make()});assert.equal(response.status(),201)}
 await page.goto(origin+"/admin/reservations");const cards=page.locator("article").filter({has:page.getByRole("button",{name:"Confirm demo"})});await cards.first().locator("select").selectOption(table.id);await cards.first().getByRole("button",{name:"Confirm demo"}).click();await page.getByText("confirmed",{exact:true}).waitFor();await cards.first().locator("select").selectOption(table.id);await cards.first().getByRole("button",{name:"Confirm demo"}).click();await page.getByText("Unable to update. Check availability and table capacity.").waitFor();
 const [count]=await db`select count(*)::int as n from reservations where restaurant_id=${r.id} and status='confirmed'`;assert.equal(count.n,1);
 console.log("PASS combined invoice, demo payment, receipt and conflicting table reservation rejection");
}finally{await browser.close();await db.end()}
