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