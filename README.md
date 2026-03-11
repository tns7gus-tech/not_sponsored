# Not Sponsored

Not Sponsored는 네이버, 유튜브, 공개 URL에서 광고성 신호와 실사용 근거를 함께 정리해 보여주는 구매 리서치 서비스입니다.

사용자가 상품명이나 질문을 입력하면 검색어를 확장하고 여러 공개 소스의 결과를 모아 `광고성 신호`, `실사용 근거`, `정보 부족`을 함께 보여줍니다. 특정 후기 페이지나 리뷰 URL 한 건을 직접 넣어 단일 페이지 분석도 할 수 있습니다.

## 핵심 기능

- 상품명 기반 멀티소스 리서치
  - 네이버 블로그, 카페, 뉴스, 쇼핑과 YouTube 결과를 모아 한 화면에서 비교합니다.
- 근거 중심 결과 카드
  - 각 결과에 대해 TSS/CRS/EQS 점수와 함께 판단에 영향을 준 설명을 제공합니다.
- 공개 URL 단일 분석
  - 공개 리뷰 페이지나 소개 페이지 URL 한 건을 직접 분석해 광고성 신호와 근거를 요약합니다.
- 가이드 허브
  - 검색 유입을 위한 공개 가이드 페이지와 SEO용 메타데이터, sitemap, robots를 포함합니다.
- 기본 분석 이벤트 수집
  - 검색 시작, 결과 조회, 상세 열기, 원문 클릭 같은 이벤트를 수집할 수 있습니다.

## 프로젝트 구조

```text
apps/web      Next.js 16 / React 19 프론트엔드
services/api  FastAPI / SQLAlchemy 백엔드
docker-compose.yml  로컬 PostgreSQL / Redis 실행
```

## 기술 스택

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Backend: FastAPI, SQLAlchemy Async, Alembic, httpx, BeautifulSoup
- Infra: PostgreSQL, Redis, Railway

## 로컬 실행

### 1. 인프라 실행

```bash
docker compose up -d postgres redis
```

### 2. 백엔드 실행

```bash
cd services/api
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

필요한 환경 변수 예시:

- `DATABASE_URL`
- `REDIS_URL`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `YOUTUBE_API_KEY`
- `FRONTEND_URL`
- `CORS_ORIGINS`

### 3. 프론트엔드 실행

```bash
cd apps/web
npm install
npm run dev
```

기본 접속 주소:

- Web: `http://localhost:3000`
- API: `http://localhost:8000`

## 배포

웹과 API 모두 Railway 설정 파일이 포함되어 있습니다.

- Web: `apps/web/railway.toml`
- API: `services/api/railway.toml`

## 검증

현재 저장소 기준으로 아래 검증을 통과했습니다.

```bash
cd apps/web && npm run build
cd apps/web && npm run lint
python -m compileall services/api/app services/api/alembic
```

## 원칙

- 광고 여부를 단정하지 않습니다.
- 공개적으로 접근 가능한 결과와 URL만 다룹니다.
- 최종 구매 판단은 사용자가 직접 원문을 확인한 뒤 내려야 합니다.
