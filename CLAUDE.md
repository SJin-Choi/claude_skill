# CLAUDE.md

## Project Overview

- **Name**: hello-world
- **Stack**: React 19 + TypeScript + Vite
- **Type**: Single-page application

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check with tsc then build with Vite
- `npm run preview` — Preview production build

## Testing

- `npm run dev` — 개발 서버를 실행하여 브라우저에서 직접 동작 확인

## Project Structure

```
src/
  main.tsx    — Entry point
  App.tsx     — Root component
```

## Code Style

- TypeScript strict mode enabled
- JSX uses `react-jsx` transform (no manual React imports needed)
- ES2020 target
- ESModule format (`"type": "module"`)

## TypeScript Rules

- No unused locals or parameters (`noUnusedLocals`, `noUnusedParameters`)
- No fallthrough in switch cases
- Strict null checks enabled

## workflow
각 작업은 subagent를 활용하여 진행
1. phase design 생성
  - 성공 목표 검토
2. 목표를 기반으로 테스트 작성
3. phase 목표와 테스트 비교 검토
4. phase의 해당 기능 개발
  - 기능을 병렬적으로 개발할 수 있다면 다중 subagent활용
5. 개발된 기능 테스트
6. 완료


## 문서 기준

이 프로젝트는 아래 문서를 기준으로 개발된다.
- `docs/PRD.md`: 전체 요구사항 정의
- `docs/FEATURES/main.md`: 메인 화면 구성
- `docs/FEATURES/game_rule.md`: 게임 룰 상세 내용
- `docs/FEATURES/mission1.md`: Mission 1 난이도 및 규칙
- `PLAN.md`: Phase별 개발 목표 인덱스 (상세는 `docs/plan/phase*.md`)