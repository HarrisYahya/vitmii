// vitmii/app/api/hormuud/confirm.ts
import { NextResponse } from "next/server";

interface RequestBody {
  phone: string;
  total: number;
  district: string;
  delivery: boolean;
  deliveryFee: number;
  items: Array<{
    id: string | number;
    title: string;
    price: number;
    qty: number;
  }>;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { phone, total, district } = body;

    // ✅ Basic validation (unchanged behavior)
    if (!phone || !total) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing phone or total" },
        { status: 400 }
      );
    }

    // ✅ Load Hormuud credentials
    const {
      HORMUUD_MERCHANT_UID,
      HORMUUD_API_USER,
      HORMUUD_TOKEN,
    } = process.env;

    if (!HORMUUD_MERCHANT_UID || !HORMUUD_API_USER || !HORMUUD_TOKEN) {
      console.error("Hormuud credentials missing");
      return NextResponse.json(
        { status: "ERROR", message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // ✅ REAL Hormuud payload (official structure)
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
        payerInfo: {
          accountNo: phone,
        },
        description: `Order (${district})`,
      },
    };

    // ✅ REAL Hormuud API call (production)
    const response = await fetch(
      "https://api.hormuud.com/evcplus/payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HORMUUD_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hormuud API error:", response.status, errorText);
      return NextResponse.json(
        { status: "ERROR", message: "Hormuud payment failed" },
        { status: 500 }
      );
    }

    const hormuudResponse = await response.json();

    // ✅ Success response (frontend already handles this)
    return NextResponse.json({
      status: "SUCCESS",
      hormuud: hormuudResponse,
    });

  } catch (error) {
    console.error("Hormuud API exception:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}
