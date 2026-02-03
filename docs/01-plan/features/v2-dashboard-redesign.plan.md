# Plan: V2 Dashboard Redesign

> **Feature**: v2-dashboard-redesign
> **Created**: 2026-02-03
> **Status**: Draft
> **PDCA Phase**: Plan

---

## 1. Overview

### 1.1 Background
현재 게임 밸런스 대시보드 v1은 기능적으로 완성되어 있으나, 디자인이 일반적인 대시보드 스타일입니다. Awwwards 수상작 수준의 현대적이고 세련된 UI/UX로 v2를 개발하여 사용자 경험을 대폭 개선합니다.

### 1.2 Goals
- Awwwards 추천 수준의 현대적 디자인
- 동일한 기능 유지 (데이터 처리 로직 재사용)
- v1/v2 전환 가능한 탭 시스템
- 부드러운 애니메이션과 마이크로 인터랙션
- 접근성과 반응형 디자인 보장

### 1.3 Non-Goals
- 새로운 분석 기능 추가 (기존 기능 유지)
- 백엔드 API 변경
- 데이터 처리 로직 변경

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | 우측 상단 v1/v2 버전 전환 탭 | Must |
| FR-02 | 기존 모든 분석 기능 유지 | Must |
| FR-03 | CSV 업로드 및 파일 관리 | Must |
| FR-04 | 필터 시스템 (자발적 포기, 스테이지 타입, 국가) | Must |
| FR-05 | 9개 분석 탭 (개요, 난이도, 퍼널 등) | Must |

### 2.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | Awwwards 수준의 비주얼 디자인 | Must |
| NFR-02 | 60fps 부드러운 애니메이션 | Should |
| NFR-03 | 모바일/태블릿 반응형 | Must |
| NFR-04 | 다크 테마 기본, 밝은 영역 포인트 | Should |
| NFR-05 | WCAG 2.1 AA 접근성 | Should |

---

## 3. Design Concept

### 3.1 Design Philosophy: "Data Poetry"
데이터를 시각적 예술로 승화. 차트와 수치가 아름다운 시각 요소로 표현됩니다.

### 3.2 Visual Elements

#### Color Palette
```
Primary Gradient: #6366f1 (Indigo) → #8b5cf6 (Violet) → #a855f7 (Purple)
Background: #0a0a0f (Deep Black) → #1a1a2e (Navy)
Accent: #22d3ee (Cyan), #f472b6 (Pink)
Text: #ffffff, #94a3b8 (Muted)
```

#### Typography
- 헤드라인: Inter (Bold 700, Large tracking)
- 본문: Inter (Regular 400)
- 숫자/데이터: JetBrains Mono (Monospace)

#### Animation Principles
- Entrance: Staggered fade-in with subtle scale
- Hover: Glow effect with scale 1.02
- Page Transition: Smooth morph between views
- Data Loading: Skeleton shimmer + number counting

### 3.3 Layout Concept

```
+----------------------------------------------------------+
|  [Logo]              [v1] [v2]  [Upload]                 |
+----------------------------------------------------------+
|                                                          |
|   +-----------+  +-----------+  +-----------+            |
|   |  Metric   |  |  Metric   |  |  Metric   |   Bento   |
|   |   Card    |  |   Card    |  |   Card    |   Grid    |
|   +-----------+  +-----------+  +-----------+            |
|                                                          |
|   +--------------------------------------------------+   |
|   |                                                  |   |
|   |              Main Visualization                  |   |
|   |           (Full-width chart area)                |   |
|   |                                                  |   |
|   +--------------------------------------------------+   |
|                                                          |
|   [Tab] [Tab] [Tab] [Tab] [Tab] [Tab] [Tab] [Tab] [Tab]  |
|                                                          |
+----------------------------------------------------------+
```

---

## 4. Technical Architecture

### 4.1 File Structure

