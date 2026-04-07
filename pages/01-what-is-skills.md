[목차](index.md) | [다음: Skills의 동작 원리 →](02-how-skills-work.md)

---

# 1. Skills란 무엇인가?

> **이 섹션에서 배울 것**: Skills의 개념, 기존 CLAUDE.md와의 차이, 번들 Skills과 커스텀 Skills의 구분

## Skills를 한마디로

Skills는 **Claude에게 새로운 능력을 가르치는 레시피 카드**입니다.

요리사에게 새로운 레시피 카드를 건네면, 그 요리사는 그 요리를 만들 수 있게 됩니다. 마찬가지로, Claude에게 `SKILLS.md` 파일을 만들어 주면, Claude는 그 파일에 적힌 지침대로 새로운 작업을 수행할 수 있게 됩니다.

예를 들어:
- "코드를 설명해 줘" 라는 요청을 받으면 특정 형식으로 설명하는 Skills
- "이 이슈를 고쳐 줘" 라는 요청을 받으면 정해진 절차로 버그를 수정하는 Skills
- "PR 요약해 줘" 라는 요청을 받으면 Git 정보를 자동으로 가져와 요약하는 Skills

## CLAUDE.md와의 차이점

| 구분 | CLAUDE.md | Skills (SKILLS.md) |
|------|-----------|-------------------|
| **역할** | 프로젝트 전반의 규칙/컨텍스트 제공 | 특정 작업에 대한 실행 지침 제공 |
| **호출 방식** | 항상 자동으로 로드됨 | `/skills-name`으로 호출하거나, Claude가 자동 판단하여 로드 |
| **구조** | 자유로운 마크다운 | frontmatter(메타데이터) + 마크다운 |
| **비유** | 회사의 사내 규정 | 특정 업무의 매뉴얼/SOP |
| **인수 전달** | 불가 | `$ARGUMENTS`, `$1`, `$2` 등으로 인수 전달 가능 |
| **실행 환경** | 메인 대화 | 메인 대화 또는 별도 subagent |

> **핵심 포인트**: CLAUDE.md는 "Claude야, 우리 프로젝트는 이렇게 돌아가" 라고 배경지식을 알려주는 것이고, Skills는 "Claude야, 이 특정 작업은 이렇게 해" 라고 구체적인 작업 절차를 알려주는 것입니다.

## 번들 Skills vs 커스텀 Skills

**번들 Skills**는 Claude Code에 기본으로 포함된 Skills입니다:

| Skills | 설명 |
|-------|------|
| `/batch <instruction>` | 코드베이스 전체에서 대규모 변경을 병렬로 조율. 각 에이전트는 자신의 단위를 격리된 git worktree에서 구현, 테스트를 실행, PR을 생성. git 저장소가 필요 |
| `/claude-api` | Claude API를 사용하는 코드 작성 지원 |
| `/debug [description]` | 디버깅 로깅 활성화 및 로그 베이스 문제 해결 지원(`claude --debug`로 시작하여 켜놓을 수도 있음) |
| `/loop [interval] <prompt>` | prompt를 interval만큼마다 반복 실행(session이 열려있는 동안 지속) |
| `/simplify [focus]` | focus에 맞춰 코드 단순화 및 리팩토링, 3개의 검토 agent를 병렬로 생성하여 진행 |

---

[목차](index.md) | [다음: Skills의 동작 원리 →](02-how-skills-work.md)
