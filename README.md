# Ledger / Haifa

Blood work tracking for mobile and desktop. Capture a camera image, process it locally with bundled English Tesseract OCR, review rows, and save encrypted results. Each vault has a separate ID and passphrase. No clinical interpretation is generated.

## Run

Node 22 or newer: `node server.mjs`, then open http://localhost:4173. Run tests with `node --test`. No dependency installation is required. OCR assets are bundled at fixed versions with their license notices.

## GitHub hosting and data

`haifa` is a public source repository and contains a Pages deployment workflow that publishes **only `app/`**. Settings → Pages → GitHub Actions is the publishing source. The application shell is publicly visible. It contains no health records, access tokens, or encryption keys.

Use the separate **private** `Kap-Tan/haifa-data` repository for ciphertext. Never enable Pages on the data repository. For other independent users, create separate private data repositories owned by them; do not share repository credentials. Shared data repository collaborators can read, overwrite or delete each other's encrypted files, even though passphrases prevent decryption. Separate repositories are the authorization boundary; vault IDs alone are not access control.

Create a fine-grained GitHub token restricted to that user's data repository with Contents read/write access and a short expiry. Enter it in the application's GitHub connection form, not in chat or source code. Tokens and passphrases remain in memory and clear on lock or page close. Connect before unlocking to read the latest remote copy. Each device must enter the same repository, vault ID and passphrase to sync.

To create a vault, use a unique opaque vault ID and at least a 16-character, high-entropy passphrase. Avoid personal names in vault IDs: filenames and commit times remain visible to repository collaborators. Vault data is encrypted using AES-256-GCM with random IV and salt, and PBKDF2-SHA256 with 600,000 iterations. Ciphertext is cached in localStorage; no raw report image is saved. Download encrypted backups. A lost passphrase cannot be recovered.

GitHub writes use blob SHA checks. A conflict requires locking and reopening the latest vault before re-entering unsaved changes. A remote write failure leaves the active report unsaved. A local storage failure after a successful remote write may still leave the remote copy saved; reopen from GitHub. There is no background sync. Don't edit simultaneously on multiple devices.

## Scan and comparison limits

English OCR runs on the device. It supports candidate rows in the form `Test name 14.2 g/dL 13.0-17.0`. Different report layouts, qualitative results, inequalities, scientific notation, decimals using commas, and missing units/ranges need manual entry. Raw OCR text remains available for review. Extraction can miss rows; always check every item against the original report. The lab name and collection date are manually entered. PDF uploads are supported up to 20 MB and 20 pages. Text-based PDFs are read directly; scanned pages use on-device OCR. The first page is previewed. Password-protected PDFs need an unlocked copy. Check every page against the extracted rows.

Baseline is the earliest dated result for an exact test name (case/whitespace normalized) and unit, not a clinical target. Reference flags use the interval entered on that particular report. No unit conversions or fuzzy test-name merging are performed. Same-date results are ordered by stable report ID; use distinct collection dates to avoid ambiguity. Trend points are spaced by reading, not elapsed days. Deleting a report recalculates baseline and previous results.

## Security and deployment limits

This is a personal tracker, not an audited medical records service. GitHub authentication controls repository access; vault passphrases protect content. It does not provide email/password application accounts, account recovery, organization administration or a clinical compliance guarantee. Independent users connect their own GitHub accounts through individual restricted tokens. A malicious site update, browser extension, compromised device or weak passphrase can defeat protection while a vault is open. Use a dedicated trusted browser and only trusted source deployments. Auto-lock happens after five minutes of inactivity; a busy operation delays locking. Clear device browser storage when retiring a device.

Git history and backups retain encrypted old records after deletion. Revoking access does not erase previously downloaded ciphertext. Passphrase rotation and secure purge are not implemented. Do not commit plaintext data or secrets. Pages deployment requires GitHub Actions availability; verify workflow completion before using the hosted app.

OCR: Tesseract.js 5.1.1, Tesseract.js-core 5.1.1, English tessdata 4.0.0. See `app/vendor/` license notices. `download-ocr.mjs` refreshes those fixed assets for development; deployed scanning makes no external OCR requests.

PDF reading: bundled PDF.js 5.7.284 with local worker, character maps, fonts and image decoder assets. No report is sent to an external PDF service.

