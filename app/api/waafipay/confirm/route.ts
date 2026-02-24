// vitmii/app/api/waafipay/confirm/route.ts
import { NextResponse } from "next/server";

// Item type
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

// ✅ SAFE PHONE VALIDATOR (ADDED)
function isValidSomaliPhone(phone: string): boolean {
  return /^252\d{9}$/.test(phone);
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { phone, total, district, items } = body;

    // Basic validation
    if (!phone || !total || !district || !items?.length) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ PHONE FORMAT VALIDATION (ADDED)
    if (!isValidSomaliPhone(phone)) {
      return NextResponse.json(
        {
          status: "ERROR",
          message:
            "Invalid phone format. Use 252XXXXXXXXX (numbers only, no + or spaces)",
        },
        { status: 400 }
      );
    }

    // Read env variables
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
      console.error("WaafiPay credentials missing");
      return NextResponse.json(
        { status: "ERROR", message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Payment method (VALID)
    const paymentMethod = "MWALLET_ACCOUNT";

    // Build payload
    const payload = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: WAAFIPAY_MERCHANT_UID,
        apiUserId: WAAFIPAY_API_USER_ID,
        apiKey: WAAFIPAY_API_KEY,
        paymentMethod,
        payerInfo: {
          accountNo: phone,
        },
        transactionInfo: {
          referenceId: `ORDER-${Date.now()}`,
          invoiceId: `INV-${Date.now()}`,
          amount: total,
          currency: "USD",
          description: "Vitmiin Order Payment",
          items: items.map((i) => ({
            itemId: i.id,
            description: i.title,
            quantity: i.qty,
            price: i.price,
          })),
        },
      },
    };

    // Select endpoint
    const waafiUrl =
      WAAFIPAY_ENV === "live"
        ? "https://api.waafipay.net/asm"
        : "https://sandbox.waafipay.net/asm";

    // Call WaafiPay
    const response = await fetch(waafiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // Handle WaafiPay error
    if (result.responseCode !== "2001") {
      console.error("WaafiPay API error:", result);

      // Sandbox fallback (SAFE)
      if (WAAFIPAY_ENV !== "live") {
        console.log("⚡ Sandbox mode: simulating success");
        return NextResponse.json({
          status: "SUCCESS",
          simulated: true,
        });
      }

      return NextResponse.json(
        {
          status: "ERROR",
          message: result.responseMsg || "Payment failed",
          waafipay: result,
        },
        { status: 400 }
      );
    }

    // Success
    return NextResponse.json({
      status: "SUCCESS",
      waafipay: result,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}