import crypto from "crypto";

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

function getAuthHeader() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PAYMONGO_SECRET_KEY is not configured");
  }

  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export async function createQrPaymentIntent(orderReference: string, amountCentavos: number) {
  const authHeader = getAuthHeader();
  const headers = {
    "Content-Type": "application/json",
    Authorization: authHeader,
  };

  const intentRes = await fetch(`${PAYMONGO_API_BASE}/payment_intents`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountCentavos,
          currency: "PHP",
          payment_method_allowed: ["qrph"],
          metadata: { order_reference: orderReference },
        },
      },
    }),
  });

  if (!intentRes.ok) {
    throw new Error(`PayMongo payment intent creation failed with ${intentRes.status}: ${await intentRes.text()}`);
  }

  const intent = await intentRes.json();
  const intentId = intent.data.id;
  const clientKey = intent.data.attributes.client_key;

  const methodRes = await fetch(`${PAYMONGO_API_BASE}/payment_methods`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: { attributes: { type: "qrph" } },
    }),
  });

  if (!methodRes.ok) {
    throw new Error(`PayMongo payment method creation failed with ${methodRes.status}: ${await methodRes.text()}`);
  }

  const method = await methodRes.json();
  const paymentMethodId = method.data.id;

  const attachRes = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${intentId}/attach`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: { attributes: { payment_method: paymentMethodId, client_key: clientKey } },
    }),
  });

  if (!attachRes.ok) {
    throw new Error(`PayMongo payment method attach failed with ${attachRes.status}: ${await attachRes.text()}`);
  }

  const attached = await attachRes.json();
  const nextAction = attached.data.attributes.next_action;

  return {
    intentId: intentId as string,
    qrImageUrl: nextAction?.code?.image_url as string,
    expiresAt: nextAction?.code?.expires_at as string,
  };
}

export function verifyPaymongoSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== signatureBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}
