# Validation

2026-10-26: `node --test` passed all four tests: chronological baseline with unit isolation, interval boundaries and flags, rejecting qualified OCR measurements, AES-GCM roundtrip and wrong-passphrase/tampering rejection.

Live GitHub Pages browser checks used only synthetic data, saved in temporary local browser vaults, without GitHub sync:

- Created an encrypted vault and saved a manual baseline: Hemoglobin 14.2 g/dL, interval 13–17, 2025-01-01.
- Uploaded `tests/synthetic-report.png`; bundled OCR extracted Hemoglobin 18.2 g/dL, interval 13–17.
- Reviewed and saved the scan dated 2026-10-26. Dashboard showed two reports, one marker, High, +4 g/dL vs previous and baseline.
- Opened marker history and verified both dated readings and the trend.
- Locked the vault and verified results were no longer visible.
- Created another vault using a separate passphrase and verified its history was empty.
- No errors or warnings were present in captured browser logs following OCR.

GitHub Pages deployments succeeded. Data repository creation returned private=true, and the app rejects non-private data repositories. End-to-end GitHub sync with a user's fine-grained token, real iPhone camera permission/capture, mobile layout, backup restoration and simultaneous-device conflicts have not been exercised in the browser. Real-world report formats need manual review and may need manual entry.
