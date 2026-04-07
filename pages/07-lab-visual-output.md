[← 이전: 실습 4: Subagent 실행](06-lab-subagent.md) | [목차](index.md) | [다음: Frontmatter 필드 레퍼런스 →](08-frontmatter-reference.md)

---

# 7. 실습 5: 시각적 출력을 생성하는 Skill

> **이 섹션에서 배울 것**: 스크립트를 번들하여 HTML 같은 시각적 출력을 생성하는 Skill 만들기

## 번들 스크립트 패턴

Skill 디렉토리에 스크립트 파일(Python, Node.js 등)을 함께 넣어두면, SKILL.md에서 해당 스크립트를 참조하여 실행할 수 있습니다. `${CLAUDE_SKILL_DIR}` 변수를 사용하면 Skill 디렉토리의 절대 경로를 얻을 수 있습니다.

```
.claude/skills/codebase-visualizer/
├── SKILL.md              # Skill 정의
├── generate_diagram.py   # 시각화 스크립트
└── template.html         # HTML 템플릿 (선택)
```

## 예제: codebase-visualizer Skill

프로젝트의 디렉토리 구조와 파일 의존성을 시각적으로 보여주는 HTML 파일을 생성하는 Skill입니다.

```bash
mkdir -p .claude/skills/codebase-visualizer
```

**1. Python 스크립트 작성**

`.claude/skills/codebase-visualizer/generate_diagram.py`:

```python
#!/usr/bin/env python3
"""코드베이스 구조를 시각화하는 HTML을 생성합니다."""

import os
import sys
import json
from pathlib import Path

def scan_directory(root_path, ignore_dirs=None):
    """디렉토리를 스캔하여 트리 구조를 만듭니다."""
    if ignore_dirs is None:
        ignore_dirs = {'.git', 'node_modules', '__pycache__', '.claude', 'venv', '.venv'}
    
    tree = {"name": os.path.basename(root_path), "type": "directory", "children": []}
    
    try:
        entries = sorted(os.listdir(root_path))
    except PermissionError:
        return tree
    
    for entry in entries:
        if entry in ignore_dirs or entry.startswith('.'):
            continue
        
        full_path = os.path.join(root_path, entry)
        
        if os.path.isdir(full_path):
            child = scan_directory(full_path, ignore_dirs)
            tree["children"].append(child)
        else:
            size = os.path.getsize(full_path)
            ext = Path(entry).suffix
            tree["children"].append({
                "name": entry,
                "type": "file",
                "size": size,
                "extension": ext
            })
    
    return tree

def generate_html(tree_data, output_path):
    """트리 데이터를 HTML로 변환합니다."""
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>코드베이스 구조 시각화</title>
    <style>
        body {{ font-family: 'Segoe UI', sans-serif; margin: 20px; background: #1a1a2e; color: #e0e0e0; }}
        h1 {{ color: #00d2ff; }}
        .tree {{ margin-left: 20px; }}
        .directory {{ color: #ffd700; cursor: pointer; }}
        .directory::before {{ content: "📁 "; }}
        .file {{ color: #b0b0b0; margin-left: 20px; }}
        .file::before {{ content: "📄 "; }}
        .file .size {{ color: #666; font-size: 0.8em; }}
        .children {{ margin-left: 20px; }}
        .stats {{ background: #16213e; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .stats h2 {{ color: #00d2ff; margin-top: 0; }}
    </style>
</head>
<body>
    <h1>코드베이스 구조</h1>
    <div class="stats">
        <h2>통계</h2>
        <div id="stats"></div>
    </div>
    <div id="tree" class="tree"></div>
    <script>
        const data = {json.dumps(tree_data, ensure_ascii=False)};
        
        function countFiles(node) {{
            if (node.type === 'file') return {{ files: 1, size: node.size || 0 }};
            let result = {{ files: 0, size: 0 }};
            for (const child of (node.children || [])) {{
                const c = countFiles(child);
                result.files += c.files;
                result.size += c.size;
            }}
            return result;
        }}
        
        function renderTree(node, container) {{
            if (node.type === 'directory') {{
                const div = document.createElement('div');
                const label = document.createElement('div');
                label.className = 'directory';
                label.textContent = node.name;
                div.appendChild(label);
                
                const children = document.createElement('div');
                children.className = 'children';
                for (const child of (node.children || [])) {{
                    renderTree(child, children);
                }}
                div.appendChild(children);
                
                label.onclick = () => {{
                    children.style.display = children.style.display === 'none' ? 'block' : 'none';
                }};
                
                container.appendChild(div);
            }} else {{
                const div = document.createElement('div');
                div.className = 'file';
                const sizeStr = node.size > 1024 ? (node.size / 1024).toFixed(1) + ' KB' : node.size + ' B';
                div.innerHTML = node.name + ' <span class="size">(' + sizeStr + ')</span>';
                container.appendChild(div);
            }}
        }}
        
        const stats = countFiles(data);
        document.getElementById('stats').innerHTML = 
            '<p>총 파일 수: ' + stats.files + '</p>' +
            '<p>총 크기: ' + (stats.size / 1024).toFixed(1) + ' KB</p>';
        
        renderTree(data, document.getElementById('tree'));
    </script>
</body>
</html>"""
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"시각화 파일이 생성되었습니다: {output_path}")

if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    output = sys.argv[2] if len(sys.argv) > 2 else "codebase-structure.html"
    
    tree = scan_directory(root)
    generate_html(tree, output)
```

**2. SKILL.md 작성**

`.claude/skills/codebase-visualizer/SKILL.md`:

```markdown
---
name: codebase-visualizer
description: 프로젝트의 디렉토리 구조를 시각적 HTML로 생성합니다
argument-hint: [출력 파일명 (기본: codebase-structure.html)]
---

# 코드베이스 시각화 Skill

프로젝트 디렉토리 구조를 분석하여 인터랙티브한 HTML 파일을 생성합니다.

## 실행 방법

1. 번들된 Python 스크립트를 실행합니다:

```bash
python3 "${CLAUDE_SKILL_DIR}/generate_diagram.py" "." "$ARGUMENTS"
```

2. 스크립트 실행이 성공하면 생성된 HTML 파일의 경로를 사용자에게 알려주세요.

3. 스크립트 실행이 실패하면 에러 메시지를 분석하고 해결 방안을 제시하세요.

## 참고
- Python 3이 설치되어 있어야 합니다.
- 생성된 HTML 파일은 브라우저에서 직접 열 수 있습니다.
- .git, node_modules 등의 디렉토리는 자동으로 제외됩니다.
```

**사용 방법**:

```
/codebase-visualizer project-overview.html
```

> **번들 스크립트 패턴의 장점**: SKILL.md의 마크다운 지침만으로는 복잡한 데이터 처리나 파일 생성이 어렵습니다. Python, Node.js 등의 스크립트를 함께 번들하면 시각화, 데이터 분석, 파일 변환 등 다양한 작업을 수행할 수 있습니다.

---

[← 이전: 실습 4: Subagent 실행](06-lab-subagent.md) | [목차](index.md) | [다음: Frontmatter 필드 레퍼런스 →](08-frontmatter-reference.md)
