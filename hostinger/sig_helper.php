<?php
// sig_helper.php
// Usage (CLI): php sig_helper.php /v3/payLink/init /path/to/payload.json
// Prints the X-VERIFY signature computed as: sha256(base64(payload) + endpointPath + salt_key) + '###' + salt_index

if (php_sapi_name() === 'cli') {
    // CLI mode
    $argc = $_SERVER['argc'];
    $argv = $_SERVER['argv'];
    if ($argc < 3) {
        fwrite(STDERR, "Usage: php sig_helper.php <endpointPath> <payloadFile>\n");
        exit(2);
    }
    $endpointPath = $argv[1];
    $payloadFile = $argv[2];
    if (!file_exists($payloadFile)) {
        fwrite(STDERR, "Payload file not found: $payloadFile\n");
        exit(2);
    }
    // Load config from standard location:
    $configPath = '/home/u577376970/domains/vkwash.in/vk_config.php';
    if (!file_exists($configPath)) {
        fwrite(STDERR, "Config not found at $configPath\n");
        exit(2);
    }
    require $configPath;
    $payload = file_get_contents($payloadFile);
    $sig = compute_x_verify($payload, $endpointPath, VK_PHONEPE_SALT_KEY, VK_PHONEPE_SALT_INDEX);
    echo $sig . PHP_EOL;
    exit(0);
}

/**
 * Compute X-VERIFY signature
 * @param string $payloadJson string exact payload bytes (no reformatting)
 * @param string $endpointPath exact endpoint path string (leading slash)
 * @param string $saltKey secret/salt key
 * @param string $saltIndex salt index (string)
 * @return string signature
 */
function compute_x_verify($payloadJson, $endpointPath, $saltKey, $saltIndex) {
    $b64 = base64_encode($payloadJson);
    $raw = $b64 . $endpointPath . $saltKey;
    $hash = hash('sha256', $raw);
    return $hash . '###' . $saltIndex;
}
?>
