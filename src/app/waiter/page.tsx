import {requireArea} from "@/lib/session";
import StaffBoard from "@/components/staff-board";
export const dynamic="force-dynamic";
export default async function Waiter(){const s=await requireArea("waiter");return <StaffBoard {...s} area="waiter"/>}
