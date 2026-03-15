import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const invoiceWebhook = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(200).json({ success: true });
      return;
    }

    const body = req.body || {};
    const invoiceId =
      body.invoiceId || body.orderId || body.meta?.merchantOrderId;
    const status = (
      body.status || body.meta?.payment_status || ""
    ).toLowerCase();

    if (!invoiceId || !status) {
      res.status(400).json({
        success: false,
        error: "missing invoiceId or status",
      });
      return;
    }

    // Try orderId first
    let snapshot = await db
      .collection("bills")
      .where("orderId", "==", invoiceId)
      .limit(1)
      .get();

    // Fallback: invoiceId
    if (snapshot.empty) {
      snapshot = await db
        .collection("bills")
        .where("invoiceId", "==", invoiceId)
        .limit(1)
        .get();
    }

    if (snapshot.empty) {
      res.status(200).json({
        success: true,
        note: "no-bill-found",
      });
      return;
    }

    const docRef = snapshot.docs[0].ref;
    const updates: Record<string, any> = {
      status,
      paymentStatus: status,
    };

    if (status === "paid") {
      updates.paymentMethod = "upi";
      updates.paymentDate = admin.firestore.FieldValue.serverTimestamp();
    }

    if (body.meta) {
      updates.invoiceMeta = body.meta;
    }

    await docRef.update(updates);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("invoiceWebhook error", err);
    res.status(500).json({
      success: false,
      error: "internal_error",
    });
  }
});
