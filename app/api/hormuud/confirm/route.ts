import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, total, district } = body;

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
    // WaafiPay credentials
    // ===============================
    const {
      WAAFIPAY_MERCHANT_UID,
      WAAFIPAY_API_USER,
      WAAFIPAY_API_KEY,
    } = process.env;

    if (
      !WAAFIPAY_MERCHANT_UID ||
      !WAAFIPAY_API_USER ||
      !WAAFIPAY_API_KEY
    ) {
      console.error("WaafiPay credentials missing");
      return NextResponse.json(
        { status: "ERROR", message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // ===============================
    // WaafiPay payload (OFFICIAL)
    // ===============================
    const payload = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: WAAFIPAY_MERCHANT_UID,
        apiUserId: WAAFIPAY_API_USER,
        amount: total,
        payerInfo: {
          accountNo: phone,
        },
        description: `Order (${district})`,
      },
    };

    // ===============================
    // Call WaafiPay API
    // ===============================
    const response = await fetch(
      "https://api.waafipay.net/asm",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WAAFIPAY_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error("WaafiPay error:", text);
      return NextResponse.json(
        { status: "ERROR", message: "Payment failed" },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);

    // ===============================
    // WaafiPay response handling
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
      waafipay: data,
    });

  } catch (error) {
    console.error("WaafiPay exception:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}
