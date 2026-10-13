import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-muted">주소가 바뀌었거나 판매가 종료된 상품일 수 있습니다.</p>
      <Link href="/products" className="btn-primary mt-6">상품 둘러보기</Link>
    </div>
  );
}
