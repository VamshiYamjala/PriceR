"""
Scrapling Worker HTTP Service (FastAPI)
Listens on local interface (127.0.0.1:8000).
Provides /health and /extract endpoints for Express backend.
"""

import os
import re
import html
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
import requests

from extractor import validate_url, parse_price

app = FastAPI(
    title="PriceRadar Scrapling Worker",
    version="1.0.0",
    description="Isolated web extraction worker for authorized testbed catalogs."
)

class ExtractRequest(BaseModel):
    url: str
    currency: Optional[str] = "GBP"

class ExtractResponse(BaseModel):
    success: bool
    url: str
    title: Optional[str] = None
    price_in_paise: Optional[int] = None
    original_price: Optional[float] = None
    original_currency: Optional[str] = None
    currency: Optional[str] = "INR"
    availability: Optional[str] = "unknown"
    image_url: Optional[str] = None
    data_status: str = "sample"
    retrieved_at: str
    error: Optional[str] = None

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PriceRadar Scrapling Worker",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "allowed_domains": ["books.toscrape.com", "quotes.toscrape.com", "scrapingclub.com"]
    }

@app.post("/extract", response_model=ExtractResponse)
def extract_product(payload: ExtractRequest):
    # 1. SSRF & Domain Allowlist Validation
    val = validate_url(payload.url)
    if not val["valid"]:
        raise HTTPException(status_code=400, detail=val["error"])

    target_url = val["url"]
    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        # Bounded HTTP fetch with strict timeout and custom user-agent
        headers = {"User-Agent": "PriceRadar-Scrapling-Worker/1.0 (+http://localhost:5000)"}
        resp = requests.get(target_url, headers=headers, timeout=10, allow_redirects=True)

        # Validate final URL after redirects (prevent redirect SSRF)
        post_redirect_val = validate_url(resp.url)
        if not post_redirect_val["valid"]:
            raise HTTPException(status_code=400, detail=f"Redirect SSRF rejected: {post_redirect_val['error']}")

        if resp.status_code != 200:
            return ExtractResponse(
                success=False,
                url=target_url,
                data_status="unavailable",
                retrieved_at=now_iso,
                error=f"Source returned HTTP {resp.status_code}"
            )

        html_text = resp.text

        # 2. Extract Data (Specialized for books.toscrape.com testbed)
        title = None
        title_match = re.search(r"<h1>([^<]+)</h1>", html_text, re.IGNORECASE)
        if title_match:
            title = html.unescape(title_match.group(1).strip())
        else:
            title_meta = re.search(r'<title>([^<]+)</title>', html_text, re.IGNORECASE)
            if title_meta:
                title = html.unescape(title_meta.group(1).split('|')[0].strip())

        if not title:
            title = "Extracted Item"

        # Price extraction
        price_match = re.search(r'<p\s+class="price_color">([^<]+)</p>', html_text, re.IGNORECASE)
        raw_price_str = price_match.group(1) if price_match else None

        if not raw_price_str:
            # Fallback search for currency symbol + price
            alt_match = re.search(r"(?:£|&pound;|€|&euro;|\$)\s*([0-9]+\.[0-9]{2})", html_text)
            raw_price_str = alt_match.group(0) if alt_match else None

        price_data = parse_price(raw_price_str or "", payload.currency or "GBP")
        if not price_data:
            return ExtractResponse(
                success=False,
                url=target_url,
                title=title,
                data_status="unavailable",
                retrieved_at=now_iso,
                error="Could not identify a valid, positive price on product page."
            )

        # Stock availability
        availability = "in_stock"
        if "out of stock" in html_text.lower():
            availability = "out_of_stock"

        # Image extraction
        image_url = None
        img_match = re.search(r'<div\s+class="item\s+active">\s*<img\s+src="([^"]+)"', html_text, re.IGNORECASE)
        if img_match:
            rel_img = img_match.group(1).replace("../../", "")
            image_url = f"https://books.toscrape.com/{rel_img}"

        return ExtractResponse(
            success=True,
            url=target_url,
            title=title,
            price_in_paise=price_data["price_in_paise"],
            original_price=price_data["original_price"],
            original_currency=price_data["original_currency"],
            currency=price_data["currency"],
            availability=availability,
            image_url=image_url,
            data_status="sample",
            retrieved_at=now_iso,
        )

    except requests.exceptions.Timeout:
        return ExtractResponse(
            success=False,
            url=target_url,
            data_status="unavailable",
            retrieved_at=now_iso,
            error="Request timed out after 10 seconds."
        )
    except requests.exceptions.RequestException as e:
        return ExtractResponse(
            success=False,
            url=target_url,
            data_status="unavailable",
            retrieved_at=now_iso,
            error=f"Network error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