```
app/
  page.tsx                 # 버전 전환 로직 추가
  v2/
    layout.tsx             # v2 레이아웃
    page.tsx               # v2 진입점

components/
  v2/
    dashboard-v2.tsx       # V2 메인 대시보드
    version-switcher.tsx   # v1/v2 전환 컴포넌트

    layout/
      header.tsx           # 글래스모피즘 헤더
      sidebar.tsx          # 축소 가능한 사이드바
      bento-grid.tsx       # Bento 스타일 그리드

    cards/
      metric-card.tsx      # 애니메이션 메트릭 카드
      glass-card.tsx       # 글래스모피즘 카드
      stat-card.tsx        # 통계 카드

    charts/
      animated-line.tsx    # 애니메이션 라인 차트
      glow-bar.tsx         # 글로우 바 차트
      radial-progress.tsx  # 원형 진행률
      heatmap.tsx          # 히트맵 시각화

    upload/
      dropzone.tsx         # 드래그앤드롭 업로드
      file-manager.tsx     # 파일 관리

    filters/
      filter-panel.tsx     # 접히는 필터 패널
      filter-chip.tsx      # 필터 칩

    tabs/
      tab-navigator.tsx    # 커스텀 탭 네비게이션
      tab-content.tsx      # 탭 콘텐츠 래퍼

    analysis/
      overview-v2.tsx
      difficulty-v2.tsx
      funnel-v2.tsx
      attrition-v2.tsx
      user-attrition-v2.tsx
      user-stage-v2.tsx
      revive-v2.tsx
      first-clear-v2.tsx
      comparison-v2.tsx

    animations/
      motion-wrapper.tsx   # Framer Motion 래퍼
      number-ticker.tsx    # 숫자 카운팅 애니메이션
      skeleton.tsx         # 로딩 스켈레톤
```

### 4.2 Dependencies

```json
{
  "framer-motion": "^11.x",      // 애니메이션
  "class-variance-authority": "^0.7.x",  // 조건부 스타일
  "clsx": "^2.x",                // 클래스 병합
  "tailwind-merge": "^2.x"       // Tailwind 클래스 병합
}
```

### 4.3 Data Flow

```
[기존 data-processor.ts] → [V2 Components] → [Enhanced Visualization]
                              ↑
                    [동일한 types/game-data.ts]
```

---

## 5. Implementation Phases

### Phase 1: Foundation (기반 구축)
- [ ] v1/v2 버전 전환 시스템 구현
- [ ] Framer Motion 설치 및 설정
- [ ] V2 기본 레이아웃 구조
- [ ] 글래스모피즘 카드 컴포넌트

### Phase 2: Core Components (핵심 컴포넌트)
- [ ] 애니메이션 메트릭 카드
- [ ] Bento Grid 레이아웃
- [ ] 커스텀 탭 네비게이션
- [ ] 필터 패널

### Phase 3: Data Visualization (데이터 시각화)
- [ ] 애니메이션 차트 컴포넌트
- [ ] 개요 페이지 v2
- [ ] 난이도 분석 v2
- [ ] 퍼널 분석 v2

### Phase 4: Analysis Pages (분석 페이지)
- [ ] 이탈 분석 v2
- [ ] 사용자 이탈 v2
- [ ] 사용자 스테이지 v2
- [ ] 부활 분석 v2
- [ ] 첫 클리어 v2
- [ ] 스테이지 비교 v2

### Phase 5: Polish (마무리)
- [ ] 로딩 스켈레톤 애니메이션
- [ ] 마이크로 인터랙션 추가
- [ ] 반응형 최적화
- [ ] 성능 최적화

---

## 6. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 애니메이션 성능 이슈 | Medium | Medium | GPU 가속, will-change 최적화 |
| 기존 기능 회귀 | High | Low | 기존 데이터 로직 재사용 |
| 디자인 일관성 부족 | Medium | Medium | 디자인 시스템 컴포넌트화 |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Animation Frame Rate | 60fps |

---

## 8. Dependencies

- 기존 `lib/data-processor.ts` 모든 함수
- 기존 `types/game-data.ts` 타입 정의
- 기존 `components/ui/*` shadcn 컴포넌트 (기본)

---

## Approval

- [ ] 요구사항 검토 완료
- [ ] 기술 아키텍처 승인
- [ ] 디자인 컨셉 승인
- [ ] 구현 단계 승인

---

**Next Step**: Design Phase (`/pdca design v2-dashboard-redesign`)
