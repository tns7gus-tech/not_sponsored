export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GuideEntry {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  updatedAt: string;
  publishedAt: string;
  readTime: string;
  queryHint: string;
  tags: string[];
  sections: GuideSection[];
}

export const GUIDES: GuideEntry[] = [
  {
    slug: "spot-sponsored-review-signals",
    title: "광고 같은 후기를 빠르게 구분하는 7가지 신호",
    description: "후기를 볼 때 광고성 문구와 실사용 근거를 나눠 보는 기본 체크리스트입니다.",
    excerpt: "제공 문구, 쿠폰 코드, 구매 링크 반복, 장점만 과하게 강조하는 문장을 먼저 걸러내는 방법을 정리했습니다.",
    updatedAt: "2026-03-11",
    publishedAt: "2026-03-11",
    readTime: "4분",
    queryHint: "광고 아닌 후기 구분",
    tags: ["후기 분석", "광고성 신호", "구매 리서치"],
    sections: [
      {
        heading: "먼저 광고라고 단정하지 말고 신호를 보세요",
        paragraphs: [
          "좋은 후기와 광고성 후기는 완전히 분리되어 있지 않습니다. 중요한 건 단정이 아니라 어떤 문장이 신뢰를 높이고 어떤 문장이 근거를 약하게 만드는지 보는 것입니다.",
          "Not Sponsored는 광고 의심 표현과 실사용 정황을 함께 보여줘서 사용자가 직접 판단할 수 있게 돕습니다.",
        ],
      },
      {
        heading: "광고성 신호 체크리스트",
        paragraphs: ["아래 항목이 한두 개 있다고 바로 광고라고 볼 수는 없지만, 여러 개가 겹치면 주의해서 보는 편이 좋습니다."],
        bullets: [
          "제공, 협찬, 파트너스, 제휴 링크 같은 고지 문구가 있다",
          "쿠폰 코드나 추천 링크가 본문 중간중간 반복된다",
          "장점만 길고 단점은 거의 형식적으로 지나간다",
          "구매 링크 클릭을 강하게 유도하는 CTA가 많다",
          "비슷한 문장 구조와 과장된 표현이 반복된다",
        ],
      },
      {
        heading: "실사용 근거 신호 체크리스트",
        paragraphs: ["반대로 아래 표현은 실제 사용 경험이 포함됐을 가능성을 높여줍니다."],
        bullets: [
          "내돈내산, 직접 구매, 영수증, 방문 인증 같은 정황 표현",
          "1주 사용, 3개월 사용, 며칠 써봄 같은 기간 정보",
          "장점뿐 아니라 불편했던 순간 같은 구체적 불만",
          "방문 후기, 배송 과정, 설치 과정 같은 현장 경험",
          "사진이나 영상 설명이 본문 내용과 자연스럽게 이어진다",
        ],
      },
    ],
  },
  {
    slug: "find-real-usage-reviews-faster",
    title: "실사용 후기만 빨리 찾는 검색어 조합",
    description: "검색 과정에서 시간을 줄여주는 후기 탐색용 질의 조합입니다.",
    excerpt: "상품명만 검색하면 정보가 너무 넓습니다. 내돈내산, 사용기, 단점, 비교 같은 보조 질의를 붙여서 실사용 근거를 빠르게 찾는 방법을 정리했습니다.",
    updatedAt: "2026-03-11",
    publishedAt: "2026-03-11",
    readTime: "5분",
    queryHint: "아이폰 17 실사용 후기",
    tags: ["검색 전략", "실사용 후기", "비교"],
    sections: [
      {
        heading: "상품명만 검색하면 시간이 길어집니다",
        paragraphs: [
          "구매 직전 사용자는 보통 상품명 하나만 검색하지 않습니다. 후기, 리뷰, 사용기, 단점을 반복해서 붙이다 보면 여러 탭을 오가게 됩니다.",
          "처음부터 검색 질의를 잘 쓰면 필요한 결과를 더 빨리 모을 수 있습니다.",
        ],
      },
      {
        heading: "추천 검색 조합",
        paragraphs: ["아래 조합은 대부분의 소비재 카테고리에서 잘 작동합니다."],
        bullets: [
          "상품명 + 내돈내산",
          "상품명 + 실사용 후기",
          "상품명 + 단점",
          "상품명 + 비교",
          "상품명 + 추천하지 않는 이유",
        ],
      },
      {
        heading: "카테고리별 추가 질문도 붙이세요",
        paragraphs: ["카테고리에 맞는 문제 키워드를 함께 붙이면 더 구체적인 경험담을 찾기 쉽습니다."],
        bullets: [
          "전자기기: 발열, 배터리, 초기 불량, AS",
          "화장품: 지속력, 민감성, 성분, 건조함",
          "패션: 착화감, 사이즈, 재질, 내구성",
          "가전: 소음, 설치, 청소, 유지 관리",
        ],
      },
    ],
  },
  {
    slug: "checklist-before-you-buy",
    title: "구매 전 반드시 확인할 근거 체크리스트",
    description: "후기 개수보다 근거의 질을 먼저 보는 구매 전 체크리스트입니다.",
    excerpt: "작성 시점, 사용 정황, 실제 단점, 링크 구조, 반응 데이터를 구매 전에 어떻게 볼지 정리했습니다.",
    updatedAt: "2026-03-11",
    publishedAt: "2026-03-11",
    readTime: "4분",
    queryHint: "로봇청소기 단점 후기",
    tags: ["체크리스트", "구매 전 검색", "후기 읽기"],
    sections: [
      {
        heading: "후기 수보다 근거의 질이 중요합니다",
        paragraphs: [
          "좋은 구매 리서치는 후기를 많이 읽는 일이 아니라, 근거가 있는 후기를 먼저 찾는 일입니다.",
          "특히 고가 상품일수록 작성 시점, 직접 사용 여부, 단점의 구체성, 링크 구조를 먼저 보는 편이 좋습니다.",
        ],
      },
      {
        heading: "구매 전 5가지 확인 포인트",
        paragraphs: ["이 다섯 가지는 상품 카테고리와 무관하게 공통으로 유효한 기준입니다."],
        bullets: [
          "작성 시점이 최근인지, 사용 기간이 명시되어 있는지",
          "직접 구매 또는 직접 방문 같은 체험 표현이 있는지",
          "단점이 실제 사용 상황과 함께 설명되는지",
          "링크와 쿠폰 코드 유도가 과도하지 않은지",
          "여러 플랫폼에서 비슷한 문장이 반복되는지",
        ],
      },
      {
        heading: "리서치를 덜 지치게 만드는 방법",
        paragraphs: [
          "검색 결과를 한 번에 모아서 보고, 광고성 신호와 실사용 근거를 함께 보는 방식이 가장 실용적입니다.",
          "Not Sponsored는 그 반복 작업을 줄이기 위해 만들어졌습니다.",
        ],
      },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug);
}
