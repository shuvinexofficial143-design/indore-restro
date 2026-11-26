import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true});
try {
 for(const width of [375,390,430,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  for(const path of ["/","/menu","/reserve","/events","/credits"]){
   const result=await page.goto("http://127.0.0.1:3000"+path,{waitUntil:"domcontentloaded"});
   assert.equal(result.status(),200,path);
   await page.locator("h1").waitFor();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),width+"px overflow on "+path);
  }
  await page.goto("http://127.0.0.1:3000/menu");
  await page.getByRole("textbox",{name:"Search dishes"}).fill("Paneer Butter Masala");
  await page.getByRole("status").getByText("1 sample dishes").waitFor();
  await page.getByRole("textbox",{name:"Search dishes"}).fill("");
  await page.getByRole("checkbox",{name:"Vegetarian only"}).check();
  await page.getByRole("status").getByText("8 sample dishes").waitFor();
  assert.equal(await page.getByRole("heading",{name:"Chicken Tikka Masala"}).count(),0);
  await page.getByRole("button",{name:"Desserts",exact:true}).click();
  await page.getByRole("status").getByText("2 sample dishes").waitFor();
  await page.goto("http://127.0.0.1:3000/reserve");
  await page.getByLabel("Date",{exact:true}).fill("2099-01-01");
  await page.getByLabel("Time",{exact:true}).selectOption("18:00");
  await page.getByRole("button",{name:"Preview reservation"}).click();
  await page.getByRole("heading",{name:"Preview details — not booked"}).waitFor();
  await page.getByRole("button",{name:"Clear preview"}).click();
  assert.equal(await page.getByRole("heading",{name:"Preview details — not booked"}).count(),0);
  assert.deepEqual(errors,[],width+"px browser errors");
  await page.close();
  console.log("PASS viewport "+width+": routes, overflow, menu filtering and reservation preview");
 }
}finally{await browser.close();}
