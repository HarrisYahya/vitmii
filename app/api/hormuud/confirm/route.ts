import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, total, district, delivery, deliveryFee, items } = body;

    // ===============================
    // Basic validation (unchanged)
    // ===============================
    if (!phone || !total) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing phone or total" },
        { status: 400 }
      );
    }

    // ===============================
    // Hormuud credentials (CORRECT)
    // ===============================
    const { MERCHANT_UID, API_USER_ID, API_KEY } = process.env;

    if (!MERCHANT_UID || !API_USER_ID || !API_KEY) {
      return NextResponse.json(
        {
          status: "ERROR",
          message: "Server misconfigured. Please contact admin.",
        },
        { status: 500 }
      );
    }

    // ===============================
    // Hormuud payload (structure kept)
    // ===============================
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
        amount: total,
        payerInfo: {
          accountNo: phone,
        },
        description: `Order (${district})`,
      },
    };

    // ===============================
    // Call Hormuud API
    // ===============================
    const response = await fetch(
      "https://api.hormuud.com/evcplus/payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { status: "ERROR", message: `Payment failed: ${text}` },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);

    // ===============================
    // Handle Hormuud response clearly
    // ===============================
    if (data.status !== "SUCCESS") {
      return NextResponse.json(
        {
          status: "ERROR",
          message:
            data.message ||
            data.responseMessage ||
            "Payment failed. Please try again.",
        },
        { status: 400 }
      );
    }

    // ===============================
    // Success
    // ===============================
    return NextResponse.json({
      status: "SUCCESS",
      hormuud: data,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "ERROR", message: `Server error: ${msg}` },
      { status: 500 }
    );
  }
}
