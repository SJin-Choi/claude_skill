[← 이전: Skills의 동작 원리](02-how-skills-work.md) | [목차](index.md) | [다음: 실습 2: 인수를 받는 Skill →](04-lab-arguments.md)

---

# 3. 실습 1: 첫 번째 Skill 만들기

> **이 섹션에서 배울 것**: Skill 디렉토리 구조 생성, 기본적인 SKILL.md 작성, Skill 테스트 방법

## 목표

코드를 설명해주는 `explain-code` Skill을 만들어 봅니다. 

이 Skill은 사용자가 `/explain-code`를 입력하면 현재 열려있는 코드를 초보자도 이해할 수 있게 설명합니다. 

우리는 개인 설정이 아닌 프로젝트 기반의 skills로 진행합니다.

Claude Code Docs의 공식 예제를 기반으로 진행됩니다.

## 단계 1: 디렉토리 생성

프로젝트 단위로 Skill을 만들려면, 프로젝트 루트에서 다음 디렉토리를 생성합니다.

```bash
# 프로젝트 루트에서 실행
mkdir -p .claude/skills/explain-code
```


## 단계 2: SKILL.md 작성

`.claude/skills/explain-code/SKILL.md` 파일을 생성하고 다음 내용을 작성합니다.

```markdown
---
name: explain-code
description: >
  Analyzes code or files and explains them in a beginner-friendly format:
  one-line summary, key concepts, step-by-step breakdown, execution flow diagram,
  and one improvement suggestion. Use when explaining how code works or teaching
  about a codebase.
---

# 코드 설명 Skill

사용자가 제공한 코드 또는 파일을 분석하여 초보자도 이해할 수 있게 설명하세요.
설명에 대한 내용은 explain-code-report.md에 저장합니다.

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

## 단계 3: 테스트

Claude Code에서 다음과 같이 테스트합니다:

```
# 방법 1: 슬래시 명령어로 직접 호출
/explain-code

# 방법 2: 자연어로 요청 (자동 로드 테스트)
이 프로젝트의 코드를 분석하여 설명해줘
```

> **확인 포인트**: Claude가 위에서 정의한 형식(한줄 요약, 핵심 개념, 단계별 설명, 실행 흐름, 개선 제안)을 따라 설명하면 Skill이 제대로 동작하는 것입니다.

## SKILL.md에 포함되면 좋은 2가지 content 유형

### 1. Reference
- Claude가 작업에 적용할때 필요한 지식을 추가합니다.
- 각종 리소스 및 스타일 가이드, 도메인 지식등이 포함됩니다.

```markdown
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```
### 2. Task
- 특정 작업에 대한 단계별 지침을 제공
```markdown
---
name: deploy
description: Deploy the application to production
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```
---

[← 이전: Skills의 동작 원리](02-how-skills-work.md) | [목차](index.md) | [다음: 실습 2: 인수를 받는 Skill →](04-lab-arguments.md)
