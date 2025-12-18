<?php
ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/vk_config.php';

function respond($code, $data) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function log_pg($msg) {
    global $config;
    file_put_contents(
        ($config['log_dir'] ?? __DIR__) . '/phonepe_pg.log',
        gmdate('c')." ".$msg."\n",
        FILE_APPEND
    );
}

$input = json_decode(file_get_contents('php://input'), true);
$invoiceId = $input['invoiceId'] ?? '';
if (!$invoiceId) respond(400, ['success'=>false,'error'=>'invoiceId required']);

$meta = file_exists($config['meta_file'])
    ? json_decode(file_get_contents($config['meta_file']), true)
    : [];

if (!isset($meta[$invoiceId])) {
    respond(404, ['success'=>false,'error'=>'Invoice not found']);
}

$invoice = $meta[$invoiceId];
$phone = preg_replace('/\D/', '', $invoice['customerPhone'] ?? '');
if (empty($phone)) {
    respond(400, ['success'=>false,'error'=>'Customer phone required']);
}

// If invoice is already marked PAID in our metadata, block further payments.
// WHY: Prevent duplicate charges for the same invoice — only the backend (webhook) is trusted.
if (isset($meta[$invoiceId]['payment_status']) && strtolower($meta[$invoiceId]['payment_status']) === 'paid') {
    respond(409, ['success' => false, 'error' => 'Invoice already paid', 'invoiceId' => $invoiceId]);
}

// If we already have an initiated payment and it's pending, return the stored redirect
// WHY: PhonePe payment initiation is idempotent for the same order; reuse pending redirect to avoid duplicate orders.
$existing = $invoice['phonepe'] ?? null;
if ($existing && !empty($existing['redirectUrl']) && (strtolower($existing['state'] ?? '') === 'pending')) {
    respond(200, ['success'=>true, 'redirectUrl' => $existing['redirectUrl'], 'note' => 'Existing pending payment']);
}

// Obtain OAuth token
$tokenCh = curl_init($config['token_url']);
curl_setopt_array($tokenCh, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS => http_build_query([
        'client_id' => $config['client_id'],
        'client_version' => $config['client_version'],
        'client_secret' => $config['client_secret'],
        'grant_type' => 'client_credentials'
    ])
]);
$tokenRaw = curl_exec($tokenCh);
$tokenData = json_decode($tokenRaw, true);
curl_close($tokenCh);

if (empty($tokenData['access_token'])) {
    log_pg("TOKEN_FAIL " . ($tokenRaw ?? ''));
    respond(500, ['success'=>false,'error'=>'Auth failed']);
}

$token = $tokenData['access_token'];

// Build payment payload
$payload = [
    'merchantOrderId' => $invoiceId,
    'amount' => intval(floatval($invoice['total'] ?? 0) * 100),
    'paymentFlow' => [
        'type' => 'PG_CHECKOUT',
        'merchantUrls' => [
            'redirectUrl' => rtrim((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'], '/') . '/payment_success.php?invoice=' . urlencode($invoiceId)
        ]
    ]
];

$ch = curl_init($config['pay_url']);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: O-Bearer ' . $token
    ],
    CURLOPT_POSTFIELDS => json_encode($payload)
]);

$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

log_pg("PAY_REQ {$invoiceId} {$code} {$resp}");

$respJson = json_decode($resp, true);
if ($code !== 200 || !is_array($respJson)) {
    // Try to include server error details when available
    $err = is_array($respJson) && !empty($respJson['message']) ? $respJson['message'] : 'Payment init failed';
    respond(502, ['success'=>false,'error'=>$err, 'raw' => substr($resp ?? '',0,512)]);
}

$redirect = $respJson['redirectUrl'] ?? $respJson['paymentUrl'] ?? $respJson['url'] ?? null;
if (!$redirect) {
    respond(502, ['success'=>false,'error'=>'Redirect URL not present in payment provider response']);
}

// Save transaction details
$meta[$invoiceId]['phonepe'] = [
    'orderId'          => $respJson['orderId'],
    'merchantOrderId'  => $invoiceId,
    'state'            => 'PENDING',
    'created_at'       => gmdate('c'),
    'redirectUrl'      => $redirect
];


file_put_contents($config['meta_file'], json_encode($meta, JSON_PRETTY_PRINT), LOCK_EX);


respond(200, ['success'=>true,'redirectUrl'=>$redirect]);
