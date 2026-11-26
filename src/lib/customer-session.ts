import {cookies} from "next/headers";
import {and,eq,gt,desc} from "drizzle-orm";
import {database} from "@/lib/db";
import {customers,customerSessions,customerAddresses,orders} from "@/lib/db/schema";
import {orderingRestaurant} from "@/lib/demo-context";
import {tokenHash} from "@/lib/domain/auth";
export const customerCookie="royal_customer";
export async function currentCustomer(verifiedRestaurantId?:string){const token=(await cookies()).get(customerCookie)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token)||!process.env.DATABASE_URL)return null;const r=verifiedRestaurantId?{id:verifiedRestaurantId}:await orderingRestaurant();if(!r)return null;
const [c]=await database().select({id:customers.id,restaurantId:customers.restaurantId,name:customers.name,email:customers.email}).from(customerSessions).innerJoin(customers,and(eq(customers.restaurantId,customerSessions.restaurantId),eq(customers.id,customerSessions.customerId))).where(and(eq(customerSessions.tokenHash,tokenHash(token)),eq(customerSessions.restaurantId,r.id),gt(customerSessions.expiresAt,new Date()))).limit(1);return c??null;}
export async function savedAddresses(restaurantId:string,customerId:string){return database().select({id:customerAddresses.id,label:customerAddresses.label,address:customerAddresses.address}).from(customerAddresses).where(and(eq(customerAddresses.restaurantId,restaurantId),eq(customerAddresses.customerId,customerId)))}
export async function customerOrders(restaurantId:string,customerId:string){return database().select({id:orders.id,status:orders.status,kind:orders.kind,totalPaise:orders.totalPaise,createdAt:orders.createdAt}).from(orders).where(and(eq(orders.restaurantId,restaurantId),eq(orders.customerId,customerId))).orderBy(desc(orders.createdAt)).limit(50)}
