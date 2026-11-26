export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({ status: "ok", service: "royal-table", phase: 1, database: "not_configured" }, { headers: { "Cache-Control": "no-store" } });
}
