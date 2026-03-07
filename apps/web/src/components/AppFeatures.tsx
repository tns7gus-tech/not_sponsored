export default function AppFeatures() {
    return (
        <>
            <section aria-labelledby="features-title" className="mt-16 max-w-2xl mx-auto">
                <h2 id="features-title" className="sr-only">서비스 주요 기능</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="p-4 rounded-xl hover:bg-gray-800/30 transition-colors">
                        <div className="text-3xl mb-3" aria-hidden="true">🔍</div>
                        <h3 className="text-gray-300 font-medium mb-1">다중 소스 통합 검색</h3>
                        <p className="text-gray-500 text-xs">제품명만 입력하면 블로그, 카페, 유튜브를 한 번에 검색</p>
                    </div>
                    <div className="p-4 rounded-xl hover:bg-gray-800/30 transition-colors">
                        <div className="text-3xl mb-3" aria-hidden="true">🛡️</div>
                        <h3 className="text-gray-300 font-medium mb-1">광고 패턴 감지</h3>
                        <p className="text-gray-500 text-xs">광고/협찬 신호를 AI 모델이 자동으로 감지하여 표시</p>
                    </div>
                    <div className="p-4 rounded-xl hover:bg-gray-800/30 transition-colors">
                        <div className="text-3xl mb-3" aria-hidden="true">📊</div>
                        <h3 className="text-gray-300 font-medium mb-1">투명한 근거 제시</h3>
                        <p className="text-gray-500 text-xs">어떤 문장 때문에 점수가 깎였는지, 객관적 분석 근거 제공</p>
                    </div>
                </div>
            </section>

            <footer className="mt-12 text-gray-600 text-[10px] max-w-md text-center px-4 pb-8">
                <p>
                    이 서비스는 AI 기반 자동 추정 결과를 제공하며, 사실의 확정이 아닙니다.
                    구매 결정 전 원문을 직접 확인하시기 바랍니다.
                </p>
            </footer>
        </>
    );
}
