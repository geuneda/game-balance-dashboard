# Design: V2 Dashboard Redesign

> **Feature**: v2-dashboard-redesign
> **Created**: 2026-02-03
> **Status**: In Progress
> **PDCA Phase**: Design

---

## 1. Component Architecture

### 1.1 Component Hierarchy

```
app/page.tsx
  └── VersionSwitcher
        ├── v1 → Dashboard (기존)
        └── v2 → DashboardV2
                    ├── HeaderV2
                    │     ├── Logo
                    │     ├── VersionTabs
                    │     └── UploadButton
                    ├── FilterPanelV2
                    │     └── FilterChips
                    ├── MetricsGridV2
                    │     └── MetricCard (x5)
                    ├── TabNavigatorV2
                    │     └── TabItem (x9)
                    └── ContentAreaV2
                          └── [Analysis Components V2]
```

### 1.2 State Management

```typescript
// Version state - URL based
/                    → v1 (default)
/?version=v2         → v2

// Or local storage persistence
localStorage.getItem('dashboard-version') → 'v1' | 'v2'
```

---

## 2. Component Specifications

### 2.1 VersionSwitcher

```typescript
// components/version-switcher.tsx
interface VersionSwitcherProps {
  currentVersion: 'v1' | 'v2';
  onVersionChange: (version: 'v1' | 'v2') => void;
}

// Styling
- 위치: 우측 상단 고정
- 크기: 80px x 36px
- 스타일: 글래스모피즘, 둥근 모서리
- 전환: 슬라이드 애니메이션 300ms
```

### 2.2 HeaderV2

```typescript
// components/v2/layout/header.tsx
interface HeaderV2Props {
  fileName?: string;
  onUpload: (file: File) => void;
  version: 'v1' | 'v2';
  onVersionChange: (v: 'v1' | 'v2') => void;
}

// Visual Design
- 높이: 72px
- 배경: rgba(10, 10, 15, 0.8) + backdrop-blur(20px)
- 하단 보더: 1px gradient (purple → cyan)
- 로고: 게임 아이콘 + 텍스트 (애니메이션 호버)
```

### 2.3 MetricCard

```typescript
// components/v2/cards/metric-card.tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  icon: React.ReactNode;
  gradient: string; // 'purple' | 'cyan' | 'pink' | 'orange'
  delay?: number; // stagger animation delay
}

// Features
- 숫자 카운팅 애니메이션 (0 → value)
- 호버 시 글로우 + 스케일(1.02)
- 그라데이션 보더
- 아이콘 펄스 애니메이션
```

### 2.4 GlassCard

```typescript
// components/v2/cards/glass-card.tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  gradient?: 'purple' | 'cyan' | 'pink' | 'none';
}

// Styling
- 배경: rgba(20, 20, 30, 0.6)
- 보더: 1px solid rgba(255, 255, 255, 0.1)
- backdrop-filter: blur(12px)
- box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4)
```

### 2.5 BentoGrid

```typescript
// components/v2/layout/bento-grid.tsx
interface BentoGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
}

// Layout
- CSS Grid with gap-4
- 반응형: 1col (mobile) → 3col (tablet) → 5col (desktop)
- 아이템별 staggered entrance animation
```

### 2.6 TabNavigatorV2

```typescript
// components/v2/tabs/tab-navigator.tsx
interface TabNavigatorV2Props {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (id: string) => void;
}

// Visual Design
- 하단 고정 또는 컨텐츠 위 배치
- 활성 탭: 그라데이션 밑줄 + 글로우
- 호버: 텍스트 색상 전환 + 아이콘 스케일
- 스크롤 가능 (모바일)
```

### 2.7 FilterPanelV2

```typescript
// components/v2/filters/filter-panel.tsx
interface FilterPanelV2Props {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  availableCountries: Country[];
  isExpanded: boolean;
  onToggle: () => void;
}

// Features
- 접기/펼치기 애니메이션
- 활성 필터 수 배지
- 필터 칩 그룹
- 초기화 버튼
```

### 2.8 AnimatedChart (Base)

```typescript
// components/v2/charts/animated-chart.tsx
interface AnimatedChartProps {
  type: 'line' | 'bar' | 'area' | 'radar';
  data: any[];
  config: ChartConfig;
  animate?: boolean;
  delay?: number;
}

// Animation Features
- 차트 그리기 애니메이션 (SVG path animation)
- 데이터 포인트 페이드인
- 호버 시 툴팁 + 해당 포인트 강조
- 줌/팬 지원 (옵션)
```

---

## 3. Style System

### 3.1 CSS Variables

