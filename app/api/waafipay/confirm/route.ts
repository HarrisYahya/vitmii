import { NextResponse } from "next/server";

/* =========================
   TYPES
========================= */
type Item = {
  id: string | number;
  title: string;
  price: number;
  qty: number;
};

type RequestBody = {
  phone: string;
  total: number;
  district: string;
  delivery: boolean;
  deliveryFee: number;
  items: Item[];
};

/* =========================
   HELPERS
========================= */
function isValidSomaliPhone(phone: string) {
  return /^252\d{9}$/.test(phone);
}

function waafiTimestamp() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* =========================
   POST HANDLER
========================= */
export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { phone, total, district, items } = body;

    if (!phone || !total || !district || !items?.length) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidSomaliPhone(phone)) {
      return NextResponse.json(
        {
          status: "ERROR",
          message: "Invalid phone format. Use 252XXXXXXXXX",
        },
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
      console.error("❌ Missing WaafiPay ENV");
      return NextResponse.json(
        { status: "ERROR", message: "Server configuration error" },
        { status: 500 }
      );
    }

    /* =========================
       WAAFIPAY PAYLOAD (STRICT)
    ========================= */
    const payload = {
      schemaVersion: "1.0",
      requestId: Date.now().toString(),
      timestamp: waafiTimestamp(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: WAAFIPAY_MERCHANT_UID,
        apiUserId: String(WAAFIPAY_API_USER_ID),
        apiKey: WAAFIPAY_API_KEY,
        paymentMethod: "MWALLET_ACCOUNT",
        payerInfo: {
          accountNo: phone,
        },
        transactionInfo: {
          referenceId: `ORDER-${Date.now()}`,
          invoiceId: `INV-${Date.now()}`,
          amount: total.toFixed(2),
          currency: "USD",
          description: "Vitmiin Order Payment",
          items: items.map((i) => ({
            itemId: String(i.id),
            description: i.title,
            quantity: String(i.qty),
            price: i.price.toFixed(2),
          })),
        },
      },
    };

    const waafiUrl =
      WAAFIPAY_ENV === "live"
        ? "https://api.waafipay.net/asm"
        : "https://sandbox.waafipay.net/asm";

    const response = await fetch(waafiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.responseCode !== "2001") {
      console.error("❌ WaafiPay ERROR:", result);
      return NextResponse.json(
        {
          status: "ERROR",
          message: result.responseMsg || "Payment failed",
          waafipay: result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "SUCCESS",
      waafipay: result,
    });
  } catch (err) {
    console.error("🔥 Server error:", err);
    return NextResponse.json(
      { status: "ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}