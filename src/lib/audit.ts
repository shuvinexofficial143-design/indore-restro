import {desc,eq} from "drizzle-orm";
import {database} from "@/lib/db";
import {auditLogs,users} from "@/lib/db/schema";
type Tx=Parameters<Parameters<ReturnType<typeof database>["transaction"]>[0]>[0];
export async function audit(tx:Tx,restaurantId:string,actorUserId:string,action:string,target:string,detail=""){
 await tx.insert(auditLogs).values({restaurantId,actorUserId,action,target,detail});
}
export async function auditHistory(restaurantId:string){
 return database().select({id:auditLogs.id,action:auditLogs.action,target:auditLogs.target,detail:auditLogs.detail,occurredAt:auditLogs.occurredAt,actor:users.name}).from(auditLogs).innerJoin(users,eq(users.id,auditLogs.actorUserId)).where(eq(auditLogs.restaurantId,restaurantId)).orderBy(desc(auditLogs.occurredAt)).limit(100);
}
