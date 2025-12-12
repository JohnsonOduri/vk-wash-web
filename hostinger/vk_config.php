<?php
// vk_config.php
// Production config - keep this file OUTSIDE public_html and DO NOT commit to source control.
// Update values below as needed.

// PhonePe / PaymentLink production settings (Production endpoints)
define('VK_PHONEPE_MERCHANT_ID', 'SU2505231821337112049862');   // Your merchant id
define('VK_PHONEPE_SALT_KEY',      'b3ae1ca7-024d-4a67-9177-429a33ed75e1'); // Salt key / client secret used for signature
define('VK_PHONEPE_SALT_INDEX',    '1'); // Salt index (string) appended after ###
// Production paymentlink base URL (PaymentLink API, production)
define('VK_PHONEPE_BASE_URL',      'https://mercury-t2.phonepe.com'); // PaymentLink prod host
// PaymentLink endpoint path (exact path used when computing signature for outgoing requests)
define('VK_PHONEPE_PAYLINK_PATH',  '/v3/payLink/init');

// Optional: callback path (path portion used to validate inbound signatures)
// If left empty, the script will use the actual request URI ($_SERVER['REQUEST_URI']) as fallback.
define('VK_PHONEPE_EXPECTED_CALLBACK_PATH', '/payment_callback.php');

// Site & storage config
define('VK_DOMAIN',      'https://vkwash.in');                       // Site public domain
define('VK_INVOICES_DIR', '/home/u577376970/domains/vkwash.in/public_html/invoices'); // absolute invoices dir
define('VK_INVOICE_EXPIRY_DAYS', 180);

// Logging config
define('VK_LOGS_DIR',     '/home/u577376970/domains/vkwash.in/logs'); // absolute logs path (outside public_html preferred)
define('VK_LOG_LEVEL',    'info'); // 'debug'|'info'|'error' - used by scripts for verbosity

// Webhook Basic Auth (optional)
// If you enable Basic Auth in PhonePe webhook dashboard, set these.
// Otherwise leave empty and the callback will not require Basic auth.
define('VK_WEBHOOK_USER', 'Vijayoduri');   // set to '' to disable
define('VK_WEBHOOK_PASS', 'Vijay1982');    // set to '' to disable

// Recommended: do not show PHP errors in production
ini_set('display_errors', 0);
?>
