# scripts/generate_guide/build_md.py
import re
import html

def html_to_markdown():
    with open("PRICERADAR_COMPLETE_STUDY_GUIDE.html", "r", encoding="utf-8") as f:
        content = f.read()

    # Strip style, head, doctype
    body_match = re.search(r"<body>(.*)</body>", content, re.DOTALL)
    if not body_match:
        return ""
    body = body_match.group(1)

    # Convert headings
    body = re.sub(r'<h1[^>]*>(.*?)</h1>', r'\n# \1\n', body)
    body = re.sub(r'<h2[^>]*>(.*?)</h2>', r'\n## \1\n', body)
    body = re.sub(r'<h3[^>]*>(.*?)</h3>', r'\n### \1\n', body)
    body = re.sub(r'<h4[^>]*>(.*?)</h4>', r'\n#### \1\n', body)

    # Convert code blocks
    body = re.sub(r'<pre><code>(.*?)</code></pre>', lambda m: f"\n```javascript\n{html.unescape(m.group(1).strip())}\n```\n", body, flags=re.DOTALL)
    body = re.sub(r'<div class="file-header">(.*?)</div>', r'> **File:** `\1`\n', body)
    body = re.sub(r'<code>(.*?)</code>', r'`\1`', body)

    # Convert Callouts
    body = re.sub(r'<div class="callout[^"]*">\s*<div class="callout-title">(.*?)</div>\s*(.*?)\s*</div>', 
                  lambda m: f"\n> ### {m.group(1)}\n> " + m.group(2).replace("\n", "\n> ") + "\n", 
                  body, flags=re.DOTALL)

    # Convert tables
    def convert_table(match):
        table_html = match.group(0)
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.DOTALL)
        if not rows:
            return ""
        
        md_table = "\n"
        # Header
        headers = re.findall(r'<th[^>]*>(.*?)</th>', rows[0], re.DOTALL)
        if headers:
            clean_headers = [re.sub(r'<[^>]+>', '', h).strip().replace('\n', ' ') for h in headers]
            md_table += "| " + " | ".join(clean_headers) + " |\n"
            md_table += "| " + " | ".join(["---"] * len(clean_headers)) + " |\n"
            data_rows = rows[1:]
        else:
            data_rows = rows

        for r in data_rows:
            cols = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
            clean_cols = [re.sub(r'<br\s*/?>', '<br>', c) for c in cols]
            clean_cols = [re.sub(r'<[^>]+>', '', c).strip().replace('\n', ' ') for c in clean_cols]
            md_table += "| " + " | ".join(clean_cols) + " |\n"
        md_table += "\n"
        return md_table

    body = re.sub(r'<table[^>]*>.*?</table>', convert_table, body, flags=re.DOTALL)

    # Convert lists
    body = re.sub(r'<ul>', '\n', body)
    body = re.sub(r'</ul>', '\n', body)
    body = re.sub(r'<ol[^>]*>', '\n', body)
    body = re.sub(r'</ol>', '\n', body)
    body = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: f"- {m.group(1).strip()}\n", body, flags=re.DOTALL)

    # Convert paragraphs and formatting
    body = re.sub(r'<p[^>]*>(.*?)</p>', r'\n\1\n', body, flags=re.DOTALL)
    body = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', body)
    body = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', body)
    body = re.sub(r'<span class="badge[^"]*">(.*?)</span>', r'[`\1`]', body)

    # Remove SVG diagrams in markdown and replace with descriptive notice
    body = re.sub(r'<div class="diagram-box">.*?<div class="diagram-caption">(.*?)</div>\s*</div>', 
                  r'\n> **[Diagram: \1]** *(See compiled PDF or HTML version for full vector illustration)*\n', 
                  body, flags=re.DOTALL)

    # Clean up excess tags and whitespace
    body = re.sub(r'<div[^>]*>', '', body)
    body = re.sub(r'</div>', '', body)
    body = html.unescape(body)
    body = re.sub(r'\n{3,}', '\n\n', body)

    header = """# PriceRadar — Complete Project Understanding & MERN Stack Interview Preparation Guide

> **Repository:** https://github.com/VamshiYamjala/PriceR  
> **Production Frontend:** https://priceradar-web.onrender.com  
> **Production Backend:** https://priceradar-api-02ib.onrender.com  
> **Frameworks:** React 18, Vite, Bootstrap 5, Node.js, Express.js, MongoDB Atlas, Mongoose, Python FastAPI, GitHub Actions  
> **Target Audience:** College Review Panels, Viva Voce Evaluators, Technical Project Managers, and Senior Developers  

---

"""
    return header + body.strip() + "\n"

if __name__ == "__main__":
    print("Generating PRICERADAR_COMPLETE_STUDY_GUIDE.md...")
    md_content = html_to_markdown()
    with open("PRICERADAR_COMPLETE_STUDY_GUIDE.md", "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Generated PRICERADAR_COMPLETE_STUDY_GUIDE.md ({len(md_content)} bytes)")
