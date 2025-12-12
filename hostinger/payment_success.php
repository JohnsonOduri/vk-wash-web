<?php
// payment_success.php - simple landing page after phonepe redirect
// Place in public_html/payment_success.php

ini_set('display_errors', 0);
header('Content-Type: text/html; charset=utf-8');

// sanitize invoice query param
$invoice = isset($_GET['invoice']) ? preg_replace('/[^A-Za-z0-9_\-]/', '', $_GET['invoice']) : '';

$domain = defined('VK_DOMAIN') ? rtrim(VK_DOMAIN, '/') : '';
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Payment Successful — VK Wash</title>
  <style>
    body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;background:#f7fafc;color:#111}
    .box{max-width:760px;margin:36px auto;background:#fff;padding:24px;border-radius:10px;box-shadow:0 6px 18px rgba(17,24,39,.06)}
    .muted{color:#6b7280}
    a.btn{display:inline-block;padding:10px 14px;border-radius:8px;text-decoration:none;background:#0ea5a5;color:#fff;margin-top:12px}
  </style>
</head>
<body>
  <div class="box">
    <h1>Payment Received</h1>
    <p class="muted">Thank you — we received your payment. Your invoice has been updated.</p>

    <?php if ($invoice): ?>
      <p>Invoice: <a href="<?php echo ($domain ?: '') . '/invoices/' . rawurlencode($invoice) . '.html'; ?>" target="_blank">View invoice #<?php echo htmlspecialchars($invoice); ?></a></p>
    <?php endif; ?>

    <p><a class="btn" href="<?php echo ($domain ?: '/'); ?>">Back to VK Wash</a></p>
  </div>
</body>
</html>
