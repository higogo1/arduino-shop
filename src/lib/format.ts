export function won(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export const FREE_SHIPPING_MIN = 50000;
export const SHIPPING_FEE = 3000;

export function shippingFee(itemsAmount: number) {
  return itemsAmount === 0 || itemsAmount >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}

export const ORDER_STATUS: Record<string, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  shipping: "배송 중",
  delivered: "배송 완료",
  cancelled: "주문 취소",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" });
}