```css
:root {
  /* Colors */
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #1a1a2e;
  --color-bg-card: rgba(20, 20, 30, 0.6);

  --color-accent-purple: #8b5cf6;
  --color-accent-cyan: #22d3ee;
  --color-accent-pink: #f472b6;
  --color-accent-orange: #fb923c;

  --color-text-primary: #ffffff;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  --gradient-glow: radial-gradient(circle at center, rgba(139, 92, 246, 0.3), transparent);

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Shadows */
  --shadow-glow: 0 0 20px rgba(139, 92, 246, 0.3);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3.2 Tailwind Extended Config

```javascript
// tailwind.config.js additions
{
  extend: {
    colors: {
      'v2-bg': '#0a0a0f',
      'v2-card': 'rgba(20, 20, 30, 0.6)',
      'v2-purple': '#8b5cf6',
      'v2-cyan': '#22d3ee',
      'v2-pink': '#f472b6',
    },
    animation: {
      'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      'count-up': 'count-up 1s ease-out forwards',
      'slide-up': 'slide-up 0.5s ease-out forwards',
      'fade-in': 'fade-in 0.3s ease-out forwards',
    },
    keyframes: {
      'glow-pulse': {
        '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
        '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
      },
      'slide-up': {
        from: { opacity: '0', transform: 'translateY(20px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
    },
  },
}
```

---

## 4. Animation Specifications

### 4.1 Page Entry

```typescript
// Staggered children animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};
```

### 4.2 Number Counter

```typescript
// components/v2/animations/number-ticker.tsx
interface NumberTickerProps {
  value: number;
  duration?: number; // default 1000ms
  decimals?: number;
  suffix?: string;
  prefix?: string;
}

// Implementation: framer-motion useSpring
```

### 4.3 Chart Animations

```typescript
// Line chart path drawing
const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: 'easeInOut' },
  },
};

// Bar chart growing
const barVariants = {
  hidden: { scaleY: 0, originY: 1 },
  visible: { scaleY: 1, transition: { duration: 0.8 } },
};
```

---

## 5. Responsive Breakpoints

```typescript
// Breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
};

// Layout changes
- Mobile (< 768px):
  - 단일 열 레이아웃
  - 탭 가로 스크롤
  - 필터 모달로 변경

- Tablet (768px - 1024px):
  - 2-3열 그리드
  - 축소된 메트릭 카드

- Desktop (> 1024px):
  - 전체 레이아웃
  - 5열 메트릭 그리드
  - 사이드 필터 패널
```

---

## 6. Implementation Order

### Phase 1: Foundation
1. `components/version-switcher.tsx`
2. `app/page.tsx` 수정 (버전 전환 로직)
3. `components/v2/layout/header.tsx`
4. Tailwind config 확장
5. Framer Motion 설치

### Phase 2: Core Cards
6. `components/v2/cards/glass-card.tsx`
7. `components/v2/cards/metric-card.tsx`
8. `components/v2/animations/number-ticker.tsx`
9. `components/v2/layout/bento-grid.tsx`

### Phase 3: Navigation & Filters
10. `components/v2/tabs/tab-navigator.tsx`
11. `components/v2/filters/filter-panel.tsx`
12. `components/v2/filters/filter-chip.tsx`

### Phase 4: Main Dashboard
13. `components/v2/dashboard-v2.tsx`
14. `components/v2/upload/dropzone.tsx`

### Phase 5: Analysis Pages
15. `components/v2/analysis/overview-v2.tsx`
16. `components/v2/analysis/difficulty-v2.tsx`
17. `components/v2/analysis/funnel-v2.tsx`
18. `components/v2/analysis/attrition-v2.tsx`
19. `components/v2/analysis/user-attrition-v2.tsx`
20. `components/v2/analysis/user-stage-v2.tsx`
21. `components/v2/analysis/revive-v2.tsx`
22. `components/v2/analysis/first-clear-v2.tsx`
23. `components/v2/analysis/comparison-v2.tsx`

### Phase 6: Polish
24. 로딩 스켈레톤
25. 에러 상태 UI
26. 반응형 테스트
27. 성능 최적화

---

## 7. Dependencies

### New Packages
```bash
npm install framer-motion
```

### Existing (Already Available)
- recharts (차트)
- papaparse (CSV 파싱)
- lucide-react (아이콘)
- @radix-ui/* (shadcn 기반)

---

## 8. Data Interface (No Changes)

기존 `lib/data-processor.ts`와 `types/game-data.ts` 그대로 사용:

```typescript
// 재사용하는 함수들
import {
  parseCSVData,
  calculateStageStats,
  findDifficultySpikes,
  getVoluntaryExitRate,
  getOverallClearRate,
  filterEvents,
  getCountries,
  calculateStageAttrition,
  calculateUserAttrition,
  getUniqueUserCount,
  calculateUserStageStats,
  parseReviveEvents,
  calculateStageReviveStats,
} from '@/lib/data-processor';

// 재사용하는 타입들
import type {
  GameEvent,
  StageStats,
  FilterOptions,
  ReviveEvent,
} from '@/types/game-data';
```

---

## 9. Accessibility Requirements

- 키보드 네비게이션 지원 (Tab, Enter, Arrow keys)
- ARIA labels 모든 인터랙티브 요소에 적용
- 색상 대비 최소 4.5:1
- 애니메이션 reduce-motion 미디어 쿼리 지원
- 스크린 리더 호환 차트 대체 텍스트

---

## Approval Checklist

- [ ] 컴포넌트 명세 검토
- [ ] 스타일 시스템 승인
- [ ] 애니메이션 스펙 승인
- [ ] 구현 순서 확인

---

**Next Step**: Do Phase (Implementation)
