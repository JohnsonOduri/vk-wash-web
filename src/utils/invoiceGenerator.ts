import { toast } from "@/hooks/use-toast";

export interface InvoiceItem {
  name: string;
  category?: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  billId?: string; // optional Firestore bill doc id to persist invoiceUrl
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: InvoiceItem[];
  total: number;
  subtotal: number;
  tax?: number;
  status: 'paid' | 'pending';
  createdAt?: Date;
  branch?: string;
  invoiceUrl?: string; // existing URL if already generated
}

/**
 * Generates a professional invoice image with decorative borders and shares it via WhatsApp
 */
export async function generateAndShareInvoice(invoice: InvoiceData): Promise<void> {
  try {
    // If an invoice URL already exists, use it. Otherwise, call the Hostinger PHP endpoint to create it.
    let invoiceUrl = invoice.invoiceUrl;

    if (!invoiceUrl) {
      // Build payload the PHP expects
      const payload = {
        orderId: invoice.orderId,
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        customerAddress: invoice.customerAddress || '',
        creatorIdShort: '',
        taxRatePct: invoice.tax || 0,
        items: invoice.items.map(it => ({
          description: it.name + (it.category ? ` (${it.category})` : ''),
          qty: Number(it.quantity) || 0,
          unitPrice: Number(it.price) || 0,
        })),
      };

      try {
        const resp = await fetch('/create_invoice.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // Read as text first to avoid JSON parse errors from stray output
        const text = await resp.text();
        let data: any = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

        // Success path
        if (resp.ok && data && data.success && data.url) {
          invoiceUrl = data.url;
        // If server responded 409, try to use returned url or construct a predictable public URL using orderId
        } else if (resp.status === 409) {
          if (data && data.url) {
            invoiceUrl = data.url;
          } else {
            // Fallback: construct the public invoice URL assuming invoices are served at /invoices/<orderId>.html
            try {
              invoiceUrl = `${window.location.origin}/invoices/${encodeURIComponent(invoice.orderId)}.html`;
            } catch (e) {
              invoiceUrl = `/invoices/${encodeURIComponent(invoice.orderId)}.html`;
            }
          }
          toast({ title: 'Invoice Exists', description: 'Using existing invoice link', variant: 'default' });
        } else {
          const errMsg = data && (data.error || data.message) ? (data.error || data.message) : (text || 'Failed to create invoice');
          throw new Error(errMsg);
        }
      } catch (err) {
        console.error('Error creating invoice via PHP backend:', err);
        toast({ title: 'Invoice Error', description: String(err?.message || 'Failed to create invoice on server'), variant: 'destructive' });
        return;
      }
    }

    // Persist URL to Firestore if billId provided
    if (invoice.billId && invoiceUrl) {
      try {
        const { attachInvoiceUrl } = await import('@/services/laundryItemService');
        await attachInvoiceUrl(invoice.billId, invoiceUrl);
      } catch (err) {
        console.warn('Could not persist invoice URL to bill:', err);
      }
    }

    // Share via WhatsApp (open new tab to avoid popup blocker)
    const phone = (invoice.customerPhone || '').replace(/[^0-9]/g, '');
    const upiAmount = Number(invoice.total || 0).toFixed(2);
    const upiLink = `upi://pay?pa=vk149763@oksbi&pn=Vijay%20Kumar&am=${upiAmount}&cu=INR`;
    const message = `Hello ${invoice.customerName || ''}%0A%0AYour VK Wash invoice is available here:%0A${encodeURIComponent(invoiceUrl || '')}%0A%0AAmount: ₹${upiAmount}%0A%0APay using UPI:%0A${encodeURIComponent(upiLink)}%0A%0AThank you!`;

    const whatsappTab = window.open('about:blank', '_blank');
    const whatsappUrl = `https://wa.me/91${phone}?text=${message}`;
    if (whatsappTab) whatsappTab.location.href = whatsappUrl; else window.open(whatsappUrl, '_blank');

    toast({ title: 'Invoice Ready', description: 'Invoice link created and ready to share.' });
  } catch (error) {
    console.error('Error in invoice flow:', error);
    toast({ title: 'Error', description: 'Failed to create or share invoice', variant: 'destructive' });
  }
}

/**
 * Uploads invoice image to Cloudinary and shares via WhatsApp
 */
// Cloudinary-based image-upload flow removed in favor of PHP-backed public HTML invoices
