[← 이전: 실습 5: 시각적 출력 생성](07-lab-visual-output.md) | [목차](index.md) | [다음: 활용 팁 & 문제 해결 →](09-tips-and-troubleshooting.md)

---

# 8. Frontmatter 필드 레퍼런스

> **이 섹션에서 배울 것**: SKILL.md frontmatter에서 사용할 수 있는 모든 필드와 그 용도

## 전체 필드 목록

| 필드 | 설명 |
|------|------|
| `name` | Skill의 표시 이름. 소문자, 숫자, 하이픈(`-`)만 사용 가능 |
| `description` | Skill에 대한 설명. Claude가 자동 로드 여부를 판단하는 데 사용 |
| `argument-hint` | `/` 메뉴에서 자동완성 시 표시되는 인수 힌트 |
| `disable-model-invocation` | `true`면 Claude의 자동 로드 방지. 수동 호출(`/name`)으로만 사용 가능 |
| `user-invocable` | `false`면 `/` 메뉴에서 숨김. 다른 Skill이나 자동 로드로만 사용 |
| `allowed-tools` | Skill 실행 시 허용할 도구 목록(사용해도 되는지 Claude가 따로 물어보지 않음) |
| `model` | Skill 실행에 사용할 모델 지정 |
| `effort` | 노력 수준 설정 (응답 품질과 속도의 균형) |
| `context` | `fork`로 설정하면 별도 subagent에서 실행 |
| `agent` | subagent 유형 지정 (`Explore`, `Plan`, `general-purpose` 또는 커스텀) |
| `hooks` | 라이프사이클 hooks 정의 |
| `paths` | 이 skill이 활성화되는 시기를 제한하는 Glob 패턴, 설정하면 Claude는 패턴과 일치하는 파일로 작업할 때만 자동으로 skill을 로드 |
| `shell` | skill의 `` !`command` ``블록에 사용할 shell 지정 (`bash` 또는 `powershell`) |

## 자주 사용하는 조합 예시

**1. 기본적인 수동 호출 Skill**
```yaml
---
name: my-skill
description: 이 Skill이 하는 일
argument-hint: <필요한 인수>
---
```

**2. 자동 전용 Skill (슬래시 메뉴에 표시하지 않음)**
```yaml
---
name: auto-lint
description: 코드 변경 시 자동으로 린트를 실행합니다
user-invocable: false
---
```

**3. 수동 전용 Skill (자동 로드 방지)**
```yaml
---
name: dangerous-cleanup
description: 불필요한 파일을 삭제합니다
disable-model-invocation: true
---
```

**4. 필요한 도구에 대한 권한을 사전에 갖고 있는 Skill**
```yaml
---
name: safe-review
description: 코드를 읽기만 하고 수정하지 않는 리뷰
allowed-tools: Read Grep Glob
---
```

**5. Subagent에서 실행하는 Skill**
```yaml
---
name: full-audit
description: 전체 코드베이스를 감사합니다
context: fork
agent: research
---
```

---

[← 이전: 실습 5: 시각적 출력 생성](07-lab-visual-output.md) | [목차](index.md) | [다음: 활용 팁 & 문제 해결 →](09-tips-and-troubleshooting.md)
