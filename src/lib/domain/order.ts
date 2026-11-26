export const orderStatuses = ["pending", "accepted", "preparing", "ready", "served", "out_for_delivery", "completed", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];
export type OrderType = "dine_in" | "takeaway" | "delivery";
export function canTransition(from: OrderStatus, to: OrderStatus, type: OrderType): boolean {
  if (from === "pending") return to === "accepted" || to === "cancelled";
  if (from === "accepted") return to === "preparing" || to === "cancelled";
  if (from === "preparing") return to === "ready";
  if (from === "ready") return to === (type === "delivery" ? "out_for_delivery" : type === "dine_in" ? "served" : "completed");
  if (from === "served" || from === "out_for_delivery") return to === "completed";
  return false;
}
export function lineTotalPaise(unitPaise: number, quantity: number): number {
  if (!Number.isSafeInteger(unitPaise) || unitPaise < 0 || !Number.isSafeInteger(quantity) || quantity < 1) throw new RangeError("Invalid price or quantity");
  const total = unitPaise * quantity;
  if (!Number.isSafeInteger(total)) throw new RangeError("Total exceeds safe integer range");
  return total;
}
