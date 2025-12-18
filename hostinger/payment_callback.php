<?php
/**
 * PhonePe Standard Checkout V2 – Webhook Handler
 * SOURCE OF TRUTH
 */

ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/vk_config.php';

/**
 * Unified logger
 */
function flow_log($stage, $data = null) {
    $line = gmdate('c') . " | CALLBACK | {$stage}";
    if ($data !== null) {
        $line .= " | " . json_encode($data, JSON_UNESCAPED_SLASHES);
    }
    $line .= "\n";
    file_put_contents(__DIR__ . '/logs/payment_flow.log', $line, FILE_APPEND);
}

// ---- ENTRY ----
flow_log('WEBHOOK_HIT', getallheaders());

// Read raw body ONCE
$rawBody = file_get_contents('php://input');
flow_log('RAW_BODY', $rawBody);

$event = json_decode($rawBody, true);

if (!is_array($event) || empty($event['payload'])) {
    flow_log('INVALID_PAYLOAD');
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

$payload = $event['payload'];
$orderId = $payload['orderId'] ?? null;
$state   = strtoupper($payload['state'] ?? '');

flow_log('PAYLOAD_PARSED', [
    'orderId' => $orderId,
    'state' => $state
]);

if (!$orderId || !$state) {
    flow_log('MISSING_FIELDS');
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

// Normalize state
switch ($state) {
    case 'COMPLETED':
        $newStatus = 'paid';
        break;
    case 'FAILED':
    case 'CANCELLED':
        $newStatus = 'failed';
        break;
    default:
        $newStatus = 'pending';
}

flow_log('STATUS_DECIDED', $newStatus);

// Load metadata
$metaFile = $config['meta_file'];
$meta = file_exists($metaFile)
    ? json_decode(file_get_contents($metaFile), true)
    : [];

// Locate invoice
$invoiceId = null;
foreach ($meta as $id => $invoice) {
    if (($invoice['phonepe']['orderId'] ?? '') === $orderId) {
        $invoiceId = $id;
        break;
    }
}

flow_log('INVOICE_LOOKUP', [
    'orderId' => $orderId,
    'invoiceId' => $invoiceId
]);

if (!$invoiceId) {
    flow_log('UNKNOWN_ORDER');
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

// Idempotency
if (($meta[$invoiceId]['payment_status'] ?? '') === $newStatus) {
    flow_log('IDEMPOTENT_SKIP', $invoiceId);
    http_response_code(200);
    echo json_encode(['success' => true]);
    exit;
}

// Update metadata
$meta[$invoiceId]['payment_status'] = $newStatus;
$meta[$invoiceId]['status'] = $newStatus;
$meta[$invoiceId]['phonepe']['state'] = $state;

if ($newStatus === 'paid') {
    $meta[$invoiceId]['paid_at'] = gmdate('c');
}

file_put_contents(
    $metaFile,
    json_encode($meta, JSON_PRETTY_PRINT),
    LOCK_EX
);

flow_log('META_UPDATED', [
    'invoiceId' => $invoiceId,
    'status' => $newStatus
]);

// ---- FIREBASE UPDATE ----
if ($newStatus === 'paid') {
    require_once __DIR__ . '/firebase_update.php';
    flow_log('FIREBASE_CALL_START', $orderId);
    $ok = firebaseUpdateBillStatus($invoiceId, 'paid', 'upi');
    flow_log('FIREBASE_CALL_END', ['success' => $ok]);
}

// ACK
http_response_code(200);
echo json_encode(['success' => true]);
