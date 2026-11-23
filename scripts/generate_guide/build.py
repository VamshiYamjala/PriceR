# scripts/generate_guide/build.py
import os
import sys
import subprocess
import re

from css_styles import CSS_CONTENT
from part1_intro import get_part1_html
from part2_files import get_part2_html
from part3_tech import get_part3_html
from part4_arch import get_part4_html
from part5_flows import get_part5_html
from part6_api import get_part6_html
from part7_db import get_part7_html
from part8_monitor import get_part8_html
from part9_alerts import get_part9_html
from part10_security import get_part10_html
from part11_worker import get_part11_html
from part12_react import get_part12_html
from part13_js_qa import get_part13_html
from part14_node_qa import get_part14_html
from part15_mongo_qa import get_part15_html
from part16_git_deploy import get_part16_html
from part17_walkthrough import get_part17_html
from part18_interview_qa import get_part18_html
from part19_comparisons import get_part19_html
from part20_limitations import get_part20_html
from part21_mock_interview import get_part21_html

def get_cover_html():
    return """
<div class="cover-page">
    <div>
        <div class="cover-badge">Engineering Master Guide & Interview Handbook</div>
        <h1 class="cover-title">Price<span>Radar</span></h1>
        <div class="cover-subtitle">
            Complete Project Architecture, File Connections, Financial Precision Policy, 4-Hour Automated Cron Engine & MERN Stack Technical Interview Guide
        </div>
        
        <div class="cover-cards">
            <div class="cover-card">
                <div class="cover-card-label">Core Architecture</div>
                <div class="cover-card-value">MERN (MongoDB, Express, React 18, Node.js)</div>
            </div>
            <div class="cover-card">
                <div class="cover-card-label">Automation & Scheduling</div>
                <div class="cover-card-value">GitHub Actions (0 */4 * * *) + Render Health Probes</div>
            </div>
            <div class="cover-card">
                <div class="cover-card-label">Financial Precision</div>
                <div class="cover-card-value">Integer-Paise Currency Policy (Mongoose Validated)</div>
            </div>
            <div class="cover-card">
                <div class="cover-card-label">Notification Channels</div>
                <div class="cover-card-value">Brevo Transactional Email + Telegram Bot API</div>
            </div>
            <div class="cover-card">
                <div class="cover-card-label">Multi-Retailer Ingestion</div>
                <div class="cover-card-value">Apify Cloud Actors, eBay Browse API, Python Worker</div>
            </div>
            <div class="cover-card">
                <div class="cover-card-label">Automated Quality Assurance</div>
                <div class="cover-card-value">26 Test Suites / 277 Unit & Integration Tests</div>
            </div>
        </div>
    </div>

    <div class="cover-footer">
        <div>
            <strong>Repository:</strong> https://github.com/VamshiYamjala/PriceR<br>
            <strong>Target:</strong> College Viva Voce, Technical Project Reviews & Senior MERN Interviews
        </div>
        <div style="text-align: right;">
            <strong>Framework:</strong> Production v1.0.0 (Node 22 / React 18 / Mongo 8)<br>
            <strong>Generated:</strong> November 2026
        </div>
    </div>
</div>
"""

