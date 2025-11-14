# 🎮 게임 밸런스 분석 대시보드

게임 스테이지 데이터를 시각화하고 밸런스를 분석하는 웹 애플리케이션입니다.

## 🌟 주요 기능

### 1. **데이터 업로드**
- CSV 파일 업로드 지원
- 샘플 데이터로 빠른 시작 가능

### 2. **메트릭 카드**
- 총 이벤트 수
- 전체 클리어율
- 자발적 포기율
- 총 스테이지 수

### 3. **개요 탭**
- 스테이지별 클리어율 차트
- 평균 실패 레벨 분석
- 상세 통계 테이블

### 4. **난이도 분석 탭**
- 난이도 스파이크 자동 감지
- 레벨별 실패율 곡선
- 레벨별 실패 횟수 및 위험도 평가

### 5. **퍼널 분석 탭**
- 플레이어 리텐션 퍼널
- 레벨별 이탈률 추적
- 누적 리텐션율 곡선
- 주요 이탈 구간 하이라이트

### 6. **스테이지 비교 탭**
- 스테이지 종합 비교 레이더 차트
- 클리어율 vs 평균 실패 레벨 산점도
- 가장 쉬운/어려운 스테이지 순위
- 자발적 포기율 분석

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어주세요.

### 빌드

```bash
npm run build
npm start
```

## 📊 CSV 데이터 형식

CSV 파일은 다음 형식이어야 합니다:

```csv
"Event Category","Event Action","Event Label","Event Value","Custom Event Properties"
"stage (App)","try","2001",,"{""last_level"":1}"
"stage (App)","clear","2001",,"{""last_level"":20}"
"stage (App)","fail","2002",,"{""last_level"":5}"
"stage (App)","fail","2002",,"{""exit_type"":""voluntary_exit"",""last_level"":1}"
```

### 필드 설명

| 필드 | 설명 |
|------|------|
| Event Category | 이벤트 카테고리 (예: "stage (App)") |
| Event Action | 액션 타입: "try" (시도), "clear" (클리어), "fail" (실패) |
| Event Label | 스테이지 ID (예: "2001", "2002") |
| Event Value | (선택사항) 이벤트 값 |
| Custom Event Properties | JSON 형식의 커스텀 속성 |

### Custom Event Properties

```json
{
  "last_level": 1-20,           // 마지막 인게임 레벨
  "exit_type": "voluntary_exit"  // (선택) 자발적 포기 시에만 포함
}
```

## 🎯 게임 규칙

- 총 **20개의 웨이브** (레벨)
- 웨이브 클리어마다 레벨업
- 레벨 20에서 실패해도 20, 클리어해도 20
- 액션으로 클리어/실패 구분:
  - `try`: 게임 시도
  - `clear`: 레벨 20 클리어
  - `fail`: 중도 실패
  - `exit_type: "voluntary_exit"`: 자발적 포기

## 🛠️ 기술 스택

- **Next.js 16** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트
- **Recharts** - 차트 라이브러리
- **PapaParse** - CSV 파싱

## 📁 프로젝트 구조

```
game-balance-dashboard/
├── app/
│   ├── page.tsx                    # 메인 페이지
│   └── globals.css                 # 글로벌 스타일
├── components/
│   ├── dashboard.tsx               # 메인 대시보드
│   ├── metrics-cards.tsx           # 메트릭 카드
│   ├── stage-overview.tsx          # 스테이지 개요
│   ├── difficulty-curve.tsx        # 난이도 곡선
│   ├── funnel-analysis.tsx         # 퍼널 분석
│   ├── stage-comparison.tsx        # 스테이지 비교
│   └── ui/                         # shadcn UI 컴포넌트
├── lib/
│   └── data-processor.ts           # 데이터 처리 로직
├── types/
│   └── game-data.ts                # 타입 정의
└── public/
    └── sample_data.csv             # 샘플 데이터
```

## 💡 사용 팁

### 기획자를 위한 기능
- **난이도 스파이크 자동 감지**: 급격한 난이도 상승 구간을 자동으로 표시
- **자발적 포기율 분석**: 플레이어가 의도적으로 그만둔 비율 추적
- **스테이지 순위**: 가장 쉬운/어려운 스테이지 즉시 파악

### 개발자를 위한 기능
- **상세 통계 테이블**: 정확한 수치 데이터 제공
- **레벨별 위험도**: 각 레벨의 문제점 우선순위화
- **리텐션 분석**: 플레이어 이탈 패턴 파악

### 주요 인사이트

1. **클리어율이 50% 미만인 스테이지**: 너무 어려움, 밸런스 조정 필요
2. **자발적 포기율이 30% 이상**: 재미없거나 지루함, 콘텐츠 개선 필요
3. **특정 레벨의 실패율이 40% 이상**: 해당 레벨에 난이도 스파이크 존재
4. **레벨별 이탈률이 20% 이상**: 해당 구간에 심각한 문제 존재

## 🔍 분석 예시

### 난이도 스파이크 발견
레벨 6에서 실패율이 급증한다면:
- 해당 레벨의 적 배치 검토
- 플레이어 자원 획득 타이밍 점검
- 튜토리얼 강화 고려

### 자발적 포기 많은 스테이지
스테이지 2006의 자발적 포기율이 높다면:
- 스테이지 디자인 재검토
- 보상 구조 개선
- 다양성 추가 고려

## 📝 라이선스

MIT License

## 🤝 기여

이슈와 PR을 환영합니다!
