# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js web application for visualizing and analyzing game stage balance data for mobile game developers. The app processes CSV event data to provide insights on stage difficulty, player retention, and voluntary exit rates.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Recharts, PapaParse

## Common Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server at localhost:3000
npm run build           # Production build
npm start               # Run production server

# Code Quality
npm run lint            # Run ESLint
```

## Architecture

### Data Flow
1. **CSV Upload** → PapaParse converts CSV to JSON
2. **Data Processing** → `lib/data-processor.ts` transforms raw events into analytics
3. **Visualization** → Components in `components/` render charts via Recharts

### Key Components Structure

**Main Entry Point:**
- `app/page.tsx` - Home component (single page app)
- `app/layout.tsx` - Root layout with metadata

**Core Components:**
- `components/dashboard.tsx` - Main dashboard container with tabs (Overview, Difficulty Analysis, Funnel Analysis, Stage Comparison)
- `components/metrics-cards.tsx` - Top-level KPI cards
- `components/stage-overview.tsx` - Stage clear rates and stats table
- `components/difficulty-curve.tsx` - Difficulty spike detection and level-by-level failure rates
- `components/funnel-analysis.tsx` - Player retention and drop-off analysis
- `components/stage-comparison.tsx` - Cross-stage comparisons (radar charts, scatter plots)
- `components/ui/` - shadcn/ui primitives (tabs, cards, select, etc.)

**Data Layer:**
- `lib/data-processor.ts` - Core analytics functions:
  - `parseCSVData()` - Parse CSV into GameEvent[]
  - `calculateStageStats()` - Aggregate per-stage metrics
  - `findDifficultySpikes()` - Detect sudden difficulty increases
  - `calculateFunnelData()` - Compute retention funnel
  - `getOverallClearRate()` - Global clear rate
  - `getVoluntaryExitRate()` - Global voluntary exit rate

**Type Definitions:**
- `types/game-data.ts` - Core TypeScript interfaces:
  - `GameEvent` - Raw event from CSV
  - `StageStats` - Aggregated stage-level metrics
  - `DifficultySpike` - Difficulty spike metadata
  - `FunnelData` - Retention funnel data points

### CSV Data Format

The app expects CSV with these columns:
- `Event Category` - Always "stage (App)"
- `Event Action` - "try" | "clear" | "fail"
- `Event Label` - Stage ID (e.g., "2001", "2002")
- `Event Value` - Optional numeric value
- `Custom Event Properties` - JSON string with:
  - `last_level`: 1-20 (final wave reached)
  - `exit_type`: "voluntary_exit" (only on fail events)

**Game Rules:**
- 20 waves per stage
- "try" = stage attempt
- "clear" = completed wave 20
- "fail" = died before wave 20
- "voluntary_exit" = player quit intentionally

### Path Aliases

Import paths use `@/` prefix (configured in `tsconfig.json` and `components.json`):
```typescript
import { Button } from '@/components/ui/button';
import { parseCSVData } from '@/lib/data-processor';
import type { GameEvent } from '@/types/game-data';
```

### Styling

- Tailwind CSS 4.0 with `app/globals.css`
- shadcn/ui configured with "new-york" style, neutral base color, CSS variables enabled
- Custom animations via `tw-animate-css`

## Development Notes

### When Adding New Analytics
1. Add calculation function to `lib/data-processor.ts`
2. Define TypeScript types in `types/game-data.ts`
3. Create visualization component in `components/`
4. Import into `components/dashboard.tsx` and add to appropriate tab

### When Adding New UI Components
Use shadcn/ui CLI to add components:
```bash
npx shadcn@latest add [component-name]
```
Components will be added to `components/ui/` with proper configuration.

### Component Pattern
All visualization components follow this pattern:
```typescript
interface Props {
  data: StageStats[]; // or other data type
}

export function ComponentName({ data }: Props) {
  // Data transformations
  // Recharts chart rendering
}
```

### Data Processing Pattern
All processor functions in `lib/data-processor.ts`:
- Accept `GameEvent[]` or `StageStats[]` as input
- Return strongly-typed analytics data
- Use ES6 Maps for efficient grouping
- Handle missing/malformed data gracefully
