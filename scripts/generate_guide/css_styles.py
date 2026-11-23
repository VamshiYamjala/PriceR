# scripts/generate_guide/css_styles.py

CSS_CONTENT = """
@page {
    size: A4;
    margin: 18mm 15mm 18mm 15mm;
    @top-left {
        content: "PriceRadar — Project Master Guide & MERN Interview Handbook";
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 8pt;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
    }
    @top-right {
        content: "Confidential / Study Guide";
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 8pt;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
    }
    @bottom-left {
        content: "https://github.com/VamshiYamjala/PriceR";
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 8pt;
        color: #94a3b8;
    }
    @bottom-right {
        content: "Page " counter(page);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 8pt;
        font-weight: 600;
        color: #134e4a;
    }
}

@page:first {
    margin: 0;
    @top-left { content: normal; }
    @top-right { content: normal; }
    @bottom-left { content: normal; }
    @bottom-right { content: normal; }
}

* {
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 9.5pt;
    line-height: 1.55;
    color: #1e293b;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
}

/* Cover Page */
.cover-page {
    page-break-before: auto;
    page-break-after: always;
    height: 100vh;
    min-height: 280mm;
    background: linear-gradient(145deg, #062b27 0%, #0f3d38 45%, #134e4a 80%, #1e3a34 100%);
    color: #ffffff;
    padding: 25mm 20mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
}

.cover-badge {
    display: inline-block;
    background: rgba(132, 204, 22, 0.2);
    color: #a3e635;
    border: 1px solid rgba(163, 230, 53, 0.4);
    padding: 5px 14px;
    border-radius: 9999px;
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 20px;
}

.cover-title {
    font-size: 32pt;
    font-weight: 800;
    line-height: 1.15;
    color: #ffffff;
    margin: 0 0 12px 0;
    letter-spacing: -0.02em;
}

.cover-title span {
    color: #a3e635;
}

.cover-subtitle {
    font-size: 13pt;
    font-weight: 400;
    line-height: 1.5;
    color: #cbd5e1;
    margin: 0 0 30px 0;
    max-width: 90%;
}

.cover-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 25px;
}

.cover-card {
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 12px 16px;
}

.cover-card-label {
    font-size: 8pt;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
}

.cover-card-value {
    font-size: 10pt;
    font-weight: 600;
    color: #f1f5f9;
}

.cover-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5pt;
    color: #94a3b8;
}

/* Headings */
h1 {
    color: #0f3d38;
    font-size: 19pt;
    font-weight: 800;
    line-height: 1.25;
    margin-top: 28pt;
    margin-bottom: 12pt;
    padding-bottom: 6pt;
    border-bottom: 2px solid #84cc16;
    page-break-after: avoid;
    break-after: avoid;
}

h2 {
    color: #134e4a;
    font-size: 14pt;
    font-weight: 700;
    line-height: 1.3;
    margin-top: 20pt;
    margin-bottom: 8pt;
    page-break-after: avoid;
    break-after: avoid;
}

h3 {
    color: #1e293b;
    font-size: 11pt;
    font-weight: 700;
    line-height: 1.35;
    margin-top: 14pt;
    margin-bottom: 6pt;
    page-break-after: avoid;
    break-after: avoid;
}

h4 {
    color: #334155;
    font-size: 10pt;
    font-weight: 600;
    margin-top: 10pt;
    margin-bottom: 4pt;
    page-break-after: avoid;
    break-after: avoid;
}

p {
    margin-top: 0;
    margin-bottom: 8pt;
    text-align: justify;
}

ul, ol {
    margin-top: 0;
    margin-bottom: 8pt;
    padding-left: 20px;
}

li {
    margin-bottom: 4pt;
}

/* Code styling */
code {
    font-family: "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
    color: #0f3d38;
    padding: 1.5px 4.5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

pre {
    font-family: "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace;
    font-size: 8pt;
    line-height: 1.45;
    background-color: #0b192c;
    color: #e2e8f0;
    padding: 10pt 12pt;
    border-radius: 6px;
    border: 1px solid #1e293b;
    margin-top: 6pt;
    margin-bottom: 10pt;
    overflow-x: auto;
    page-break-inside: avoid;
    break-inside: avoid;
    white-space: pre-wrap;
    word-break: break-all;
}

pre code {
    background: none;
    color: inherit;
    padding: 0;
    border: none;
    font-size: inherit;
}

.file-header {
    background-color: #1e293b;
    color: #38bdf8;
    font-family: "Cascadia Code", Consolas, monospace;
    font-size: 7.5pt;
    font-weight: 600;
    padding: 4px 10px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    border: 1px solid #334155;
    border-bottom: none;
    margin-bottom: -6pt;
    display: inline-block;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8pt;
    margin-bottom: 12pt;
    font-size: 8.5pt;
    page-break-inside: avoid;
    break-inside: avoid;
}

th {
    background-color: #0f3d38;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 6pt 8pt;
    border: 1px solid #062b27;
}

td {
    padding: 5pt 7pt;
    border: 1px solid #cbd5e1;
    vertical-align: top;
}

tr:nth-child(even) td {
    background-color: #f8fafc;
}

/* Callout Boxes */
.callout {
    border-left: 4px solid #134e4a;
    background-color: #f0fdfa;
    padding: 9pt 12pt;
    border-radius: 0 6px 6px 0;
    margin: 8pt 0 12pt 0;
    page-break-inside: avoid;
    break-inside: avoid;
}

.callout-title {
    font-weight: 700;
    color: #0f3d38;
    margin-bottom: 4pt;
    font-size: 9pt;
    display: flex;
    align-items: center;
    gap: 6px;
}

.callout-tip {
    border-left-color: #84cc16;
    background-color: #f7fee7;
}
.callout-tip .callout-title {
    color: #3f6212;
}

.callout-warning {
    border-left-color: #f59e0b;
    background-color: #fffbeb;
}
.callout-warning .callout-title {
    color: #b45309;
}

.callout-danger {
    border-left-color: #ef4444;
    background-color: #fef2f2;
}
.callout-danger .callout-title {
    color: #b91c1c;
}

.callout-arch {
    border-left-color: #0284c7;
    background-color: #f0f9ff;
}
.callout-arch .callout-title {
    color: #0369a1;
}

/* Diagrams */
.diagram-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 12pt;
    margin: 10pt 0 14pt 0;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
}

.diagram-caption {
    font-size: 8pt;
    color: #64748b;
    font-weight: 600;
    margin-top: 6pt;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Table of Contents */
.toc-container {
    page-break-before: always;
    page-break-after: always;
    padding: 10pt 0;
}

.toc-title {
    font-size: 20pt;
    font-weight: 800;
    color: #0f3d38;
    border-bottom: 2px solid #84cc16;
    padding-bottom: 8pt;
    margin-bottom: 16pt;
}

.toc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12pt 20pt;
}

.toc-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9pt;
    padding: 3pt 0;
    border-bottom: 1px dotted #cbd5e1;
}

.toc-item a {
    color: #0f3d38;
    text-decoration: none;
    font-weight: 600;
}

.toc-item a:hover {
    color: #84cc16;
}

.toc-dots {
    flex-grow: 1;
    border-bottom: 1px dotted #94a3b8;
    margin: 0 6px;
}

.toc-page {
    font-weight: 700;
    color: #64748b;
    font-size: 8.5pt;
}

/* Badges */
.badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 7.5pt;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
}

.badge-live {
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
}

.badge-sample {
    background-color: #fef9c3;
    color: #854d0e;
    border: 1px solid #fde047;
}

.badge-auth {
    background-color: #e0f2fe;
    color: #075985;
    border: 1px solid #7dd3fc;
}

.badge-post {
    background-color: #dbeafe;
    color: #1e40af;
    font-weight: 800;
}

.badge-get {
    background-color: #dcfce7;
    color: #166534;
    font-weight: 800;
}

.badge-patch {
    background-color: #fef3c7;
    color: #92400e;
    font-weight: 800;
}

.badge-delete {
    background-color: #fee2e2;
    color: #991b1b;
    font-weight: 800;
}

.badge-put {
    background-color: #fae8ff;
    color: #86198f;
    font-weight: 800;
}

/* Page Break Utility */
.page-break {
    page-break-before: always;
    break-before: page;
}

.avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
}
"""
