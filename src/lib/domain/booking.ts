export const bookingStatuses=["requested","confirmed","rejected","cancelled","checked_in","completed","no_show"] as const;
export type BookingStatus=typeof bookingStatuses[number];
export function allowedBookingTransition(from:BookingStatus,to:BookingStatus,startsAt:Date,event:boolean,now=new Date()){
 const delta=now.getTime()-startsAt.getTime();
 if(from==="requested")return to==="rejected"||to==="cancelled"||(event&&to==="confirmed"&&delta<0);
 if(from==="confirmed")return to==="cancelled"||(to==="checked_in"&&delta>=-30*60000)||(to==="no_show"&&delta>=15*60000);
 if(from==="checked_in")return to==="completed";
 return false;
}
