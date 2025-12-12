VK Wash — PhonePe integration (Hostinger)
========================================

This folder contains the PHP endpoints and support files to add PhonePe payment buttons to public invoices hosted under `public_html/invoices`.

Important: place your secrets in `/home/<host_user>/vk_config.php` (copy from `vk_config.php.example`) — do NOT store secrets in public_html.

Files added
- `create_payment.php` — POST `{ invoiceId }` to obtain PhonePe pay page URL.
- `payment_callback.php` — PhonePe webhook endpoint (validates signature and marks invoice paid).
- `get_invoice_status.php` — GET `?invoice=INV-...` returns payment status and metadata.
- `payment_success.php` — simple user-facing thank-you page.
- `cleanup_invoices.php` — cronable cleanup to delete expired invoices and prune metadata.
- `vk_config.php.example` — example config to copy outside web root.
- `invoices_htaccess.txt` — .htaccess snippet for `public_html/invoices`.

Where to place files (Hostinger example)
- Upload PHP files into `public_html/` (root of your site) or a folder where they will be accessible: e.g., `/home/<host_user>/public_html/create_payment.php` etc.
- Invoices folder: `/home/<host_user>/public_html/invoices/`
- Config (must be outside public_html): `/home/<host_user>/vk_config.php` (copy from `vk_config.php.example`).
- Logs: `public_html/logs/` will be created by scripts if needed.

Cron for cleanup (Hostinger): run daily at 02:00
-----------------------------------------------
Use Hostinger cron UI to schedule or add this entry (adjust path):

```
/usr/bin/php /home/<host_user>/public_html/cleanup_invoices.php
```

PhonePe sandbox vs production
- Use the sandbox base URL in `vk_config.php` during testing.
- When ready, update `VK_PHONEPE_BASE_URL` and client credentials to production values and test with a low-amount payment.

Testing end-to-end (quick guide)
--------------------------------
1. Create a sample invoice (use existing `create_invoice.php`).
2. Open the invoice HTML in browser — it will show a Pay button when `payment_status` is `pending`.
3. Click Pay -> frontend POSTs to `/create_payment.php` → you get a `paymentUrl`.
4. The browser opens the PhonePe pay page (sandbox) — complete payment.
5. PhonePe calls `payment_callback.php` (webhook). The script validates the signature and marks the invoice `payment_status: paid` in `invoices/metadata.json`.
6. The invoice page polls `/get_invoice_status.php` and updates the UI to show Paid.

Security checklist
- Keep `vk_config.php` outside webroot and rotate keys regularly.
- Restrict CORS on endpoints in production (do not use `*`).
- Do not enable `display_errors` in production.
- Protect `metadata.json` if you want to hide raw totals (alternatively move it outside public_html and provide a small API to fetch status only).

Example curl tests
------------------

Create payment request (replace invoiceId):

```
curl -X POST https://vkwash.in/create_payment.php \
  -H "Content-Type: application/json" \
  -d '{"invoiceId":"INV-20251201-abc123"}' | jq .
```

Poll status:

```
curl "https://vkwash.in/get_invoice_status.php?invoice=INV-20251201-abc123" | jq .
```

Simulate callback (example):

```
curl -X POST https://vkwash.in/payment_callback.php \
  -H "Content-Type: application/json" \
  -H "X-VERIFY: <signature>" \
  -d '{"merchantTransactionId":"TXN-INV-20251201-abc123-1700000000","status":"SUCCESS","amount":42000}'
```

Sandbox signature example
-------------------------
Compute signature in the same way as the server: base64(payload) + endpointPath + clientKey, SHA-256 hex, then append `###merchantId` if required. The server code's `compute_sig` function shows the implementation used here.

Questions or next steps
- I can:
  - Add optional HEAD-check before sharing constructed URLs.
  - Move `metadata.json` outside public_html and implement a minimal status-only endpoint.
  - Add a small admin UI to list invoices and trigger re-send of webhook tests.
