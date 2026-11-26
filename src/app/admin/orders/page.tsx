import {requireArea} from "@/lib/session";
import StaffBoard from "@/components/staff-board";
export const dynamic="force-dynamic";
export default async function Orders(){const s=await requireArea("admin");return <StaffBoard {...s} area="admin"/>}
