<?php
// vk_config.php — PhonePe V2 Production Config

return [
    // PhonePe credentials (V2 ONLY)
    'client_id'      => 'SU2505231821337112049862',
    'client_version' => 1,
    'client_secret'  => 'b3ae1ca7-024d-4a67-9177-429a33ed75e1',

    // API endpoints
    'token_url'  => 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
    'pay_url'    => 'https://api.phonepe.com/apis/pg/checkout/v2/pay',
    'status_url' => 'https://api.phonepe.com/apis/pg/checkout/v2/order',

    // Paths
    'base_path'    => '/home/u577376970/domains/vkwash.in/public_html',
    'invoice_path' => '/home/u577376970/domains/vkwash.in/public_html/invoices',
    'meta_file'    => '/home/u577376970/domains/vkwash.in/public_html/invoices/metadata.json',
    'log_dir'      => '/home/u577376970/domains/vkwash.in/public_html/logs',

    // Optional: external webhook to notify your app (e.g. Cloud Function / app endpoint)
    // When set, `payment_callback.php` will POST { invoiceId, status, meta }
    'notify_url'   => '',

    // Invoice expiry (days) used in generated HTML footer
    'invoice_expires_days' => 120,

    // Webhook auth
    'webhook_user' => 'Vijayoduri',
    'webhook_pass' => 'Vijay1982',
];
