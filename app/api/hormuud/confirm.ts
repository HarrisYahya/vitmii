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
    const {
      phone,
      total,
      district,
      delivery,
      deliveryFee,
      items,
    } = body;

    // ===============================
    // Basic validation (UNCHANGED)
    // ===============================
    if (!phone || !total) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing phone or total" },
        { status: 400 }
      );
    }

    // ===============================
    // ENV VARIABLES (FIXED ONLY)
    // ===============================
    const {
      MERCHANT_UID,
      API_USER_ID,
      API_KEY,
    } = process.env;

    if (!MERCHANT_UID || !API_USER_ID || !API_KEY) {
      console.error("Hormuud credentials missing!");
      return NextResponse.json(
        { status: "ERROR", message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // ===============================
    // Build Hormuud payload
    // ===============================
    const payload = {
      schemaVersion: "1.0",
      requestId: crypto.randomUUID(),
      timestamp: Date.now(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: MERCHANT_UID,
        apiUserId: API_USER_ID,
        apiKey: API_KEY,
        payerInfo: {
          accountNo: phone,
        },
        transactionInfo: {
          referenceId: `ORDER-${Date.now()}`,
          invoiceId: `INV-${Date.now()}`,
          amount: total,
          currency: "USD",
          description: "Vitmii Order Payment",
        },
      },
    };

    // ===============================
    // Send request to Hormuud
    // ===============================
    const response = await fetch(
      "https://api.waafipay.net/asm",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Hormuud API error:", data);
      return NextResponse.json(
        {
          status: "ERROR",
          message: "Hormuud API failed",
          details: data,
        },
        { status: 500 }
      );
    }

    // ===============================
    // SUCCESS
    // ===============================
    return NextResponse.json({
      status: "SUCCESS",
      data,
    });
  } catch (error) {
    console.error("Hormuud confirm error:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
