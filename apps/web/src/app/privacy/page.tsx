import DocumentPageLayout from "@/components/DocumentPageLayout";
import { CONTACT_EMAIL } from "@/components/SiteFooter";

export default function PrivacyPage() {
  return (
    <DocumentPageLayout
      eyebrow="개인정보처리방침"
      title="공개 범위 안에서만 분석합니다"
      description="Not Sponsored는 공개 검색 결과와 사용자가 직접 입력한 공개 URL만 분석 대상으로 삼습니다. 로그인 필요 페이지, 내부망 주소, 비공개 커뮤니티는 분석하지 않습니다."
      updatedAt="2026-03-09"
    >
      <section>
        <h2 className="text-xl font-semibold text-white">1. 수집하는 정보</h2>
        <p className="mt-3">
          사용자가 입력한 검색어, 공개 URL, 최근 검색 기록이 브라우저 로컬 저장소에 보관될 수 있습니다. 피드백 버튼을 누르면 해당
          결과 카드의 식별자와 URL이 함께 전송될 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">2. 분석하지 않는 정보</h2>
        <p className="mt-3">
          로그인 필요 페이지, 비공개 커뮤니티, 내부망 주소, 비표준 포트, 민감정보가 포함된 비공개 문서는 분석하지 않습니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">3. 사용 목적</h2>
        <p className="mt-3">
          입력된 공개 데이터는 리포트 생성, 광고성 신호 탐지, 오류 대응, 사용자 피드백 반영을 위해 사용됩니다. 자동 추정 결과이므로
          사실 확정이나 법적 판단 용도로는 사용되지 않습니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">4. 문의</h2>
        <p className="mt-3">
          개인정보 처리와 정정 요청 관련 문의는{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-200 underline-offset-4 hover:underline">
            {CONTACT_EMAIL}
          </a>
          로 보낼 수 있습니다.
        </p>
      </section>
    </DocumentPageLayout>
  );
}
