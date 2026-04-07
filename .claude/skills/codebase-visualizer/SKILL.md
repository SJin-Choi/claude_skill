---
name: codebase-visualizer
description: >
  Analyzes the project directory structure and generates an interactive HTML
  visualization. Use when exploring an unfamiliar codebase or documenting
  project structure.
argument-hint: [output-filename]
---

# 코드베이스 시각화 Skill

프로젝트 디렉토리 구조를 분석하여 인터랙티브한 HTML 파일을 생성합니다.

## 실행 방법

1. 번들된 Python 스크립트를 실행합니다:

```bash
python "${CLAUDE_SKILL_DIR}/generate_diagram.py" "." "$ARGUMENTS"
```

2. 스크립트 실행이 성공하면 생성된 HTML 파일의 경로를 사용자에게 알려주세요.

3. 스크립트 실행이 실패하면 에러 메시지를 분석하고 해결 방안을 제시하세요.

## 참고
- Python 3이 설치되어 있어야 합니다.
- 생성된 HTML 파일은 브라우저에서 직접 열 수 있습니다.
- .git, node_modules 등의 디렉토리는 자동으로 제외됩니다.