"""
Tests for Python Scrapling Worker & Security Guards (Standard Library unittest)
Covers:
1. Valid URL allowlist
2. Disallowed domains rejection
3. SSRF & private IP blocking
4. Price parsing (valid, invalid, negative, zero)
5. Scheme validation
"""

import unittest
from extractor import validate_url, parse_price

class TestExtractorSecurityAndParsing(unittest.TestCase):
    def test_validate_url_allowed_domain(self):
        res = validate_url("http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html")
        self.assertTrue(res["valid"])
        self.assertEqual(res["hostname"], "books.toscrape.com")

    def test_validate_url_disallowed_domain(self):
        res = validate_url("https://malicious-site.example.com/item")
        self.assertFalse(res["valid"])
        self.assertIn("not in the authorized collection allowlist", res["error"])

    def test_validate_url_ssrf_localhost(self):
        res = validate_url("http://localhost/secret")
        self.assertFalse(res["valid"])
        self.assertIn("not in the authorized collection allowlist", res["error"])

    def test_validate_url_invalid_scheme(self):
        res = validate_url("ftp://books.toscrape.com/file")
        self.assertFalse(res["valid"])
        self.assertIn("Invalid scheme", res["error"])

    def test_parse_price_valid_gbp(self):
        res = parse_price("£51.77", currency_hint="GBP")
        self.assertIsNotNone(res)
        self.assertEqual(res["original_price"], 51.77)
        self.assertEqual(res["original_currency"], "GBP")
        self.assertEqual(res["currency"], "INR")
        self.assertEqual(res["price_in_paise"], int(round(51.77 * 105.0 * 100)))

    def test_parse_price_valid_usd(self):
        res = parse_price("$19.99", currency_hint="USD")
        self.assertIsNotNone(res)
        self.assertEqual(res["original_price"], 19.99)
        self.assertEqual(res["price_in_paise"], int(round(19.99 * 83.0 * 100)))

    def test_parse_price_invalid_strings(self):
        self.assertIsNone(parse_price(""))
        self.assertIsNone(parse_price("Free"))
        self.assertIsNone(parse_price("N/A"))
        self.assertIsNone(parse_price("-£15.00"))

    def test_parse_price_zero_rejected(self):
        self.assertIsNone(parse_price("£0.00"))

if __name__ == "__main__":
    unittest.main()
