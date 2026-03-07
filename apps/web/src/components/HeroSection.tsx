export default function HeroSection() {
    return (
        <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Not Sponsored
                </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
                광고/협찬 가능성이 낮고 근거가 투명한 후기를<br />
                우선 탐색하는 <span className="text-white font-medium">AI 구매 리서치 에이전트</span>
            </p>
        </header>
    );
}
