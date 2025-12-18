<?php
$config = require __DIR__ . '/vk_config.php';
$meta = json_decode(file_get_contents($config['meta_file']), true);
$now = time();

foreach ($meta as $id => $inv) {
    if (($inv['expiresAt'] ?? 0) < $now) {
        @unlink($config['invoice_path'].'/'.$id.'.html');
        unset($meta[$id]);
    }
}

file_put_contents($config['meta_file'], json_encode($meta, JSON_PRETTY_PRINT));
echo "Cleanup done\n";
