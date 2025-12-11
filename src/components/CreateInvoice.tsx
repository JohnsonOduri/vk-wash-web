import React, { useState } from 'react';

type LineItem = {
  description: string;
  qty: number;
  unitPrice: number;
};

type InvoiceForm = {
  orderId: string; // deterministic unique id supplied by creator
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  creatorIdShort: string; // e.g., last 4 digits of phone or short email hash
  items: LineItem[];
  taxRatePct: number; // percent (e.g., 0, 5, 18)
};

// Simple helper to format currency INR
const inr = (n: number) => `₹ ${n.toFixed(2)}`;

/**
 * CreateInvoice component
 * NOTE: Authentication integration points:
 * - Fetch the logged-in user (Firebase phone auth or email/password) separately.
 * - Derive `creatorIdShort` from user (e.g., last 4 digits of phone).
 * - Do NOT send any sensitive tokens to PHP; use CSRF in production.
 */
export default function CreateInvoice() {
  const [form, setForm] = useState<InvoiceForm>({
    orderId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    creatorIdShort: '',
    items: [{ description: '', qty: 1, unitPrice: 0 }],
    taxRatePct: 0,
  });
  const [sharing, setSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{ url?: string; error?: string } | null>(null);

  const subtotal = form.items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  const taxAmount = subtotal * (Number(form.taxRatePct) || 0) / 100;
  const total = subtotal + taxAmount;

  const updateItem = (idx: number, patch: Partial<LineItem>) => {
    setForm(prev => {
      const next = [...prev.items];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, items: next };
    });
  };

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { description: '', qty: 1, unitPrice: 0 }] }));
  const removeItem = (idx: number) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const share = async () => {
    setSharing(true);
    setShareResult(null);
    try {
      // Basic client-side validation (server does full validation too)
      if (!form.orderId || !form.customerName || !form.customerPhone || form.items.length === 0) {
        throw new Error('Please fill order ID, customer details, and at least one item.');
      }

      const payload = {
        orderId: form.orderId.trim(),
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerAddress: form.customerAddress.trim(),
        creatorIdShort: form.creatorIdShort.trim(),
        taxRatePct: Number(form.taxRatePct) || 0,
        items: form.items.map(it => ({
          description: String(it.description || '').trim(),
          qty: Number(it.qty) || 0,
          unitPrice: Number(it.unitPrice) || 0,
        })),
      };

      // IMPORTANT: Replace URL with your Hostinger deployment path
      const resp = await fetch('https://vkwash.in/create_invoice.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate invoice');
      }
      setShareResult({ url: data.url });
    } catch (e: any) {
      setShareResult({ error: e.message || 'Unexpected error' });
    } finally {
      setSharing(false);
    }
  };

  const copyUrl = async () => {
    if (shareResult?.url) await navigator.clipboard.writeText(shareResult.url);
  };

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 16 }}>
      <h2>Create Invoice</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>
          Order ID
          <input value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} placeholder="INV-20251201-abc123" />
        </label>
        <label>
          Creator Short ID
          <input value={form.creatorIdShort} onChange={e => setForm({ ...form, creatorIdShort: e.target.value })} placeholder="e.g., 9830" />
        </label>
        <label>
          Customer Name
          <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
        </label>
        <label>
          Customer Phone
          <input value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
        </label>
        <label style={{ gridColumn: '1 / span 2' }}>
          Address
          <textarea value={form.customerAddress} onChange={e => setForm({ ...form, customerAddress: e.target.value })} rows={2} />
        </label>
        <label>
          Tax Rate (%)
          <input type="number" value={form.taxRatePct} onChange={e => setForm({ ...form, taxRatePct: Number(e.target.value) })} min={0} step={1} />
        </label>
      </div>

      <h3 style={{ marginTop: 16 }}>Items</h3>
      {form.items.map((it, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
          <input placeholder="Description" value={it.description} onChange={e => updateItem(idx, { description: e.target.value })} />
          <input type="number" placeholder="Qty" value={it.qty} onChange={e => updateItem(idx, { qty: Number(e.target.value) })} />
          <input type="number" placeholder="Unit Price" value={it.unitPrice} onChange={e => updateItem(idx, { unitPrice: Number(e.target.value) })} />
          <button onClick={() => removeItem(idx)} aria-label={`Remove item ${idx + 1}`}>Remove</button>
        </div>
      ))}
      <button onClick={addItem}>+ Add Item</button>

      <div style={{ marginTop: 16 }}>
        <div>Subtotal: <strong>{inr(subtotal)}</strong></div>
        <div>Tax ({form.taxRatePct}%): <strong>{inr(taxAmount)}</strong></div>
        <div>Total: <strong>{inr(total)}</strong></div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={share} disabled={sharing}>{sharing ? 'Sharing…' : 'Share order details'}</button>
      </div>

      {shareResult && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd' }}>
          {shareResult.error ? (
            <div style={{ color: 'red' }}>Error: {shareResult.error}</div>
          ) : (
            <div>
              <div>Public URL:</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{ overflowWrap: 'anywhere' }}>{shareResult.url}</code>
                <button onClick={copyUrl}>Copy</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