def get_toc_html():
    return """
<div class="toc-container">
    <div class="toc-title">Table of Contents</div>
    <div class="toc-grid">
        <div>
            <div class="toc-item"><a href="#part-1">Part 1: Complete Project Introduction</a><span class="toc-dots"></span><span class="toc-page">Ch. 1</span></div>
            <div class="toc-item"><a href="#part-2">Part 2: Complete File and Folder Structure</a><span class="toc-dots"></span><span class="toc-page">Ch. 2</span></div>
            <div class="toc-item"><a href="#part-3">Part 3: Technology Stack Deep Dive</a><span class="toc-dots"></span><span class="toc-page">Ch. 3</span></div>
            <div class="toc-item"><a href="#part-4">Part 4: Complete System Architecture</a><span class="toc-dots"></span><span class="toc-page">Ch. 4</span></div>
            <div class="toc-item"><a href="#part-5">Part 5: Complete File Connections & Code Flow</a><span class="toc-dots"></span><span class="toc-page">Ch. 5</span></div>
            <div class="toc-item"><a href="#part-6">Part 6: Complete REST API Endpoint Reference</a><span class="toc-dots"></span><span class="toc-page">Ch. 6</span></div>
            <div class="toc-item"><a href="#part-7">Part 7: Complete Database Architecture & Models</a><span class="toc-dots"></span><span class="toc-page">Ch. 7</span></div>
            <div class="toc-item"><a href="#part-8">Part 8: Automated Price Monitoring Engine</a><span class="toc-dots"></span><span class="toc-page">Ch. 8</span></div>
            <div class="toc-item"><a href="#part-9">Part 9: Alerts Evaluation & Notification Dispatch</a><span class="toc-dots"></span><span class="toc-page">Ch. 9</span></div>
            <div class="toc-item"><a href="#part-10">Part 10: Authentication, Authorization & Security</a><span class="toc-dots"></span><span class="toc-page">Ch. 10</span></div>
            <div class="toc-item"><a href="#part-11">Part 11: Python Extraction Worker Microservice</a><span class="toc-dots"></span><span class="toc-page">Ch. 11</span></div>
        </div>
        <div>
            <div class="toc-item"><a href="#part-12">Part 12: Complete React 18 Architecture & Hooks</a><span class="toc-dots"></span><span class="toc-page">Ch. 12</span></div>
            <div class="toc-item"><a href="#part-13">Part 13: Core JavaScript Interview Preparation (30 Qs)</a><span class="toc-dots"></span><span class="toc-page">Ch. 13</span></div>
            <div class="toc-item"><a href="#part-14">Part 14: Node.js & Express Interview Preparation (25 Qs)</a><span class="toc-dots"></span><span class="toc-page">Ch. 14</span></div>
            <div class="toc-item"><a href="#part-15">Part 15: MongoDB & Mongoose Interview Prep (30 Qs)</a><span class="toc-dots"></span><span class="toc-page">Ch. 15</span></div>
            <div class="toc-item"><a href="#part-16">Part 16: Git, GitHub Actions & Cloud Deployment</a><span class="toc-dots"></span><span class="toc-page">Ch. 16</span></div>
            <div class="toc-item"><a href="#part-17">Part 17: End-to-End Walkthrough of a Real Scenario</a><span class="toc-dots"></span><span class="toc-page">Ch. 17</span></div>
            <div class="toc-item"><a href="#part-18">Part 18: Complete Technical Interview Q&A (86 Qs)</a><span class="toc-dots"></span><span class="toc-page">Ch. 18</span></div>
            <div class="toc-item"><a href="#part-19">Part 19: Core Architectural Comparison Tables (20)</a><span class="toc-dots"></span><span class="toc-page">Ch. 19</span></div>
            <div class="toc-item"><a href="#part-20">Part 20: Project Limitations & Future Roadmap</a><span class="toc-dots"></span><span class="toc-page">Ch. 20</span></div>
            <div class="toc-item"><a href="#part-21">Part 21: Final Mock Interview & Last-Minute Sheet</a><span class="toc-dots"></span><span class="toc-page">Ch. 21</span></div>
        </div>
    </div>
</div>
"""

def generate_markdown(html_content):
    """
    Generates a clean, readable Markdown version of the study guide.
    """
    md = "# PriceRadar — Complete Project Understanding & MERN Stack Interview Preparation Guide\n\n"
    md += "> **Repository:** https://github.com/VamshiYamjala/PriceR  \n"
    md += "> **Stack:** MERN (MongoDB Atlas, Express.js, React 18, Node.js) + Python FastAPI + GitHub Actions  \n"
    md += "> **Audience:** College Review Panels, Viva Voce Evaluators, Technical Project Managers, and Senior Developers  \n\n"
    md += "---\n\n"

    # Simplified extraction of text content from HTML parts
    # For high quality markdown, we will write a structured representation
    return md

def main():
    print("Building PriceRadar Complete Study Guide...")
    
    html_parts = [
        get_part1_html(),
        get_part2_html(),
        get_part3_html(),
        get_part4_html(),
        get_part5_html(),
        get_part6_html(),
        get_part7_html(),
        get_part8_html(),
        get_part9_html(),
        get_part10_html(),
        get_part11_html(),
        get_part12_html(),
        get_part13_html(),
        get_part14_html(),
        get_part15_html(),
        get_part16_html(),
        get_part17_html(),
        get_part18_html(),
        get_part19_html(),
        get_part20_html(),
        get_part21_html(),
    ]
    
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PriceRadar — Complete Project Understanding & MERN Stack Interview Preparation Guide</title>
    <style>
{CSS_CONTENT}
    </style>
</head>
<body>
{get_cover_html()}
{get_toc_html()}
{''.join(html_parts)}
</body>
</html>
"""
    
    html_file = "PRICERADAR_COMPLETE_STUDY_GUIDE.html"
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated HTML source: {html_file} ({len(full_html)} bytes)")

    # Build PDF using Chrome headless
    pdf_file = "PRICERADAR_COMPLETE_STUDY_GUIDE.pdf"
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    abs_html_path = os.path.abspath(html_file)
    abs_pdf_path = os.path.abspath(pdf_file)
    file_url = f"file:///{abs_html_path.replace(os.sep, '/')}"

    print(f"Rendering PDF with browser: {chrome_path}...")
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={abs_pdf_path}",
        file_url
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(pdf_file):
        pdf_size = os.path.getsize(pdf_file)
        print(f"SUCCESS: Generated PDF {pdf_file} ({pdf_size} bytes / ~{pdf_size / 1024 / 1024:.2f} MB)")
    else:
        print(f"ERROR generating PDF: returncode={res.returncode}, stderr={res.stderr}")

if __name__ == "__main__":
    main()
