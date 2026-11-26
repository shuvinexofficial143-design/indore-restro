export type Period="today"|"week"|"month"|"custom";
const offset=19800000,day=86400000;
function dateStart(value:string|undefined){if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const d=new Date(value+"T00:00:00+05:30");return Number.isFinite(d.getTime())&&new Date(d.getTime()+offset).toISOString().slice(0,10)===value?d:null;}
export function reportRange(period:Period,now=new Date(),custom?:{from?:string;to?:string}){
 if(period==="custom"){const start=dateStart(custom?.from),last=dateStart(custom?.to);if(!start||!last||last<start||last.getTime()-start.getTime()>365*day)throw new Error("Choose valid dates up to 366 days");return {start,end:new Date(last.getTime()+day)}}
 const local=new Date(now.getTime()+offset);local.setUTCHours(0,0,0,0);const end=new Date(local.getTime()-offset+day);if(period==="week")local.setUTCDate(local.getUTCDate()-6);if(period==="month")local.setUTCDate(1);return {start:new Date(local.getTime()-offset),end};
}
