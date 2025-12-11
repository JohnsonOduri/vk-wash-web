<?php
// create_invoice.php
// Receives JSON, validates, generates an HTML invoice under public_html/invoices/<orderId>.html, and appends metadata.json

header('Content-Type: application/json');

function respond($code, $payload) {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

function sanitize_text($s, $maxLen = 500) {
  $s = trim($s ?? '');
  // Strip tags and risky characters
  $s = strip_tags($s);
  $s = preg_replace('/[\x00-\x1F\x7F]/', '', $s);
  if (strlen($s) > $maxLen) $s = substr($s, 0, $maxLen);
  return $s;
}

function is_valid_order_id($id) {
  // Allow letters, numbers, dash, underscore; 3-64 length
  return preg_match('/^[A-Za-z0-9_-]{3,64}$/', $id) === 1;
}

function read_json_body() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    respond(400, ['success' => false, 'error' => 'Invalid JSON body']);
  }
  return $data;
}

try {
  $data = read_json_body();

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

  $items = $data['items'] ?? [];
  if (!is_array($items) || count($items) === 0) {
    respond(400, ['success' => false, 'error' => 'At least one item required']);
  }

  $cleanItems = [];
  $subtotal = 0.0;
  foreach ($items as $it) {
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
  $total = $subtotal ;

  // Paths
  // When uploaded to Hostinger, place this file at public_html/create_invoice.php
  // and set $baseDir to the absolute path to public_html
  $baseDir = __DIR__; // adjust if needed
  $invoiceDir = $baseDir . '/invoices';
  if (!is_dir($invoiceDir)) {
    if (!mkdir($invoiceDir, 0755, true)) {
      respond(500, ['success' => false, 'error' => 'Failed to create invoices directory']);
    }
  }

  $invoicePath = $invoiceDir . '/' . $orderId . '.html';
  $metadataPath = $invoiceDir . '/metadata.json';

  // Basic duplicate protection
  if (file_exists($invoicePath)) {
    respond(409, ['success' => false, 'error' => 'Invoice already exists for orderId']);
  }

  $createdAt = time();
  $expiresAt = $createdAt + (180 * 24 * 60 * 60); // 180 days

  // Escape content for HTML
  function e($s) { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

  // Minimal inline CSS matching a professional invoice layout
  $styles = '<style>
    body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:#f7fafc;color:#1a202c;}
    .container{max-width:800px;margin:24px auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;}
    .header{padding:24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#ffffff,#f8fafc)}
    .brand{font-weight:700;font-size:18px;color:#111827}
    .muted{color:#6b7280}
    .section{padding:16px 24px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .table{width:100%;border-collapse:collapse;margin-top:8px}
    .table th,.table td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}
    .table th{background:#f9fafb;color:#374151;font-weight:600}
    .totals{margin-top:12px;display:grid;grid-template-columns:1fr auto;gap:8px}
    .pill{display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid #e5e7eb;background:#fafafa;color:#111827;font-size:12px}
    .footer{padding:16px 24px;border-top:1px solid #e2e8f0;color:#6b7280;font-size:12px}
  </style>';

  // Build items rows
  $rows = '';
  $i = 1;
  foreach ($cleanItems as $it) {
    $rows .= '<tr>'
      . '<td>' . $i . '</td>'
      . '<td>' . e($it['description']) . '</td>'
      . '<td>' . e(number_format($it['qty'], 2)) . '</td>'
      . '<td>₹ ' . e(number_format($it['unitPrice'], 2)) . '</td>'
      . '<td>₹ ' . e(number_format($it['amount'], 2)) . '</td>'
      . '</tr>';
    $i++;
  }

  $html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    . $styles . '</head><body>'
    . '<div class="container">'
    .   '<div class="header">'
    .     '<div style="display:flex;align-items:center;gap:12px">'
    .       '<img src="/lovable-uploads/75ef8297-15b5-46ca-ab68-b833491cb6d2.png" alt="VK Wash" style="height:48px;border-radius:6px;object-fit:cover" />'
    .       '<div>'
    .         '<div class="brand">VK Wash</div>'
    .         '<div class="muted">Premium Laundry</div>'
    .       '</div>'
    .     '</div>'
    .     '<div style="text-align:right">'
    .       '<div class="pill">Invoice</div>'
    .       '<div class="muted">Order ID: ' . e($orderId) . '</div>'
    .       '<div class="muted">Date: ' . e(date('d M Y', $createdAt)) . '</div>'
    .     '</div>'
    .   '</div>'
    .   '<div class="section grid">'
    .     '<div>'
    .       '<div style="font-weight:600;margin-bottom:6px">Billed To</div>'
    .       '<div>' . e($customerName) . '</div>'
    .       '<div class="muted">' . e($customerPhone) . '</div>'
    .       ($customerAddress ? '<div class="muted">' . e($customerAddress) . '</div>' : '')
    .     '</div>'
    .     '<div>'
    .       '<div style="font-weight:600;margin-bottom:6px">From</div>'
    .       '<div>VK Wash</div>'
    .       '<div class="muted">vkwashexpress@gmail.com</div>'
    .       '<div class="muted">+91-8106549413</div>'
    .     '</div>'
    .   '</div>'
    .   '<div class="section">'
    .     '<table class="table">'
    .       '<thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>Amount</th></tr></thead>'
    .       '<tbody>' . $rows . '</tbody>'
    .     '</table>'
    .     '<div class="totals">'
    .       '<div style="font-weight:600">Total Due</div><div style="font-weight:700">₹ ' . e(number_format($total, 2)) . '</div>'
    .     '</div>'
    .   '</div>'
    .   '<div class="footer">'
    .     'Generated by VK Wash invoice system. Expires on ' . e(date('d M Y', $expiresAt)) . '. '
    .     'This link may stop working after expiry.'
    .   '</div>'
    . '</div>'
    . '</body></html>';

  if (file_put_contents($invoicePath, $html) === false) {
    respond(500, ['success' => false, 'error' => 'Failed to write invoice file']);
  }

  // Update metadata.json
  $entry = [
    'orderId' => $orderId,
    'customerName' => $customerName,
    'customerPhone' => $customerPhone,
    'createdAt' => $createdAt,
    'expiresAt' => $expiresAt,
    'total' => $total,
    'creatorIdShort' => $creatorIdShort,
    'path' => 'invoices/' . $orderId . '.html',
  ];

  $metadata = [];
  if (file_exists($metadataPath)) {
    $rawMeta = file_get_contents($metadataPath);
    $jsonMeta = json_decode($rawMeta, true);
    if (is_array($jsonMeta)) $metadata = $jsonMeta;
  }
  $metadata[] = $entry;
  file_put_contents($metadataPath, json_encode($metadata, JSON_PRETTY_PRINT));

  // Public URL (adjust domain)
  $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'vkwash.in');
  $publicUrl = $baseUrl . '/invoices/' . rawurlencode($orderId) . '.html';

  respond(200, ['success' => true, 'url' => $publicUrl, 'orderId' => $orderId]);
} catch (Throwable $e) {
  respond(500, ['success' => false, 'error' => 'Server error', 'detail' => $e->getMessage()]);
}
