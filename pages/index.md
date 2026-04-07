# Claude Code Skills 완전 가이드

> **대상 독자**: Claude Code Skills를 처음 접하는 사용자  
> **목표**: Skills가 무엇인지, 어떻게 동작하는지, 뭘 할 수 있는지, 어떻게 사용하는지를 완전히 이해한다.

## 가이드 구성

이 가이드는 개념 설명과 실습으로 구성되어 있습니다. 순서대로 읽는 것을 권장합니다.

### 개념
| 순서 | 페이지 | 핵심 내용 |
|------|--------|----------|
| 1 | [Skills란 무엇인가?](01-what-is-skills.md) | Skills의 개념, CLAUDE.md와 차이, 번들 vs 커스텀 |
| 2 | [Skills의 동작 원리](02-how-skills-work.md) | SKILL.md 구조, 저장 위치, 자동/수동 호출 |

### 실습
| 순서 | 페이지 | 핵심 내용 |
|------|--------|----------|
| 3 | [실습 1: 첫 번째 Skill 만들기](03-lab-first-skill.md) | explain-code Skill 생성 |
| 4 | [실습 2: 인수를 받는 Skill](04-lab-arguments.md) | $ARGUMENTS, $0, $1 치환 |
| 5 | [실습 3: 동적 컨텍스트 주입](05-lab-dynamic-context.md) | `` !`command` `` 구문 |
| 6 | [실습 4: Subagent 실행](06-lab-subagent.md) | context: fork |
| 7 | [실습 5: 시각적 출력 생성](07-lab-visual-output.md) | 스크립트 번들 패턴 |

### 레퍼런스
| 순서 | 페이지 | 핵심 내용 |
|------|--------|----------|
| 8 | [Frontmatter 필드 레퍼런스](08-frontmatter-reference.md) | 13개 필드 상세 |

---

> 이 가이드는 Claude Code Skills의 [공식 문서](https://code.claude.com/docs/ko/skills)를 기반으로 작성되었습니다.
