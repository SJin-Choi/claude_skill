---
name: pr-summary
description: > 
  Analyzes current branch changes and generates a PR description
  with summary, change list, and test plan.
  Use when creating a pull request or summarizing branch changes.

---

# PR 요약 생성 Skill

## 현재 Git 상태

현재 브랜치:
!`git branch --show-current`

base 브랜치와의 차이 (커밋 목록):
!`git log --oneline master..HEAD 2>/dev/null || echo "(base 브랜치와 비교할 수 없습니다)"`

변경된 파일 목록:
!`git diff --name-status master..HEAD 2>/dev/null || echo "(no changes)"`

변경 통계:
!`git diff --stat master..HEAD 2>/dev/null || echo "(no stats)"`

## 작업 지침

위의 Git 정보를 기반으로 PR 설명을 생성하세요.

### PR 설명 형식

다음 형식에서 <!-- --> 주석은 제거하고 PR 설명을 작성하세요:

```markdown
## Summary
<!-- 이 PR이 무엇을 하는지 1-3문장으로 요약 -->

## Changes
<!-- 주요 변경 사항을 불릿 포인트로 정리 -->

## Test Plan
<!-- 테스트 방법을 체크리스트로 작성 -->
```

### 규칙
- 커밋 메시지를 그대로 복사하지 말고, 변경의 목적과 영향을 설명하세요
- 기술적 세부사항보다 "왜"에 초점을 맞추세요
- 리뷰어가 변경 사항을 빠르게 파악할 수 있도록 작성하세요