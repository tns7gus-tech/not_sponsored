# Not Sponsored Launch Checklist

작성일: 2026-03-12 (Asia/Seoul)

## 목적

출시 직전 기준으로 웹, API, 분석 이벤트가 모두 정상 동작하는지 빠르게 점검하기 위한 체크리스트다.

## 배포 전

1. `services/api`에서 Alembic 최신 리비전이 적용 가능한지 확인한다.
2. `apps/web`에서 프로덕션 빌드가 통과하는지 확인한다.
3. API 환경 변수와 웹 환경 변수가 실제 배포 값으로 채워져 있는지 확인한다.

### 필수 확인 항목

- API
  - `DATABASE_URL`
  - `REDIS_URL`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
  - `YOUTUBE_API_KEY`
  - `FRONTEND_URL`
  - `CORS_ORIGINS`
- Web
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_CONTACT_EMAIL`

## 배포 절차

### API

```bash
cd services/api
alembic upgrade head
python -m compileall app alembic
```

### Web

```bash
cd apps/web
npm run lint
npm run build
```

## 배포 후 스모크 테스트

1. 홈 진입
   - 검색 입력과 URL 분석 입력이 모두 보인다.
   - 트렌딩 검색, 샘플 카드, 지원 범위 표가 정상 렌더링된다.
2. 검색 플로우
   - 홈에서 검색을 시작하면 `/search/[jobId]`로 이동한다.
   - 진행 단계 카드가 보인다.
   - 완료 후 요약 카드와 결과 리스트가 보인다.
   - 필터를 과하게 걸었을 때 빈 상태 안내와 초기화 버튼이 보인다.
3. URL 분석 플로우
   - 공개 URL 입력 후 `/analyze/[jobId]`로 이동한다.
   - 진행 단계 카드가 보인다.
   - 실패 시 차단 사유 또는 재시도 안내가 보인다.
4. 운영 페이지
   - `/guides`, `/privacy`, `/terms`, `/corrections`가 모두 열린다.
   - 푸터 링크와 문의 메일이 정상 노출된다.

## 분석 이벤트 점검

최소 아래 이벤트가 저장되는지 확인한다.

- `page_view_home`
- `search_submit`
- `search_results_view`
- `url_analysis_submit`
- `url_analysis_view`
- `result_detail_open`
- `source_click`
- `feedback_submit`
- `history_open`
- `trending_click`

### 확인 방법 예시

```sql
select event_type, count(*) as hits
from analytics_events
where created_at >= now() - interval '1 day'
group by event_type
order by hits desc, event_type asc;
```

## 현재 로컬 검증 결과

2026-03-12 기준으로 아래 검증은 로컬에서 통과했다.

```bash
cd apps/web && npm run lint
cd apps/web && npm run build
python -m compileall services/api/app services/api/alembic
```
