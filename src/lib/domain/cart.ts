import type {CatalogItem} from "../catalog";
export type CartLine={id:string;variant:"full"|"half";addon:boolean;quantity:number};
export function unitPrice(item:CatalogItem,variant:CartLine["variant"],addon:boolean){
 const base=variant==="half"?item.halfPaise:item.pricePaise;
 if(base===null||(addon&&item.addonPaise===null))throw new Error("Invalid option");
 return base+(addon?(item.addonPaise??0):0);
}
export function cartTotal(lines:CartLine[],items:CatalogItem[]){
 return lines.reduce((total,line)=>{const item=items.find(i=>i.id===line.id);if(!item||!item.available||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>20)throw new Error("Invalid cart");return total+unitPrice(item,line.variant,line.addon)*line.quantity;},0);
}
