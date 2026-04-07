---
name: deep-research
description: >
  Deeply analyzes a codebase topic and writes a detailed research report.
  Use when investigating how a feature works, tracing dependencies,
  identifying issues, or understanding an unfamiliar part of the codebase.
argument-hint: <topic>
context: fork
agent: Explore
---

# 심층 코드 조사 Skill

## 조사 주제
$ARGUMENTS

## 작업 절차

### 1단계: 범위 설정
조사 주제와 관련된 파일, 디렉토리, 패턴을 식별합니다.

### 2단계: 코드 탐색
- 관련 파일을 모두 읽고 분석합니다.
- grep을 활용하여 관련 패턴을 찾습니다.
- 의존성 관계를 추적합니다.

### 3단계: 분석
- 현재 구현의 장단점을 분석합니다.
- 잠재적 문제점을 식별합니다.
- 관련 베스트 프랙티스와 비교합니다.

### 4단계: 보고서 작성
다음 형식으로 보고서를 작성하세요:

#### 조사 결과 요약
- 핵심 발견 사항 (3-5개 불릿 포인트)

#### 상세 분석
- 각 발견 사항에 대한 근거와 코드 참조

#### 권장 사항
- 우선순위가 높은 순서로 개선 방안 제시

#### 관련 파일 목록
- 조사에 관련된 모든 파일 경로