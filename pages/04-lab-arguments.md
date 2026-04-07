[← 이전: 실습 1: 첫 번째 Skill 만들기](03-lab-first-skill.md) | [목차](index.md) | [다음: 실습 3: 동적 컨텍스트 주입 →](05-lab-dynamic-context.md)

---

# 4. 실습 2: 인수를 받는 Skill 만들기

> **이 섹션에서 배울 것**: `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N` 문자열 치환을 사용하여 인수를 받는 Skill 만들기

## 문자열 치환 이해하기

Skill은 호출 시 인수를 전달받아 그에 맞게 처리할 수 있습니다.

frontmatter에 argument-hint를 이용하여 어떤 인수가 필요한지 표기할 수 있습니다. 
 - 보여주기식으로 실제내용에선 해당 이름의 사용은 불가
 - `<>`는 필수 인수, `[]`는 선택적 인수

Skill에 인수를 전달하면, SKILL.md 안의 특수 변수가 실제 값으로 치환됩니다:

| 변수 | 의미 | 예시 입력: `/my-skill hello world` |
|------|------|-----------------------------------|
| `$ARGUMENTS` | 전달된 모든 인수 (전체 문자열) | `hello world` |
| `$ARGUMENTS[0]` | 첫 번째 인수 (0부터 시작) | `hello` |
| `$ARGUMENTS[1]` | 두 번째 인수 | `world` |
| `$0` | `$ARGUMENTS[0]`의 약자 | `hello` |
| `$1` | `$ARGUMENTS[1]`의 약자 | `world` |

추가로 환경 변수도 사용할 수 있습니다:

| 변수 | 의미 |
|------|------|
| `${CLAUDE_SESSION_ID}` | 현재 Claude 세션의 고유 ID |
| `${CLAUDE_SKILL_DIR}` | 현재 Skill의 SKILL.md가 위치한 디렉토리 경로 |

## 예제 : 기존 explain-code skills 수정

`.claude/skills/explain-code/SKILL.md`:

```markdown
---
name: explain-code
description: >
  Analyzes code or files and explains them in a beginner-friendly format:
  one-line summary, key concepts, step-by-step breakdown, execution flow diagram,
  and one improvement suggestion. Use when explaining how code works or teaching
  about a codebase.
argument-hint: <분석하고 싶은 directory or file path> <저장할 file path>
---

# 코드 설명 Skill

`$0` 을 분석하여 초보자도 이해할 수 있게 설명하세요.
설명에 대한 내용은 `$1` 에 저장합니다.

## 설명 형식

다음 형식을 따르세요:

### 1. 한줄 요약
코드가 무엇을 하는지 한 문장으로 설명합니다.

### 2. 핵심 개념
코드를 이해하는 데 필요한 프로그래밍 개념을 나열합니다.

### 3. 단계별 설명
코드를 논리적 블록으로 나누어 각 블록이 무엇을 하는지 설명합니다.
각 블록에 대해:
- 해당 코드 조각을 인용
- 이 코드가 하는 일을 평범한 언어로 설명
- 왜 이렇게 작성되었는지 이유를 설명

### 4. 실행 흐름
코드가 실행되는 순서를 다이어그램을 통하여 표현합니다.

### 5. 한 가지 개선 제안
초보자가 학습할 수 있도록 코드를 개선할 수 있는 한 가지 방법을 제안합니다.
```

## 테스트

Claude Code에서 다음과 같이 테스트해봅니다.

```
# 방법 1: 슬래시 명령어로 직접 호출 <- 성공
/explain-code src report.md

# 방법 2: 자연어로 요청 (자동 로드 테스트)
이 프로젝트의 코드를 분석하여 설명해줘
```

## 자연어 요청에 대한 개선
```markdown
---
name: explain-code
description: >
  Analyzes code or files and explains them in a beginner-friendly format:
  one-line summary, key concepts, step-by-step breakdown, execution flow diagram,
  and one improvement suggestion. Use when explaining how code works or teaching
  about a codebase.
argument-hint: <분석하고 싶은 directory or file path> <저장할 file path>
---

# 코드 설명 Skill

## 분석 대상
- `$0` 의 코드를 분석합니다.
- 자연어로 호출된 경우: 현재 프로젝트 루트(`.`)의 코드를 분석합니다.

## 저장 경로
- `$1` 에 저장합니다.
- 저장 경로가 없는 경우: `docs/code-explanation-report.md` 에 저장합니다.

## 설명 형식

다음 형식을 따르세요:

### 1. 한줄 요약
코드가 무엇을 하는지 한 문장으로 설명합니다.

### 2. 핵심 개념
코드를 이해하는 데 필요한 프로그래밍 개념을 나열합니다.

### 3. 단계별 설명
코드를 논리적 블록으로 나누어 각 블록이 무엇을 하는지 설명합니다.
각 블록에 대해:
- 해당 코드 조각을 인용
- 이 코드가 하는 일을 평범한 언어로 설명
- 왜 이렇게 작성되었는지 이유를 설명

### 4. 실행 흐름
코드가 실행되는 순서를 다이어그램을 통하여 표현합니다.

### 5. 한 가지 개선 제안
초보자가 학습할 수 있도록 코드를 개선할 수 있는 한 가지 방법을 제안합니다.
```

---

[← 이전: 실습 1: 첫 번째 Skill 만들기](03-lab-first-skill.md) | [목차](index.md) | [다음: 실습 3: 동적 컨텍스트 주입 →](05-lab-dynamic-context.md)
