# PriceRadar — Permanent Error & Troubleshooting Log

**Project Name:** PriceRadar  
**Authoritative Reference:** `docs/01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf`  
**Target Repository:** `https://github.com/VamshiYamjala/PriceR.git`  
**Development Workspace:** `D:\priceR`  
**Last Updated:** 2026-10-14  

---

## Error Handling Protocol

Whenever an error occurs during development:
1. Consult this log first to verify whether the error has been encountered previously.
2. Formulate a hypothesis and identify the root cause before modifying code.
3. Apply the minimal necessary fix without introducing unintended side effects.
4. Run verification tests to confirm the fix works.
5. Record the error, root cause, attempted solution, and verification evidence in this log.

### Status Definitions
- **OPEN:** Error identified, diagnosis in progress.
- **INVESTIGATING:** Hypothesis formulated, fix being developed.
- **FIXED:** Fix implemented, awaiting test verification.
- **VERIFIED:** Solution tested and confirmed passing with evidence.
- **REOPENED:** Error recurred after being marked resolved.

---

## Recorded Errors & Solutions

### ERR-001: Python PDF Text Extraction Unicode Encoding Error
- **Date & Time:** 2026-10-14 13:03 IST
- **Phase / Feature:** Phase 1 — Project Inspection & Guide Extraction
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  UnicodeEncodeError: 'charmap' codec can't encode character '\ufb01' in position 38: character maps to <undefined>
  ```
- **Relevant Command / File:** `python -c "import pypdf..."` on `docs/01-MASTER-PROJECT-DEVELOPMENT-GUIDE.pdf`
- **Root Cause:**
  Windows default PowerShell console encoding is `cp1252` (Windows ANSI). The PDF text extracted by `pypdf` contains typographic ligatures such as `\ufb01` ("fi" ligature), which cannot be mapped into the `cp1252` character set when printed to standard output without explicit UTF-8 reconfiguration.
- **Diagnostic Steps Performed:**
  Inspected the exception traceback. The failure occurred inside `encodings\cp1252.py` on line 19 during standard library stdout encoding.
- **Solution Attempted:**
  Reconfigured standard output encoding to UTF-8 at the script entrypoint:
  ```python
  import sys
  sys.stdout.reconfigure(encoding='utf-8')
  ```
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  The subsequent execution extracted headings across all 5 PDF documents cleanly with zero encoding errors.
- **Files Changed:** Scratch inline python inspection scripts.
- **Prevention Steps:**
  Always specify `sys.stdout.reconfigure(encoding='utf-8')` or run scripts under Python with `PYTHONIOENCODING=utf-8` on Windows systems.
- **Related Errors:** None.

---

### ERR-002: Remote Repository Host Resolution Failure
- **Date & Time:** 2026-10-14 13:01 IST
- **Phase / Feature:** Phase 1 — Git & GitHub Remote Inspection
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  fatal: unable to access 'https://github.com/VamshiYamjala/PriceR.git/': Could not resolve host: github.com
  ```
- **Relevant Command / File:** `git ls-remote https://github.com/VamshiYamjala/PriceR.git`
- **Root Cause:**
  Temporary transient local DNS resolution failure in the environment.
- **Diagnostic Steps Performed:**
  1. Ran `git ls-remote` (failed with host resolution).
  2. Ran `Test-Connection -ComputerName github.com -Quiet` (returned `True`).
  3. Formatted repository and attempted authenticated push via Git Credential Manager.
- **Solution Attempted:**
  Initial commit created, branch tracking configured, and pushed directly via `git push -u origin main`.
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  `git push -u origin main` succeeded with `branch 'main' set up to track 'origin/main'` and remote SHA `69f9ec8`.
- **Files Changed:** None.
- **Prevention Steps:** Use Git Credential Manager for HTTPS communication with GitHub.
- **Related Errors:** None.

---

### ERR-003: TDZ ReferenceError in priceComparison.test.js
- **Date & Time:** 2026-10-14 13:24 IST
- **Phase / Feature:** Phase 2 Task D — Price Comparison Unit Testing
- **Status:** VERIFIED
- **Exact Error Message:**
  ```text
  ReferenceError: Cannot access 'lowest' before initialization
  at Object.lowest (tests/priceComparison.test.js:39:38)
  ```
- **Relevant Command / File:** `npm test -- tests/priceComparison.test.js`
- **Root Cause:**
  In `server/tests/priceComparison.test.js`, line 39 accidentally referenced `lowest` inside its own initializer (`const lowest = findLowestOffer(lowest ? offers : offers)`), hitting the JavaScript Temporal Dead Zone (TDZ).
- **Diagnostic Steps Performed:**
  Inspected test failure stack trace at line 39.
- **Solution Attempted:**
  Corrected line 39 to pass `offers` directly: `const lowest = findLowestOffer(offers)`.
- **Whether Solution Worked:** Yes.
- **Verification Evidence:**
  Re-ran full Jest test suite. 6/6 test suites passed with all 45 unit tests green.
- **Files Changed:** `server/tests/priceComparison.test.js`.
- **Prevention Steps:** Carefully review test argument expressions before execution.
- **Related Errors:** None.
