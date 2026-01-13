// vitmii/app/api/waafipay/confirm/route.ts
import { NextResponse } from "next/server";

// Type for items
type Item = {
  id: string | number;
  title: string;
  price: number;
  qty: number;
};

// Request body type
type RequestBody = {
  phone: string;
  total: number;
  district: string;
  delivery: boolean;
  deliveryFee: number;
  items: Item[];
};

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { phone, total, district, delivery, deliveryFee, items } = body;

    // Basic validation
    if (!phone || !total || !district) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read WaafiPay credentials
    const { MERCHANT_UID, API_USER_ID, API_KEY } = process.env;

    if (!MERCHANT_UID || !API_USER_ID || !API_KEY) {
      console.error("WaafiPay credentials missing!", {
        MERCHANT_UID,
        API_USER_ID,
        API_KEY,
      });
      return NextResponse.json(
        { status: "ERROR", message: "Server misconfiguration: missing credentials" },
        { status: 500 }
      );
    }

    // ✅ Validate payment method
    const paymentMethod = "MWALLET"; // Must match your WaafiPay account
    const validMethods = ["MWALLET", "MOBILEMONEY", "CARD", "ACCOUNT"];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { status: "ERROR", message: `Invalid payment method: ${paymentMethod}` },
        { status: 400 }
      );
    }

    // Prepare payload for WaafiPay
    const payload = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: MERCHANT_UID,
        apiUserId: API_USER_ID,
        apiKey: API_KEY,
        paymentMethod,
        payerInfo: { accountNo: phone },
        transactionInfo: {
          referenceId: `ORDER-${Date.now()}`,
          invoiceId: `INV-${Date.now()}`,
          amount: total,
          currency: "USD",
          description: "Vitmii Order Payment",
          items: items.map((i: Item) => ({
            id: i.id,
            title: i.title,
            qty: i.qty,
            price: i.price,
          })),
        },
      },
    };

    // Call WaafiPay API
    const response = await fetch("https://api.waafipay.net/asm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.responseCode !== "2001") {
      console.error("WaafiPay API error:", result);
      return NextResponse.json(
        { status: "ERROR", message: result.responseMsg || "Payment failed" },
        { status: 400 }
      );
    }

    // Success
    return NextResponse.json({
      status: "SUCCESS",
      waafipay: result,
    });

  } catch (error) {
    console.error("WaafiPay API error:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}
