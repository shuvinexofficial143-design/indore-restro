import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
let cached: ReturnType<typeof postgres> | undefined;
export function database(){
 const url=process.env.DATABASE_URL;
 if(!url) throw new Error("Database not configured");
 cached??=postgres(url,{max:1,prepare:false,connect_timeout:8,idle_timeout:20});
 return drizzle(cached,{schema});
}
