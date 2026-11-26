export function priceOrder(subtotalPaise:number,eligiblePaise:number,discountBps:number,maxDiscountPaise:number|null,taxBps:number){
 const values=[subtotalPaise,eligiblePaise,discountBps,taxBps];if(values.some(n=>!Number.isSafeInteger(n)||n<0)||subtotalPaise>10000000||eligiblePaise>subtotalPaise||discountBps>10000||taxBps>2500||(maxDiscountPaise!==null&&(!Number.isSafeInteger(maxDiscountPaise)||maxDiscountPaise<0)))throw new Error("Invalid pricing");
 const discountPaise=Math.min(eligiblePaise,Math.round(eligiblePaise*discountBps/10000),maxDiscountPaise??subtotalPaise);
 const taxPaise=Math.round((subtotalPaise-discountPaise)*taxBps/10000);
 return {subtotalPaise,discountPaise,taxPaise,totalPaise:subtotalPaise-discountPaise+taxPaise};
}
