"""
Scrapling Worker - Security & Extraction Core
Implements SSRF protection, strict domain allowlisting, price validation,
and structured product extraction from permitted web testbeds.
"""

import re
import socket
import ipaddress
from urllib.parse import urlparse
from typing import Optional, Dict, Any

# Strict domain allowlist for authorized data collection testbeds
ALLOWED_DOMAINS = {
    "books.toscrape.com",
    "quotes.toscrape.com",
    "scrapingclub.com",
}

# Blocked private and internal IP networks
DISALLOWED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # Private class A
    ipaddress.ip_network("172.16.0.0/12"),    # Private class B
    ipaddress.ip_network("192.168.0.0/16"),   # Private class C
    ipaddress.ip_network("169.254.0.0/16"),   # Link-local / AWS metadata
    ipaddress.ip_network("::1/128"),          # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),         # IPv6 private
    ipaddress.ip_network("fe80::/10"),        # IPv6 link-local
]

def validate_url(url: str) -> Dict[str, Any]:
    """
    Validates URL scheme, domain allowlist, and prevents SSRF / DNS rebinding.
    Returns {"valid": True, "hostname": ...} or {"valid": False, "error": ...}
    """
    if not url or not isinstance(url, str):
        return {"valid": False, "error": "URL must be a non-empty string."}

    url = url.strip()
    try:
        parsed = urlparse(url)
    except Exception as e:
        return {"valid": False, "error": f"Malformed URL: {str(e)}"}

    if parsed.scheme not in ("http", "https"):
        return {"valid": False, "error": f"Invalid scheme '{parsed.scheme}'. Only http and https are permitted."}

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        return {"valid": False, "error": "URL is missing a valid hostname."}

    if hostname not in ALLOWED_DOMAINS:
        return {
            "valid": False,
            "error": f"Domain '{hostname}' is not in the authorized collection allowlist: {sorted(list(ALLOWED_DOMAINS))}"
        }

    # Resolve IP and verify not pointing to internal network (SSRF guard)
    try:
        resolved_ips = socket.getaddrinfo(hostname, None)
        for family, _, _, _, sockaddr in resolved_ips:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)
            for net in DISALLOWED_NETWORKS:
                if ip_obj in net:
                    return {"valid": False, "error": f"SSRF Guard: Domain '{hostname}' resolved to blocked IP '{ip_str}'."}
    except socket.gaierror:
        return {"valid": False, "error": f"DNS resolution failed for domain '{hostname}'."}

    return {"valid": True, "hostname": hostname, "url": url}

def parse_price(raw_text: str, currency_hint: str = "GBP") -> Optional[Dict[str, Any]]:
    """
    Safely parses price string into numeric value and integer paise.
    Never returns 0 for a missing or invalid price.
    """
    if not raw_text:
        return None

    cleaned = raw_text.replace(",", "").strip()
    # Explicitly reject negative prices
    if "-" in cleaned:
        return None

    # Matches symbols like £51.77, $19.99, Rs. 1500, 1500.50
    match = re.search(r"([0-9]+\.?[0-9]*)", cleaned)
    if not match:
        return None

    try:
        amount = float(match.group(1))
        if amount <= 0:
            return None

        # Fixed reference exchange rates for testbed catalogs
        rates_to_inr = {
            "GBP": 105.0,  # 1 GBP = ~105 INR
            "USD": 83.0,   # 1 USD = ~83 INR
            "EUR": 90.0,   # 1 EUR = ~90 INR
            "INR": 1.0,
        }
        rate = rates_to_inr.get(currency_hint.upper(), 105.0)
        price_in_paise = int(round(amount * rate * 100))

        return {
            "original_price": amount,
            "original_currency": currency_hint.upper(),
            "currency": "INR",
            "price_in_paise": price_in_paise,
        }
    except (ValueError, TypeError):
        return None
