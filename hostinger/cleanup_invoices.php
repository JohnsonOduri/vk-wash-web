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
