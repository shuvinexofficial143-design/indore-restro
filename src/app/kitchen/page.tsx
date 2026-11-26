import {requireArea} from "@/lib/session";
import StaffBoard from "@/components/staff-board";
export const dynamic="force-dynamic";
export default async function Kitchen(){const s=await requireArea("kitchen");return <StaffBoard {...s} area="kitchen"/>}
