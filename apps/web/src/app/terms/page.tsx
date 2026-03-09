import DocumentPageLayout from "@/components/DocumentPageLayout";

export default function TermsPage() {
  return (
    <DocumentPageLayout
      eyebrow="이용약관"
      title="결과는 참고용이며 최종 판단은 사용자에게 있습니다"
      description="Not Sponsored는 공개 근거를 정리해 보여주는 구매 리서치 도구입니다. 후기의 진위를 단정하지 않으며, 자동 추정 결과를 법적 판단이나 낙인 용도로 사용하면 안 됩니다."
      updatedAt="2026-03-09"
    >
      <section>
        <h2 className="text-xl font-semibold text-white">1. 서비스 성격</h2>
        <p className="mt-3">
          본 서비스는 공개 검색 결과와 공개 URL을 바탕으로 광고성 신호, 실사용 표현, 반복 장단점을 요약합니다. 결과는 참고용 리포트로
          제공되며 사실 확정이나 전문가 자문을 대체하지 않습니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">2. 사용 제한</h2>
        <p className="mt-3">
          사용자는 자신이 접근 권한이 있는 공개 URL만 입력해야 하며, 로그인 필요 페이지나 비공개 자료를 우회해 분석하도록 시도해서는 안
          됩니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">3. 책임 범위</h2>
        <p className="mt-3">
          구매 결정, 신고, 법적 분쟁, 명예 훼손 판단 등 중요한 의사결정은 원문 검토와 별도 확인 절차를 거쳐야 합니다. 본 서비스는
          이를 보조하는 요약 도구입니다.
        </p>
      </section>
    </DocumentPageLayout>
  );
}
