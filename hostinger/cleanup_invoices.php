<?php
// cleanup_invoices.php
// Remove expired invoice HTML files and their metadata entries

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');
header('Content-Type: application/json');

function respond($code, $payload) {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

$configPath = '/home/' . (getenv('USER') ?: 'host_user') . '/vk_config.php';
if (!file_exists($configPath)) {
  respond(500, ['success' => false, 'error' => 'Server configuration missing']);
}
require $configPath;

$metadataPath = rtrim(VK_INVOICES_DIR, '/') . '/metadata.json';
if (!file_exists($metadataPath)) respond(200, ['success' => true, 'deleted' => 0]);

$raw = file_get_contents($metadataPath);
$meta = json_decode($raw, true);
if (!is_array($meta)) respond(200, ['success' => true, 'deleted' => 0]);

$now = time();
$deleted = 0;

foreach ($meta as $invoiceId => $entry) {
  $expires = strtotime($entry['expires_at'] ?? '1970-01-01');
  if ($expires && $expires < $now) {
    $path = rtrim(VK_INVOICES_DIR, '/') . '/' . basename($entry['file'] ?? '');
    if (file_exists($path)) unlink($path);
    unset($meta[$invoiceId]);
    $deleted++;
  }
}

// write back metadata atomically
$fp = fopen($metadataPath, 'c+');
if ($fp !== false) {
  flock($fp, LOCK_EX);
  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($meta, JSON_PRETTY_PRINT));
  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);
}

respond(200, ['success' => true, 'deleted' => $deleted]);

?>
<?php
// cleanup_invoices.php
// Deletes invoice HTML files older than 180 days and prunes metadata.json

$baseDir = __DIR__;
$invoiceDir = $baseDir . '/invoices';
$metadataPath = $invoiceDir . '/metadata.json';
$now = time();
$ttl = 180 * 24 * 60 * 60; // 180 days

function log_line($msg) {
  echo date('c') . ' ' . $msg . "\n";
}

if (!is_dir($invoiceDir)) {
  log_line('No invoices directory; nothing to clean.');
  exit(0);
}

// Delete expired files
$deleted = 0;
$dh = opendir($invoiceDir);
if ($dh) {
  while (($file = readdir($dh)) !== false) {
    if (substr($file, -5) === '.html') {
      $path = $invoiceDir . '/' . $file;
      $mtime = filemtime($path);
      if ($mtime !== false && ($now - $mtime) > $ttl) {
        if (unlink($path)) {
          $deleted++;
          log_line('Deleted expired: ' . $file);
        }
      }
    }
  }
  closedir($dh);
}

// Prune metadata
if (file_exists($metadataPath)) {
  $raw = file_get_contents($metadataPath);
  $meta = json_decode($raw, true);
  if (is_array($meta)) {
    $pruned = [];
    foreach ($meta as $entry) {
      $expiresAt = intval($entry['expiresAt'] ?? 0);
      $path = $entry['path'] ?? '';
      if ($expiresAt > 0 && $expiresAt < $now) {
        // expired: keep only if file still exists (rare)
        if (!file_exists($baseDir . '/' . $path)) {
          continue; // drop
        }
      }
      $pruned[] = $entry;
    }
    file_put_contents($metadataPath, json_encode($pruned, JSON_PRETTY_PRINT));
    log_line('Pruned metadata entries: ' . (count($meta) - count($pruned)));
  }
}

log_line('Cleanup complete. Files deleted: ' . $deleted);
