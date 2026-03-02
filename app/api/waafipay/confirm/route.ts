import { NextResponse } from "next/server";

/* ======================
   TYPES
====================== */
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

/* ======================
   PHONE NORMALIZER
====================== */
function normalizeSomaliPhone(phone: string) {
  let cleaned = phone.replace(/[^\d]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "252" + cleaned.slice(1);
  }

  if (cleaned.startsWith("252252")) {
    cleaned = cleaned.slice(3);
  }

  return cleaned;
}

function isValidSomaliPhone(phone: string) {
  return /^252\d{9}$/.test(phone);
}

/* ======================
   POST HANDLER
====================== */
export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();

    let { phone, total, district, items } = body;

    if (!phone || !total || !district || !items?.length) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing fields" },
        { status: 400 }
      );
    }

    phone = normalizeSomaliPhone(phone);

    if (!isValidSomaliPhone(phone)) {
      return NextResponse.json(
        { status: "ERROR", message: "Invalid Somali phone" },
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
        { status: "ERROR", message: "Missing WaafiPay ENV" },
        { status: 500 }
      );
    }

    /* ======================
       WAAFIPAY PAYLOAD
    ====================== */
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
        paymentMethod: "MWALLET_ACCOUNT",

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

    const waafiUrl =
      WAAFIPAY_ENV === "live"
        ? "https://api.waafipay.net/asm"
        : "https://sandbox.waafipay.net/asm";

    const response = await fetch(waafiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await response.json();

    console.log("WaafiPay:", result);

    if (result.responseCode !== "2001") {
      if (WAAFIPAY_ENV !== "live") {
        return NextResponse.json({
          status: "SUCCESS",
          simulated: true,
        });
      }

      return NextResponse.json(
        {
          status: "ERROR",
          message: result.responseMsg,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "SUCCESS",
      waafipay: result,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { status: "ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}