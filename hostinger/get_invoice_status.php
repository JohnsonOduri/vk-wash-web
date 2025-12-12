<?php
// get_invoice_status.php
// GET ?invoice=INV-...
// Returns { success: true, invoiceId, status, payment, expires_at }
// Place in public_html/get_invoice_status.php

ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');
// allow AJAX from your domain only in production — currently permissive for convenience
if (defined('VK_DOMAIN')) {
  header('Access-Control-Allow-Origin: ' . rtrim(VK_DOMAIN, '/'));
} else {
  header('Access-Control-Allow-Origin: *');
}
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

function respond($code, $payload) {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

$invoiceId = $_GET['invoice'] ?? '';
if (!$invoiceId) respond(400, ['success' => false, 'error' => 'Missing invoice']);
$invoiceId = preg_replace('/[^A-Za-z0-9_\-]/', '', $invoiceId);

// determine metadata path
$invoicesDir = defined('VK_INVOICES_DIR') ? rtrim(VK_INVOICES_DIR, '/') : (__DIR__ . '/invoices');
$metadataPath = $invoicesDir . '/metadata.json';

if (!file_exists($metadataPath)) respond(404, ['success' => false, 'error' => 'Metadata not found']);
$metaRaw = file_get_contents($metadataPath);
$meta = json_decode($metaRaw, true);
if (!is_array($meta) || empty($meta[$invoiceId])) respond(404, ['success' => false, 'error' => 'Invoice not found']);

$entry = $meta[$invoiceId];

// selectively return safe fields
$out = [
  'success' => true,
  'invoiceId' => $invoiceId,
  'status' => $entry['payment_status'] ?? 'pending',
  'total' => isset($entry['total']) ? floatval($entry['total']) : null,
  'created_at' => $entry['created_at'] ?? null,
  'expires_at' => $entry['expires_at'] ?? null,
  'payment' => isset($entry['phonepe_transaction']) ? $entry['phonepe_transaction'] : null
];

respond(200, $out);
