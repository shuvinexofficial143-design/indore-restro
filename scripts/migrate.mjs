import postgres from "postgres";
import {readFile,readdir} from "node:fs/promises";
import {createHash} from "node:crypto";
const url=process.env.DATABASE_URL_UNPOOLED;
if(!url)throw new Error("DATABASE_URL_UNPOOLED required");
const db=postgres(url,{max:1,prepare:false});
try{await db.begin(async tx=>{
 await tx`select pg_advisory_xact_lock(721034)`;
 await tx`create table if not exists schema_migrations (name text primary key, checksum text not null, applied_at timestamptz not null default now())`;
 for(const name of (await readdir(new URL("../migrations/",import.meta.url))).filter(n=>/^\d+_.*\.sql$/.test(n)).sort()){
  const content=await readFile(new URL("../migrations/"+name,import.meta.url),"utf8"),checksum=createHash("sha256").update(content).digest("hex");
  const [existing]=await tx`select checksum from schema_migrations where name=${name}`;
  if(existing){if(existing.checksum!==checksum)throw new Error("Migration checksum mismatch: "+name);continue}
  await tx.unsafe(content);await tx`insert into schema_migrations(name,checksum) values(${name},${checksum})`;console.log("Applied "+name);
 }
})}finally{await db.end()}
