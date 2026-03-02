import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, total, items } = body;

    if (!phone || !total || !items?.length) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^252\d{9}$/.test(phone)) {
      return NextResponse.json(
        { status: "ERROR", message: "Invalid phone format" },
        { status: 400 }
      );
    }

    const {
      WAAFIPAY_ENV,
      WAAFIPAY_MERCHANT_UID,
      WAAFIPAY_API_USER_ID,
      WAAFIPAY_API_KEY,
    } = process.env;

    if (
      !WAAFIPAY_MERCHANT_UID ||
      !WAAFIPAY_API_USER_ID ||
      !WAAFIPAY_API_KEY
    ) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing Waafi credentials" },
        { status: 500 }
      );
    }

    // ✅ FIX — declare now
    const now = Date.now().toString();

    const payload = {
  schemaVersion: "1.0",
  requestId: now,
  timestamp: new Date().toISOString(),
  channelName: "WEB",
  serviceName: "API_PURCHASE",
  serviceParams: {
    apiUserId: WAAFIPAY_API_USER_ID, // ✅ here
    apiKey: WAAFIPAY_API_KEY,       // ✅ here
    merchantUid: WAAFIPAY_MERCHANT_UID,
    paymentMethod: "MWALLET_ACCOUNT",
    payerInfo: { accountNo: phone },
    transactionInfo: {
      referenceId: `ORDER-${now}`,
      invoiceId: `INV-${now}`,
      amount: total,
      currency: "USD",
      description: "Vitmiin Order Payment",
      items: items.map((i: any) => ({
        itemId: i.id,
        description: i.title,
        quantity: i.qty,
        price: i.price,
      })),
    },
  },
};

    console.log("WAAFI REQUEST:", JSON.stringify(payload, null, 2));

    const waafiUrl =
      WAAFIPAY_ENV === "live"
        ? "https://api.waafipay.net/asm"
        : "https://sandbox.waafipay.net/asm";

    const waafiRes = await fetch(waafiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const waafiJson = await waafiRes.json();

    console.log("WAAFI RESPONSE:", JSON.stringify(waafiJson, null, 2));

    if (waafiJson.responseCode !== "2001") {
      return NextResponse.json(
        {
          status: "ERROR",
          message: waafiJson.responseMsg,
          waafipay: waafiJson,
          requestPayload: payload,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "SUCCESS",
      waafipay: waafiJson,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    return NextResponse.json(
      { status: "ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}