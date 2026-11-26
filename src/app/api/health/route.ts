export const dynamic="force-dynamic";
export function GET(){return Response.json({status:"ok",service:"royal-table",phase:8,database:process.env.DATABASE_URL?"configured_not_probed":"not_configured"},{headers:{"Cache-Control":"no-store"}})}
