import type {Role} from "./auth";
import type {OrderStatus} from "./order";
export function permittedTargets(role:Role):OrderStatus[]{if(role==="owner"||role==="manager")return ["accepted","preparing","ready","served","out_for_delivery","completed","cancelled"];if(role==="kitchen")return ["preparing","ready"];if(role==="waiter")return ["served"];return []}
