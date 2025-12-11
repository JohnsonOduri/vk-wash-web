import { toast } from "@/hooks/use-toast";

export interface InvoiceItem {
  name: string;
  category?: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  total: number;
  subtotal: number;
  tax?: number;
  status: 'paid' | 'pending';
  createdAt?: Date;
  branch?: string;
}

/**
 * Generates a professional invoice image with decorative borders and shares it via WhatsApp
 */
export async function generateAndShareInvoice(invoice: InvoiceData): Promise<void> {
  try {
    // Calculate dynamic canvas dimensions
    const width = 900;
    const padding = 40;
    const headerHeight = 280;
    const itemRowHeight = 45;
    const footerHeight = 320;
    const minItemsHeight = 200; // Minimum space for items section
    const itemsHeight = Math.max(minItemsHeight, invoice.items.length * itemRowHeight + 80);
    const height = headerHeight + itemsHeight + footerHeight;
    
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      toast({
        title: "Error",
        description: "Could not generate invoice image.",
        variant: "destructive",
      });
      return;
    }

    // Fill background with white
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Draw decorative gold border (3px)
    ctx.strokeStyle = "#D2B660";
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // Inner border for professional look
    ctx.strokeStyle = "#E2E2E2";
    ctx.lineWidth = 1;
    ctx.strokeRect(25, 25, width - 50, height - 50);

    // Load and draw logo
    const logo = new Image();
    logo.src = "/pictures/vk.png";
    
    await new Promise<void>((resolve, reject) => {
      logo.onload = () => {
        try {
          let currentY = padding + 20;

          // ========== HEADER SECTION ==========
          
          // Draw logo
          const logoSize = 70;
          ctx.drawImage(logo, padding, currentY, logoSize, logoSize);

          // Company name and details
          ctx.fillStyle = "#222222";
          ctx.font = "bold 28px Arial, sans-serif";
          ctx.textBaseline = "top";
          ctx.fillText("VK Wash", padding + logoSize + 20, currentY);

          ctx.font = "14px Arial, sans-serif";
          ctx.fillStyle = "#666666";
          ctx.fillText("Laundry & Dry Cleaning Services", padding + logoSize + 20, currentY + 35);

          // Contact info icons and text
          ctx.font = "12px Arial, sans-serif";
          ctx.fillStyle = "#666666";
          const contactY = currentY + 55;
          ctx.fillText("📱 8106549413", padding + logoSize + 20, contactY);
          ctx.fillText("✉ vk149763@gmail.com", padding + logoSize + 230, contactY);

          // Invoice title and number on right side
          ctx.fillStyle = "#D2B660";
          ctx.font = "bold 32px Arial, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText("INVOICE", width - padding, currentY);
          
          ctx.fillStyle = "#333333";
          ctx.font = "18px Arial, sans-serif";
          ctx.fillText(`#${invoice.orderId}`, width - padding, currentY + 40);

          // Invoice date
          const dateStr = invoice.createdAt 
            ? new Date(invoice.createdAt).toLocaleDateString('en-IN')
            : new Date().toLocaleDateString('en-IN');
          ctx.font = "14px Arial, sans-serif";
          ctx.fillStyle = "#666666";
          ctx.fillText(`Date: ${dateStr}`, width - padding, currentY + 70);

          // Reset text align
          ctx.textAlign = "left";

          currentY += 130;

          // Horizontal divider
          ctx.strokeStyle = "#D2B660";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(padding, currentY);
          ctx.lineTo(width - padding, currentY);
          ctx.stroke();

          currentY += 25;

          // ========== CUSTOMER SECTION ==========
          
          ctx.fillStyle = "#333333";
          ctx.font = "bold 16px Arial, sans-serif";
          ctx.fillText("BILL TO:", padding, currentY);

          currentY += 25;
          ctx.font = "18px Arial, sans-serif";
          ctx.fillStyle = "#222222";
          ctx.fillText(invoice.customerName || "", padding, currentY);

          currentY += 25;
          ctx.font = "14px Arial, sans-serif";
          ctx.fillStyle = "#666666";
          ctx.fillText(`Mobile: ${invoice.customerPhone || ""}`, padding, currentY);

          if (invoice.branch) {
            currentY += 22;
            ctx.fillText(`Branch: ${invoice.branch}`, padding, currentY);
          }

          currentY += 35;

          // ========== ITEMS TABLE ==========
          
          // Table header background
          const tableTop = currentY;
          ctx.fillStyle = "#E2E2E2";
          ctx.fillRect(padding, tableTop, width - (2 * padding), 40);

          // Table headers
          ctx.fillStyle = "#222222";
          ctx.font = "bold 14px Arial, sans-serif";
          ctx.fillText("No.", padding + 10, tableTop + 25);
          ctx.fillText("ITEM / DESCRIPTION", padding + 60, tableTop + 25);
          ctx.fillText("QTY", width - 320, tableTop + 25);
          ctx.fillText("RATE", width - 230, tableTop + 25);
          ctx.textAlign = "right";
          ctx.fillText("TOTAL", width - padding - 10, tableTop + 25);
          ctx.textAlign = "left";

          currentY = tableTop + 55;

          // Items rows
          ctx.font = "13px Arial, sans-serif";
          invoice.items.forEach((item, index) => {
            // Alternate row background
            if (index % 2 === 0) {
              ctx.fillStyle = "#F9F9F9";
              ctx.fillRect(padding, currentY - 12, width - (2 * padding), itemRowHeight);
            }

            ctx.fillStyle = "#333333";
            
            // Serial number
            ctx.fillText(`${index + 1}`, padding + 10, currentY);

            // Item name with category
            const itemName = item.category 
              ? `${item.name} (${item.category})`
              : item.name;
            
            // Truncate long item names
            const maxItemWidth = width - 480;
            let displayName = itemName;
            if (ctx.measureText(itemName).width > maxItemWidth) {
              while (ctx.measureText(displayName + "...").width > maxItemWidth && displayName.length > 0) {
                displayName = displayName.substring(0, displayName.length - 1);
              }
              displayName += "...";
            }
            ctx.fillText(displayName, padding + 60, currentY);

            // Quantity
            ctx.fillText(`${item.quantity}`, width - 320, currentY);

            // Rate
            ctx.fillText(`₹${item.price.toFixed(2)}`, width - 230, currentY);

            // Total
            ctx.textAlign = "right";
            ctx.fillText(`₹${(item.price * item.quantity).toFixed(2)}`, width - padding - 10, currentY);
            ctx.textAlign = "left";

            currentY += itemRowHeight;
          });

          currentY += 15;

          // ========== TOTALS SECTION ==========
          
          // Totals background
          ctx.fillStyle = "#E2E2E2";
          ctx.fillRect(width - 350, currentY - 10, 350 - padding, 40);

          // Subtotal
          ctx.fillStyle = "#333333";
          ctx.font = "bold 14px Arial, sans-serif";
          ctx.fillText("SUBTOTAL:", width - 250, currentY + 12);
          ctx.textAlign = "right";
          const subtotalAmount = invoice.subtotal || invoice.total;
          ctx.fillText(`₹${subtotalAmount.toFixed(2)}`, width - padding - 10, currentY + 12);
          ctx.textAlign = "left";

          currentY += 50;

          // Tax (if applicable)
          if (invoice.tax && invoice.tax > 0) {
            ctx.font = "13px Arial, sans-serif";
            ctx.fillStyle = "#666666";
            ctx.fillText("Tax:", width - 250, currentY);
            ctx.textAlign = "right";
            ctx.fillText(`₹${invoice.tax.toFixed(2)}`, width - padding - 10, currentY);
            ctx.textAlign = "left";
            currentY += 30;
          }

          // Grand Total with gold background
          ctx.fillStyle = "#D2B660";
          ctx.fillRect(width - 350, currentY - 10, 350 - padding, 50);

          ctx.font = "bold 18px Arial, sans-serif";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText("TOTAL:", width - 250, currentY + 17);
          ctx.textAlign = "right";
          ctx.fillText(`₹${invoice.total.toFixed(2)}`, width - padding - 10, currentY + 17);
          ctx.textAlign = "left";

          currentY += 70;

          // ========== STATUS & PAYMENT INFO ==========
          
          // Status badge
          ctx.font = "bold 16px Arial, sans-serif";
          const statusText = invoice.status === 'paid' ? "PAID ✓" : "PENDING";
          const statusBg = invoice.status === 'paid' ? "#10B981" : "#F59E0B";
          const statusWidth = ctx.measureText(statusText).width + 30;
          
          ctx.fillStyle = statusBg;
          ctx.fillRect(padding, currentY, statusWidth, 35);
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(statusText, padding + 15, currentY + 22);

          // Bank Details (right side)
          ctx.fillStyle = "#333333";
          ctx.font = "bold 14px Arial, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText("BANK DETAILS", width - padding, currentY);

          ctx.font = "12px Arial, sans-serif";
          ctx.fillStyle = "#666666";
          currentY += 25;
          ctx.fillText("Name: vijay oduri", width - padding, currentY);
          currentY += 20;
          ctx.fillText("Bank: State Bank of India", width - padding, currentY);
          currentY += 20;
          ctx.fillText("Account: 31051826174", width - padding, currentY);
          currentY += 20;
          ctx.fillText("IFSC: SBIN0018559", width - padding, currentY);
          ctx.textAlign = "left";

          currentY += 40;

          // ========== FOOTER SECTION ==========
          
          // Terms & conditions
          ctx.fillStyle = "#666666";
          ctx.font = "11px Arial, sans-serif";
          ctx.fillText("Terms & Conditions:", padding, currentY);
          currentY += 18;
          ctx.font = "10px Arial, sans-serif";
          ctx.fillText("• Payment should be done within 24 hours of delivery", padding, currentY);
          currentY += 15;
          ctx.fillText("• Clothes must be checked after delivery", padding, currentY);
          currentY += 15;
          ctx.fillText("• Packing should be removed immediately after delivery", padding, currentY);

          currentY += 30;

          // Thank you message
          ctx.font = "italic 13px Arial, sans-serif";
          ctx.fillStyle = "#D2B660";
          ctx.textAlign = "center";
          ctx.fillText("Thank you for your business!", width / 2, currentY);

          // Contact footer
          ctx.font = "11px Arial, sans-serif";
          ctx.fillStyle = "#999999";
          currentY += 20;
          ctx.fillText("Contact: 8106549413 | vk149763@gmail.com", width / 2, currentY);

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      logo.onerror = () => {
        reject(new Error("Failed to load logo"));
      };
    });

    // Convert canvas to blob and share
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast({
          title: "Error",
          description: "Could not create invoice image.",
          variant: "destructive",
        });
        return;
      }

      await shareInvoiceViaWhatsApp(
        blob,
        invoice.customerPhone,
        invoice.customerName,
        invoice.orderId,
        invoice.total
      );
    }, "image/png");

  } catch (error) {
    console.error("Error generating invoice:", error);
    toast({
      title: "Error",
      description: "Failed to generate invoice.",
      variant: "destructive",
    });
  }
}

