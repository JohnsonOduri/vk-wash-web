<?php
// Minimal server-side data: invoice id provided in querystring
$invoice = htmlspecialchars($_GET['invoice'] ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
?>
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>Payment Verification - VK Wash</title>
	<style>
		body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:#f7fafc;color:#111827;margin:0;padding:24px}
		.card{max-width:720px;margin:28px auto;background:#fff;border-radius:10px;padding:24px;border:1px solid #e6edf3;text-align:center}
		.muted{color:#6b7280}
		.status{font-size:20px;margin-top:12px}
		.icon{width:64px;height:64px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px}
		.icon.pending{background:#e6f0ff;color:#1e3a8a}
		.icon.success{background:#ecfdf5;color:#065f46}
		.icon.failed{background:#fff5f5;color:#991b1b}
		.btn{display:inline-block;padding:10px 14px;border-radius:8px;text-decoration:none;margin:8px;border:1px solid #d1d5db;background:#fff;color:#111}
		.btn.primary{background:#059669;color:#fff;border:none}
		.small{font-size:13px;color:#6b7280}
	</style>
</head>
<body>
	<div class="card" role="main">
		<div id="icon" class="icon pending">⌛</div>
		<h1 id="title">Verifying payment…</h1>
		<div class="muted small">Invoice ID: <strong id="invoiceId"><?php echo $invoice;?></strong></div>
		<div id="message" class="status muted">Waiting for payment confirmation from the payment provider.</div>

		<div style="margin-top:18px">
			<a id="openInvoice" class="btn" href="/invoices/<?php echo $invoice;?>.html" target="_blank">Open Invoice</a>
			<a id="printBtn" class="btn" style="display:none;" href="#" onclick="window.print();return false;">Print Invoice</a>
			<a id="backBtn" class="btn" href="/">Back to Dashboard</a>
		</div>
	</div>

	<script>
		// Polling behavior: ask backend for verified status and update UI.
		const INVOICE = encodeURIComponent('<?php echo $invoice;?>');
		const POLL_INTERVAL = 3000; // 3s
		let stopped = false;

		function setUI(status, meta) {
			const icon = document.getElementById('icon');
			const title = document.getElementById('title');
			const msg = document.getElementById('message');
			const printBtn = document.getElementById('printBtn');
			if (status === 'paid') {
				icon.className = 'icon success';
				icon.textContent = '✔';
				title.textContent = 'Payment Successful';
				msg.textContent = 'Thank you — your payment has been confirmed.';
				printBtn.style.display = 'inline-block';
				stopped = true;
			} else if (status === 'failed') {
				icon.className = 'icon failed';
				icon.textContent = '✖';
				title.textContent = 'Payment Failed';
				msg.textContent = 'Payment was not successful. You can retry from the invoice page.';
				printBtn.style.display = 'none';
				stopped = true;
			} else {
				icon.className = 'icon pending';
				icon.textContent = '⌛';
				title.textContent = 'Verifying payment…';
				msg.textContent = 'Waiting for payment confirmation from the payment provider.';
				printBtn.style.display = 'none';
			}
		}

		async function checkStatus() {
			try {
				const r = await fetch('/get_invoice_status.php?invoice=' + INVOICE, { cache: 'no-store' });
				if (!r.ok) return null;
				const j = await r.json();
				return j;
			} catch (e) { return null; }
		}

		async function pollLoop() {
			while (!stopped) {
				const s = await checkStatus();
				if (s && s.success) {
					const status = (s.status || 'pending').toLowerCase();
					setUI(status, s.meta || null);
					if (status === 'paid' || status === 'failed') break;
				}
				await new Promise(r => setTimeout(r, POLL_INTERVAL));
			}
		}

		// Start immediately
		pollLoop();
	</script>
</body>
</html>
