import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, total, district, delivery, deliveryFee, items } = body;

    if (!phone || !total) {
      return NextResponse.json({ status: "ERROR", message: "Missing phone or total" }, { status: 400 });
    }

    const { HORMUUD_MERCHANT_UID, HORMUUD_API_USER, HORMUUD_TOKEN } = process.env;

    if (!HORMUUD_MERCHANT_UID || !HORMUUD_API_USER || !HORMUUD_TOKEN) {
      return NextResponse.json(
        { status: "ERROR", message: "Server misconfigured. Please contact admin." },
        { status: 500 }
      );
    }

    const payload = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: HORMUUD_MERCHANT_UID,
        apiUserId: HORMUUD_API_USER,
        amount: total,
        payerInfo: { accountNo: phone },
        description: `Order (${district})`,
      },
    };

    const response = await fetch("https://api.hormuud.com/evcplus/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HORMUUD_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { status: "ERROR", message: `Payment failed: ${text}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data || data.status !== "SUCCESS") {
      return NextResponse.json(
        { status: "ERROR", message: data?.message || "Payment failed. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "SUCCESS", hormuud: data });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "ERROR", message: `Server error: ${msg}` }, { status: 500 });
  }
}
