<?php
// create_invoice.php
// Safe invoice creator (writes public HTML and metadata). Production-ready.
// Place this file in public_html/create_invoice.php

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');
header('Content-Type: application/json; charset=utf-8');

/* ---------- Helpers ---------- */

function respond($code, $payload) {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

function sanitize_text($s, $maxLen = 500) {
  $s = trim($s ?? '');
  $s = strip_tags($s);
  $s = preg_replace('/[\x00-\x1F\x7F]/u', '', $s);
  if (mb_strlen($s) > $maxLen) $s = mb_substr($s, 0, $maxLen);
  return $s;
}

function is_valid_order_id($id) {
  return preg_match('/^[A-Za-z0-9_-]{3,64}$/', $id) === 1;
}

function e($s) {
  return htmlspecialchars($s ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/* ---------- Read JSON ---------- */

$raw = @file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  respond(400, ['success' => false, 'error' => 'Invalid JSON body']);
}

try {

  // Validate & sanitize inputs
  $orderId = sanitize_text($data['orderId'] ?? '', 64);
  if (!is_valid_order_id($orderId)) {
    respond(400, ['success' => false, 'error' => 'Invalid orderId']);
  }

  $customerName = sanitize_text($data['customerName'] ?? '', 100);
  $customerPhone = sanitize_text($data['customerPhone'] ?? '', 20);
  $customerAddress = sanitize_text($data['customerAddress'] ?? '', 200);
  $creatorIdShort = sanitize_text($data['creatorIdShort'] ?? '', 16);
  $taxRatePct = floatval($data['taxRatePct'] ?? 0);
  if ($taxRatePct < 0 || $taxRatePct > 100) $taxRatePct = 0;

  $itemsRaw = $data['items'] ?? [];
  if (!is_array($itemsRaw) || count($itemsRaw) === 0) {
    respond(400, ['success' => false, 'error' => 'At least one item required']);
  }

  $cleanItems = [];
  $subtotal = 0.0;
  foreach ($itemsRaw as $it) {
    $desc = sanitize_text($it['description'] ?? '', 200);
    $qty = floatval($it['qty'] ?? 0);
    $unit = floatval($it['unitPrice'] ?? 0);
    if ($qty <= 0 || $unit < 0 || $desc === '') continue;
    $amount = $qty * $unit;
    $subtotal += $amount;
    $cleanItems[] = ['description' => $desc, 'qty' => $qty, 'unitPrice' => $unit, 'amount' => $amount];
  }

  if (count($cleanItems) === 0) {
    respond(400, ['success' => false, 'error' => 'No valid items']);
  }

  $taxAmount = $subtotal * ($taxRatePct / 100.0);
  $total = $subtotal + $taxAmount;

  /* ---------- Paths & URL ---------- */
  $baseDir = __DIR__; // public_html
  $invoiceDir = $baseDir . '/invoices';
  if (!is_dir($invoiceDir)) {
    if (!mkdir($invoiceDir, 0755, true)) {
      respond(500, ['success' => false, 'error' => 'Failed to create invoices directory']);
    }
  }

  $invoicePath = $invoiceDir . '/' . $orderId . '.html';
  $metadataPath = $invoiceDir . '/metadata.json';

  // Construct base URL (trusting HTTP_HOST)
  $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'vkwash.in';
  $baseUrl = $scheme . '://' . $host;
  $publicUrl = $baseUrl . '/invoices/' . rawurlencode($orderId) . '.html';

  // Duplicate protection
  if (file_exists($invoicePath)) {
    respond(409, ['success' => false, 'code' => 'ALREADY_EXISTS', 'message' => 'Invoice already exists for orderId', 'url' => $publicUrl]);
  }

  $createdAt = time();
  $expiresAt = $createdAt + (180 * 24 * 60 * 60);

  /* ---------- Build invoice HTML via HEREDOC (safe injection with json_encode for JS) ---------- */

  // Build items table rows (escaped)
  $rowsHtml = '';
  $idx = 1;
  foreach ($cleanItems as $it) {
    $rowsHtml .= '<tr>'
      . '<td style="width:40px;text-align:center;">' . e($idx) . '</td>'
      . '<td>' . e($it['description']) . '</td>'
      . '<td style="text-align:center;">' . e(number_format($it['qty'], 2)) . '</td>'
      . '<td style="text-align:right;">₹ ' . e(number_format($it['unitPrice'], 2)) . '</td>'
      . '<td style="text-align:right;">₹ ' . e(number_format($it['amount'], 2)) . '</td>'
      . '</tr>';
    $idx++;
  }

  // Values to inject into JS — use json_encode to make them safe JS literals
  $jsInvoiceId = json_encode($orderId);
  $jsTotal = json_encode(number_format($total, 2));
  $jsTotalRaw = json_encode($total); // numeric in JS if needed

  $expiryDate = e(date('d M Y', $expiresAt));
  $createdDate = e(date('d M Y', $createdAt));
  $subtotalFmt = e(number_format($subtotal, 2));
  $taxAmountFmt = e(number_format($taxAmount, 2));
  $totalFmt = e(number_format($total, 2));

  $html = <<<HTML
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice {$orderId} - VK Wash</title>
<style>
  body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:#f7fafc;color:#111827;margin:0}
  .container{max-width:800px;margin:28px auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e6edf3}
  .header{padding:20px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eef2f6}
  .brand{font-weight:700;font-size:18px}
  .muted{color:#6b7280}
  .section{padding:18px 24px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .table{width:100%;border-collapse:collapse;margin-top:8px}
  .table th,.table td{border-bottom:1px solid #f1f5f9;padding:10px;text-align:left}
  .table th{background:#fbfdfe;color:#374151;font-weight:600;text-align:left}
  .totals{margin-top:12px;display:flex;justify-content:flex-end;gap:12px;align-items:center}
  .totals .label{font-weight:600}
  .pill{display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid #eef2f6;background:#f8fafc;color:#111827;font-size:12px}
  .footer{padding:14px 24px;border-top:1px solid #eef2f6;color:#6b7280;font-size:12px}
  button.pay{background:#059669;color:#fff;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600}
  button.print{background:#fff;border:1px solid #d1d5db;padding:8px 12px;border-radius:8px;cursor:pointer}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div style="display:flex;gap:12px;align-items:center">
      <img src="/lovable-uploads/75ef8297-15b5-46ca-ab68-b833491cb6d2.png" alt="VK Wash" style="height:44px;border-radius:6px;object-fit:cover" />
      <div>
        <div class="brand">VK Wash</div>
        <div class="muted">Premium Laundry</div>
      </div>
    </div>
    <div style="text-align:right">
      <div class="pill">Invoice</div>
      <div class="muted" style="margin-top:6px">Order ID: {$orderId}</div>
      <div class="muted">Date: {$createdDate}</div>
    </div>
  </div>

  <div class="section grid">
    <div>
      <div style="font-weight:600;margin-bottom:6px">Billed To</div>
      <div>{$customerName}</div>
      <div class="muted">{$customerPhone}</div>
      <div class="muted">{$customerAddress}</div>
    </div>
    <div>
      <div style="font-weight:600;margin-bottom:6px">From</div>
      <div>VK Wash</div>
      <div class="muted">vkwashexpress@gmail.com</div>
      <div class="muted">+91-8106549413</div>
    </div>
  </div>

  <div class="section">
    <table class="table" aria-label="Invoice items">
      <thead><tr><th style="width:40px">#</th><th>Description</th><th style="width:96px;text-align:center">Qty</th><th style="width:140px;text-align:right">Unit</th><th style="width:140px;text-align:right">Amount</th></tr></thead>
      <tbody>
        {$rowsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div style="text-align:right">
        <div class="label">Subtotal</div>
        <div>₹ {$subtotalFmt}</div>
        <div style="margin-top:6px" class="label">Tax ({$taxRatePct}%)</div>
        <div>₹ {$taxAmountFmt}</div>
        <div style="margin-top:8px;font-weight:700;font-size:18px;">Total: ₹ {$totalFmt}</div>
      </div>
    </div>

    <div style="margin-top:18px">
      <div id="payment-status" style="font-weight:600;margin-bottom:8px">Status: <span id="ps">Pending</span></div>
      <div id="pay-controls">
        <button id="pay-btn" class="pay">Pay ₹ {$totalFmt}</button>
        <button onclick="window.print()" class="print" style="margin-left:10px">Print</button>
      </div>
    </div>
  </div>

  <div class="footer">
    Generated by VK Wash invoice system. Expires on {$expiryDate}. This public link will stop working after expiry.
  </div>
</div>

<script>
  const INVOICE_ID = {$jsInvoiceId};
  const TOTAL_DISPLAY = {$jsTotal};
  const TOTAL_RAW = {$jsTotalRaw};
  const POLL_INTERVAL = 5000; // ms
  async function fetchStatus() {
    try {
      const r = await fetch("/get_invoice_status.php?invoice=" + encodeURIComponent(INVOICE_ID));
      if (!r.ok) return null;
      const j = await r.json();
      return j;
    } catch (e) { return null; }
  }
  async function startPolling() {
    const start = Date.now();
    while (Date.now() - start < 5 * 60 * 1000) {
      const s = await fetchStatus();
      if (s && s.success && s.status === "paid") {
        document.getElementById("ps").textContent = "Paid";
        const btn = document.getElementById("pay-btn");
        if (btn) btn.style.display = "none";
        break;
      }
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
  }

  document.getElementById("pay-btn").addEventListener("click", async function () {
    const btn = this;
    btn.disabled = true;
    btn.textContent = "Connecting…";
    try {
      const resp = await fetch("/create_payment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: INVOICE_ID })
      });
      const text = await resp.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
      if (!resp.ok || !data || !data.success) {
        btn.disabled = false;
        btn.textContent = "Pay ₹ " + TOTAL_DISPLAY;
        alert((data && (data.error || data.message)) || "Failed to initiate payment");
        return;
      }
      const paymentUrl = data.paymentUrl || data.paymentURL || data.url;
      if (!paymentUrl) {
        btn.disabled = false;
        btn.textContent = "Pay ₹ " + TOTAL_DISPLAY;
        alert("Payment URL not available");
        return;
      }
      const w = window.open(paymentUrl, "_blank");
      if (!w) window.location.href = paymentUrl;
      document.getElementById("ps").textContent = "Waiting for payment…";
      startPolling();
    } catch (e) {
      console.error(e);
      alert("Payment failed to start");
      btn.disabled = false;
      btn.textContent = "Pay ₹ " + TOTAL_DISPLAY;
    }
  });
</script>
</body>
</html>
HTML;

  /* ---------- Write invoice file ---------- */
  if (@file_put_contents($invoicePath, $html) === false) {
    respond(500, ['success' => false, 'error' => 'Failed to write invoice file']);
  }

  /* ---------- Update metadata.json atomically ---------- */
  $entry = [
    'file' => 'invoices/' . $orderId . '.html',
    'created_at' => gmdate(DATE_ATOM, $createdAt),
    'expires_at' => gmdate(DATE_ATOM, $expiresAt),
    'creatorIdShort' => $creatorIdShort,
    'total' => round($total, 2),
    'payment_status' => 'pending',
    'phonepe_transaction' => null,
  ];

  $metadata = [];
  if (file_exists($metadataPath)) {
    $rawMeta = @file_get_contents($metadataPath);
    $jsonMeta = json_decode($rawMeta, true);
    if (is_array($jsonMeta)) $metadata = $jsonMeta;
  }
  $metadata[$orderId] = $entry;

  // atomic write with lock
  $fp = @fopen($metadataPath, 'c+');
  if ($fp === false) {
    // fallback: try direct write but still report error if it fails
    if (@file_put_contents($metadataPath, json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) === false) {
      respond(500, ['success' => false, 'error' => 'Failed to write metadata file']);
    }
  } else {
    if (!flock($fp, LOCK_EX)) {
      fclose($fp);
      respond(500, ['success' => false, 'error' => 'Failed to obtain lock for metadata file']);
    }
    ftruncate($fp, 0);
    rewind($fp);
    if (fwrite($fp, json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) === false) {
      flock($fp, LOCK_UN);
      fclose($fp);
      respond(500, ['success' => false, 'error' => 'Failed to write metadata file']);
    }
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
  }

  respond(200, ['success' => true, 'url' => $publicUrl, 'orderId' => $orderId]);

} catch (Throwable $e) {
  error_log('create_invoice error: ' . $e->getMessage());
  respond(500, ['success' => false, 'error' => 'Server error']);
}
