import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted sm:grid-cols-3">
        <div>
          <p className="text-base font-bold text-foreground">아두이노 마켓</p>
          <p className="mt-2">아두이노 보드, 센서, 모듈을 한곳에서.</p>
        </div>
        <div>
          <p className="font-medium text-foreground">쇼핑 안내</p>
          <p className="mt-2">5만원 이상 무료배송 (미만 3,000원)</p>
          <p>평일 오후 2시 이전 결제 시 당일 출고</p>
        </div>
        <div>
          <p className="font-medium text-foreground">참고</p>
          <p className="mt-2">상품 가격과 정보는 디바이스마트 기준으로 정리했습니다.</p>
          <p>
            상품 사진: Wikimedia Commons (
            <Link href="/credits" className="underline">출처 보기</Link>)
          </p>
          <p>결제는 토스페이먼츠 테스트 모드로, 실제 결제되지 않습니다.</p>
        </div>
      </div>
    </footer>
  );
}
