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