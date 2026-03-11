import DocumentPageLayout from "@/components/DocumentPageLayout";
import { CONTACT_EMAIL } from "@/components/SiteFooter";

export default function CorrectionsPage() {
  return (
    <DocumentPageLayout
      eyebrow="정정/삭제 요청"
      title="잘못 연결된 결과나 민감한 항목은 수정 요청할 수 있습니다"
      description="리포트에 잘못된 URL이 연결되었거나 공개 범위를 벗어난 정보가 포함되었다고 판단되면 정정 또는 삭제 요청을 보낼 수 있습니다."
      updatedAt="2026-03-11"
    >
      <section>
        <h2 className="text-xl font-semibold text-white">1. 요청 대상</h2>
        <p className="mt-3">
          공개 범위를 벗어난 링크, 잘못 연결된 출처, 민감정보 노출, 사실과 다른 요약, 삭제가 필요한 링크 정보가 요청 대상입니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">2. 요청 방법</h2>
        <p className="mt-3">아래 메일로 대상 URL, 요청 사유, 확인 가능한 참고 정보를 함께 보내 주세요.</p>
        <p className="mt-2">
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-200 underline-offset-4 hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">3. 처리 원칙</h2>
        <p className="mt-3">
          공개 범위 위반이나 명백한 오연결이 확인되면 우선적으로 수정 또는 제거를 검토합니다. 자동 추정 요약의 해석 차이는 원문과 함께 다시 검토합니다.
        </p>
      </section>
    </DocumentPageLayout>
  );
}
