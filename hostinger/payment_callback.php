<?php
// payment_callback.php
// PhonePe PaymentLink callback handler
// Verifies X-VERIFY, optional Basic Auth, updates metadata.json payment status

ini_set('display_errors', 0);
ini_set('log_errors', 1);

$configPath = '/home/u577376970/domains/vkwash.in/vk_config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server configuration missing']);
    exit;
}
require_once $configPath;

// logs
$logsDir = rtrim(VK_LOGS_DIR ?: (__DIR__ . '/logs'), '/');
if (!is_dir($logsDir)) @mkdir($logsDir, 0755, true);
ini_set('error_log', $logsDir . '/error.log');
$phonepeLog = $logsDir . '/phonepe.log';

header('Content-Type: application/json');

// Optionally require Basic auth if VK_WEBHOOK_USER/PASS are set.
if (defined('VK_WEBHOOK_USER') && VK_WEBHOOK_USER && defined('VK_WEBHOOK_PASS') && VK_WEBHOOK_PASS) {
    if (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_USER'] !== VK_WEBHOOK_USER || $_SERVER['PHP_AUTH_PW'] !== VK_WEBHOOK_PASS) {
        header('WWW-Authenticate: Basic realm="VK Wash Webhook"');
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'auth required']);
        exit;
    }
}

// read raw body and headers
$raw = file_get_contents('php://input');
$headers = [];
if (function_exists('getallheaders')) {
    $headers = getallheaders();
} else {
    // fallback
    foreach ($_SERVER as $k => $v) {
        if (strpos($k, 'HTTP_') === 0) {
            $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($k,5)))));
            $headers[$name] = $v;
        }
    }
}
$sigHeader = $headers['X-VERIFY'] ?? $headers['x-verify'] ?? '';

// determine expected endpoint path for signature verification
$expectedPath = defined('VK_PHONEPE_EXPECTED_CALLBACK_PATH') && VK_PHONEPE_EXPECTED_CALLBACK_PATH
    ? VK_PHONEPE_EXPECTED_CALLBACK_PATH
    : ($_SERVER['REQUEST_URI'] ?? '/payment_callback.php');

// compute expected signature
$b64 = base64_encode($raw);
$rawToSign = $b64 . $expectedPath . VK_PHONEPE_SALT_KEY;
$expectedHash = hash('sha256', $rawToSign) . '###' . VK_PHONEPE_SALT_INDEX;

$now = date('c');
file_put_contents($phonepeLog, "$now CALLBACK_RAW: " . $raw . PHP_EOL, FILE_APPEND);
file_put_contents($phonepeLog, "$now CALLBACK_HEADERS: " . json_encode($headers) . PHP_EOL, FILE_APPEND);
file_put_contents($phonepeLog, "$now EXPECTED_SIG_PREFIX: " . substr($expectedHash,0,16) . " RECEIVED_SIG_PREFIX: " . substr($sigHeader,0,16) . PHP_EOL, FILE_APPEND);

// require signature
if (empty($sigHeader)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing signature header']);
    exit;
}
if (!hash_equals($expectedHash, $sigHeader)) {
    file_put_contents($phonepeLog, "$now SIG_MISMATCH full_expected=$expectedHash full_received=$sigHeader" . PHP_EOL, FILE_APPEND);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid signature']);
    exit;
}

// parse payload
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid payload']);
    exit;
}

// determine invoice id from payload: merchantOrderId or merchantTransactionId or transactionId
$invoiceId = $payload['merchantOrderId'] ?? null;
$merchantTxn = $payload['merchantTransactionId'] ?? $payload['transactionId'] ?? null;
if (!$invoiceId && $merchantTxn && preg_match('/^TXN-([A-Za-z0-9_\-]+)-\d+/', $merchantTxn, $m)) {
    $invoiceId = $m[1];
}
if (!$invoiceId) {
    file_put_contents($phonepeLog, "$now payment_callback: could not determine invoice id payload=" . json_encode($payload) . PHP_EOL, FILE_APPEND);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing invoice id']);
    exit;
}

// metadata path
$metadataPath = rtrim(VK_INVOICES_DIR, '/') . '/metadata.json';
if (!file_exists($metadataPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Metadata not found']);
    exit;
}
$metaRaw = file_get_contents($metadataPath);
$meta = json_decode($metaRaw, true);
if (!is_array($meta) || empty($meta[$invoiceId])) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Invoice not found']);
    exit;
}

// determine status
$status = strtoupper($payload['status'] ?? $payload['paymentStatus'] ?? '');
$paidStatuses = ['SUCCESS','PAID','COMPLETED','SUCCESSFUL','OK'];

// update metadata
if (in_array($status, $paidStatuses, true)) {
    // atomic update
    $fp = @fopen($metadataPath, 'c+');
    if ($fp === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to open metadata']);
        exit;
    }
    flock($fp, LOCK_EX);
    // read latest
    rewind($fp);
    $rawMeta = stream_get_contents($fp);
    $jsonMeta = $rawMeta ? json_decode($rawMeta, true) : [];
    if (!is_array($jsonMeta)) $jsonMeta = [];
    // ensure invoice exists
    if (empty($jsonMeta[$invoiceId])) {
        flock($fp, LOCK_UN);
        fclose($fp);
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Invoice not found (during update)']);
        exit;
    }
    $jsonMeta[$invoiceId]['payment_status'] = 'paid';
    $jsonMeta[$invoiceId]['phonepe_transaction'] = [
        'id' => $merchantTxn ?? ($payload['transactionId'] ?? null),
        'amount' => $payload['amount'] ?? null,
        'received_at' => gmdate(DATE_ATOM),
        'raw' => $payload
    ];
    // write back
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($jsonMeta, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    file_put_contents($phonepeLog, "$now payment_callback: marked paid invoice=$invoiceId txn=" . ($merchantTxn ?? '') . PHP_EOL, FILE_APPEND);
    echo json_encode(['success' => true]);
    exit;
} else {
    file_put_contents($phonepeLog, "$now payment_callback: non-success status $status for $invoiceId payload=" . json_encode($payload) . PHP_EOL, FILE_APPEND);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Payment not successful', 'status' => $status]);
    exit;
}
