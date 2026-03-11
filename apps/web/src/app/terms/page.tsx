import DocumentPageLayout from "@/components/DocumentPageLayout";

export default function TermsPage() {
  return (
    <DocumentPageLayout
      eyebrow="이용 안내"
      title="결과는 참고용이며 최종 판단은 사용자에게 있습니다"
      description="Not Sponsored는 공개 근거를 정리해 보여주는 구매 리서치 도구입니다. 광고 여부를 확정하지 않으며, 자동 추정 결과를 법적 판단이나 사실 확정 용도로 제공하지 않습니다."
      updatedAt="2026-03-11"
    >
      <section>
        <h2 className="text-xl font-semibold text-white">1. 서비스 성격</h2>
        <p className="mt-3">
          이 서비스는 공개 검색 결과와 공개 URL을 바탕으로 광고성 신호, 실사용 표현, 반복되는 판단 요소를 요약합니다. 결과는 참고용 리포트이며 전문 검토나 사실 확정을 대체하지 않습니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">2. 사용 제한</h2>
        <p className="mt-3">
          사용자는 자신에게 접근 권한이 있는 공개 URL만 입력해야 하며, 로그인 필요 페이지나 비공개 자료를 우회 분석하려는 시도를 해서는 안 됩니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">3. 책임 범위</h2>
        <p className="mt-3">
          구매 결정, 법적 분쟁, 명예훼손 판단 같은 중요한 사안은 별도 검토가 필요합니다. 이 서비스는 리서치를 보조하는 요약 도구입니다.
        </p>
      </section>
    </DocumentPageLayout>
  );
}
