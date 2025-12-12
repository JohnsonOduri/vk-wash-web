<?php
// create_payment.php
// POST JSON { "invoiceId": "INV-..." }
// Returns { success:true, paymentUrl: "...", transactionId: "..." }
// Production-ready PaymentLink integration (PhonePe)

// Bootstrap / config
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$configPath = '/home/u577376970/domains/vkwash.in/vk_config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server configuration missing']);
    exit;
}
require_once $configPath;

// ensure logs dir
$logsDir = rtrim(VK_LOGS_DIR ?: (__DIR__ . '/logs'), '/');
if (!is_dir($logsDir)) @mkdir($logsDir, 0755, true);
$phonepeLog = $logsDir . '/phonepe.log';
ini_set('error_log', $logsDir . '/error.log');

header('Content-Type: application/json');

// small helper
function respond($code, $payload) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

// CORS (restrict in prod if needed)
if (defined('VK_DOMAIN')) {
    header('Access-Control-Allow-Origin: ' . rtrim(VK_DOMAIN, '/'));
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-VERIFY');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    respond(204, ['success' => true]);
}

// read request
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data) || empty($data['invoiceId'])) {
    respond(400, ['success' => false, 'error' => 'Missing invoiceId']);
}
$invoiceId = preg_replace('/[^A-Za-z0-9_\-]/', '', $data['invoiceId']);

// metadata path
$metadataPath = rtrim(VK_INVOICES_DIR, '/') . '/metadata.json';
if (!file_exists($metadataPath)) {
    respond(404, ['success' => false, 'error' => 'No invoices metadata found']);
}
$metaRaw = file_get_contents($metadataPath);
$meta = json_decode($metaRaw, true);
if (!is_array($meta) || empty($meta[$invoiceId])) {
    respond(404, ['success' => false, 'error' => 'Invoice not found']);
}
$entry = $meta[$invoiceId];

// if already paid
if (!empty($entry['payment_status']) && $entry['payment_status'] === 'paid') {
    respond(200, ['success' => true, 'message' => 'Already paid', 'paymentUrl' => null]);
}

// compute amount in paise
$amountFloat = floatval($entry['total'] ?? 0);
if ($amountFloat <= 0) {
    respond(400, ['success' => false, 'error' => 'Invalid amount']);
}

$merchantId = VK_PHONEPE_MERCHANT_ID;
$saltKey    = VK_PHONEPE_SALT_KEY;
$saltIndex  = VK_PHONEPE_SALT_INDEX;
$base       = rtrim(VK_PHONEPE_BASE_URL, '/');
$endpointPath = VK_PHONEPE_PAYLINK_PATH; // e.g. /v3/payLink/init
$fullUrl = $base . $endpointPath;

// build payload
$txnid = 'TXN-' . $invoiceId . '-' . time();
$amountPaise = intval(round($amountFloat * 100));
$payload = [
    'merchantId' => $merchantId,
    'transactionId' => $txnid,
    'merchantOrderId' => $invoiceId,
    'amount' => $amountPaise,
    'mobileNumber' => (!empty($entry['customerPhone']) ? preg_replace('/\D+/', '', $entry['customerPhone']) : null),
    'message' => 'Payment for invoice ' . $invoiceId,
    'expiresIn' => 24*3600 // 24 hours default
];
// remove nulls
foreach ($payload as $k => $v) { if ($v === null) unset($payload[$k]); }

// deterministic JSON
$payloadJson = json_encode($payload, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

// compute signature (base64(payload) + endpointPath + saltKey => sha256hex + ### + saltIndex)
$b64 = base64_encode($payloadJson);
$rawToSign = $b64 . $endpointPath . $saltKey;
$sigHash = hash('sha256', $rawToSign);
$xverify = $sigHash . '###' . $saltIndex;

// Logging
$now = date('c');
file_put_contents($phonepeLog, "$now OUTGOING_URL: $fullUrl\n", FILE_APPEND);
file_put_contents($phonepeLog, "$now OUTGOING_PAYLOAD: $payloadJson\n", FILE_APPEND);
file_put_contents($phonepeLog, "$now OUTGOING_MERCHANT: " . substr($merchantId,0,8) . "...\n", FILE_APPEND);
file_put_contents($phonepeLog, "$now OUTGOING_SIG_PREFIX: " . substr($xverify,0,32) . "...\n", FILE_APPEND);

// Mark transaction initiated in metadata (idempotent)
$meta[$invoiceId]['phonepe_transaction'] = [
    'id' => $txnid,
    'status' => 'initiated',
    'amount' => $amountPaise,
    'initiated_at' => gmdate(DATE_ATOM),
];

// atomically persist metadata
$fp = @fopen($metadataPath, 'c+');
if ($fp === false) {
    // fallback
    file_put_contents($metadataPath, json_encode($meta, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
} else {
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($meta, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

// perform request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fullUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payloadJson);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-VERIFY: ' . $xverify,
    'X-CALLBACK-URL: ' . rtrim(VK_DOMAIN, '/') . '/payment_callback.php'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$resp = curl_exec($ch);
$curlErr = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

file_put_contents($phonepeLog, "$now CURL_ERR: " . ($curlErr?:'-') . " HTTP_CODE: $httpCode\n", FILE_APPEND);
file_put_contents($phonepeLog, "$now RESP_BODY: " . ($resp?:'(empty)') . "\n\n", FILE_APPEND);

// parse provider response
$jsonResp = json_decode($resp, true);
if (!is_array($jsonResp) || $httpCode < 200 || $httpCode >= 300) {
    // include body for debugging
    respond(502, ['success' => false, 'error' => 'Payment provider error', 'http_code' => $httpCode, 'provider_body' => $resp ?: '']);
}

// expected payLink
$payLink = $jsonResp['data']['payLink'] ?? $jsonResp['data']['payLink'] ?? $jsonResp['data']['paymentLink'] ?? $jsonResp['data']['paylink'] ?? ($jsonResp['data']['payLink'] ?? null);

if ($payLink) {
    // store payLink in metadata
    $meta[$invoiceId]['phonepe_transaction']['provider_response'] = [
        'http_code' => $httpCode,
        'received_at' => gmdate(DATE_ATOM),
        'raw' => $jsonResp
    ];
    $meta[$invoiceId]['phonepe_transaction']['paylink'] = $payLink;

    // persist again
    $fp = @fopen($metadataPath, 'c+');
    if ($fp === false) {
        file_put_contents($metadataPath, json_encode($meta, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
    } else {
        flock($fp, LOCK_EX);
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($meta, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
    }

    respond(200, ['success' => true, 'paymentUrl' => $payLink, 'transactionId' => $txnid]);
}

// fallback
respond(502, ['success' => false, 'error' => 'Payment provider did not return payLink', 'detail' => $resp ?: 'no response']);
