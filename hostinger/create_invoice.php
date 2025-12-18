<?php
ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

function respond($code, $data) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, ['success' => false, 'error' => 'Invalid JSON']);
}

$orderId = trim($data['orderId'] ?? '');
if (!preg_match('/^[A-Za-z0-9_-]{3,64}$/', $orderId)) {
    respond(400, ['success' => false, 'error' => 'Invalid orderId']);
}

$cfg = require __DIR__ . '/vk_config.php';
$PUBLIC_ROOT = rtrim($cfg['base_path'], '\/') ?? '/home/u577376970/domains/vkwash.in/public_html';
$INVOICE_DIR = rtrim($cfg['invoice_path'], '\/') ?? $PUBLIC_ROOT . '/invoices';
$META_PATH  = $cfg['meta_file'] ?? $INVOICE_DIR . '/metadata.json';
$EXPIRES_DAYS = intval($cfg['invoice_expires_days'] ?? 180);

if (!is_dir($INVOICE_DIR) && !mkdir($INVOICE_DIR, 0755, true)) {
    respond(500, ['success' => false, 'error' => 'Failed to create invoices folder']);
}

$invoiceFile = $INVOICE_DIR . '/' . $orderId . '.html';
$allowOverwrite = !empty($data['allowOverwrite']);

// compute total and render rows
$items = is_array($data['items'] ?? null) ? $data['items'] : [];
$total = 0.0;
$rows = '';
$idx = 1;
foreach ($items as $it) {
    $qty = floatval($it['qty'] ?? 0);
    $unit = floatval($it['unitPrice'] ?? 0);
    $amount = $qty * $unit;
    $total += $amount;
    $desc = htmlspecialchars($it['description'] ?? ($it['name'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $rows .= "<tr><td style=\"width:40px;text-align:center;\">{$idx}</td><td>". $desc ."</td><td style=\"text-align:center;\">".number_format($qty,2)."</td><td style=\"text-align:right;\">₹ ".number_format($unit,2)."</td><td style=\"text-align:right;\">₹ ".number_format($amount,2)."</td></tr>";
    $idx++;
}

if ($total <= 0) {
    respond(400, ['success'=>false,'error'=>'Invalid invoice total']);
}

// If file exists and not allowed to overwrite, return 409 with structured payload
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
if (file_exists($invoiceFile) && !$allowOverwrite) {
    respond(409, [
        'success' => false,
        'code' => 'ALREADY_EXISTS',
        'message' => 'Invoice already exists for orderId',
        'url' => $baseUrl . '/invoices/' . $orderId . '.html',
        'orderId' => $orderId
    ]);
}

// Build HTML invoice using the production template requested
$customerName = htmlspecialchars($data['customerName'] ?? ($data['customer'] ?? 'Customer'), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$customerPhone = htmlspecialchars($data['customerPhone'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$createdAt = gmdate('j M Y');
$expiresTs = time() + ($EXPIRES_DAYS * 86400);
$expiresDate = gmdate('j M Y', $expiresTs);
$total_display = number_format($total, 2, '.', '');

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
      <div class="muted">Date: {$createdAt}</div>
    </div>
  </div>

  <div class="section grid">
    <div>
      <div style="font-weight:600;margin-bottom:6px">Billed To</div>
      <div>{$customerName}</div>
      <div class="muted">{$customerPhone}</div>
      <div class="muted"></div>
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
        {$rows}
      </tbody>
    </table>

    <div class="totals">
      <div style="text-align:right">
        <div class="label">Subtotal</div>
        <div>₹ {$total_display}</div>
        <div style="margin-top:6px" class="label">Tax (0%)</div>
        <div>₹ 0.00</div>
        <div style="margin-top:8px;font-weight:700;font-size:18px;">Total: ₹ {$total_display}</div>
      </div>
    </div>

    <div style="margin-top:18px">
      <div id="payment-status" style="font-weight:600;margin-bottom:8px">Status: <span id="ps">Pending</span></div>
      <div id="pay-controls">
        <button id="pay-btn" class="pay">Pay ₹ {$total_display}</button>
        <button onclick="window.print()" class="print" style="margin-left:10px">Print</button>
      </div>
    </div>
  </div>

  <div class="footer">
    Generated by VK Wash invoice system. Expires on {$expiresDate}. This public link will stop working after expiry.
  </div>
</div>

<script>
  const INVOICE_ID = "{$orderId}";
  const TOTAL_DISPLAY = "{$total_display}";
  const TOTAL_RAW = {$total};
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
        if (btn) {
          btn.disabled = true;
          try { btn.textContent = "Payment received"; } catch (e) {}
        }
        break;
      }
      if (s && s.success && s.status === "failed") {
        document.getElementById("ps").textContent = "Failed";
        const btn = document.getElementById("pay-btn");
        if (btn) btn.disabled = false;
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
      const redirectUrl = data.redirectUrl || data.redirectURL || data.paymentUrl || data.paymentURL || data.url;
      if (!redirectUrl) {
        btn.disabled = false;
        btn.textContent = "Pay ₹ " + TOTAL_DISPLAY;
        alert("Redirect URL not available");
        return;
      }
      const w = window.open(redirectUrl, "_blank");
      if (!w) window.location.href = redirectUrl;
      document.getElementById("ps").textContent = "Waiting for payment…";
      startPolling();
    } catch (e) {
      console.error(e);
      alert("Payment failed to start");
      btn.disabled = false;
      btn.textContent = "Pay ₹ " + TOTAL_DISPLAY;
    }
  });
  // Start a background poll immediately so the page reflects current invoice state
  startPolling();
</script>
</body>
</html>
HTML;

if (file_put_contents($invoiceFile, $html) === false) {
    respond(500, ['success'=>false,'error'=>'Failed to write invoice file']);
}

// Update metadata
$meta = [];
if (file_exists($META_PATH)) {
    $meta = json_decode(file_get_contents($META_PATH), true) ?: [];
}

$meta[$orderId] = [
    'status' => 'pending',
    'total' => $total,
    'customerName' => $data['customerName'] ?? ($data['customer'] ?? ''),
    'customerPhone' => preg_replace('/\D/', '', $data['customerPhone'] ?? ''),
    'created_at' => gmdate(DATE_ATOM),
    'file' => 'invoices/' . $orderId . '.html',
    'expiresAt' => $expiresTs,
    'payment_status' => 'pending'
];

file_put_contents($META_PATH, json_encode($meta, JSON_PRETTY_PRINT));

respond(200, [
    'success' => true,
    'url' => $baseUrl . '/invoices/' . $orderId . '.html',
    'orderId' => $orderId
]);