/**
 * Uploads invoice image to Cloudinary and shares via WhatsApp
 */
async function shareInvoiceViaWhatsApp(
  imageBlob: Blob,
  customerPhone: string,
  customerName: string,
  orderId: string,
  amount: number
): Promise<void> {
  // Open a blank tab immediately to avoid popup blockers
  const whatsappTab = window.open("about:blank", "_blank");

  const cloudName = "djxvembm4";
  const unsignedUploadPreset = "vkwash_invoice";
  const fileName = `${customerName.replace(/\s+/g, "_")}-${orderId}`;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", imageBlob, `${fileName}.png`);
  formData.append("upload_preset", unsignedUploadPreset);
  formData.append("public_id", fileName);

  let imageUrl = "";
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) {
      imageUrl = data.secure_url;
    } else {
      throw new Error("Cloudinary upload failed");
    }
  } catch (err) {
    toast({
      title: "Upload Failed",
      description: "Could not upload invoice image to Cloudinary.",
      variant: "destructive",
    });
    if (whatsappTab) whatsappTab.close();
    return;
  }

  // Generate UPI payment link
  const upiAmount = amount.toFixed(2);
  const upiLink = `upi://pay?pa=vk149763@oksbi&pn=Vijay%20Kumar&am=${upiAmount}&cu=INR`;

  // Construct WhatsApp message
  const phone = customerPhone.replace(/[^0-9]/g, "");
  const message = `Hello ${customerName},%0A%0AHere is your VK Wash invoice:%0A${imageUrl}%0A%0AAmount: ₹${upiAmount}%0A%0AYou can pay using this UPI link:%0A${upiLink}%0A%0AThank you for choosing VK Wash!`;
  const whatsappUrl = `https://wa.me/91${phone}?text=${message}`;

  if (whatsappTab) {
    whatsappTab.location.href = whatsappUrl;
  } else {
    window.open(whatsappUrl, "_blank");
  }
}
