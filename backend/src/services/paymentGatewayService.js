import crypto from "node:crypto";
import { ApiError } from "../utils/apiError.js";

const unavailableMessage =
  "Online payment is currently unavailable. Please contact us or try again later.";

export function isPaymentGatewayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim()
  );
}

export function getPaymentGatewayPublicConfig() {
  return {
    razorpayEnabled: isPaymentGatewayConfigured(),
    keyId: isPaymentGatewayConfigured() ? process.env.RAZORPAY_KEY_ID : undefined,
    message: isPaymentGatewayConfigured() ? undefined : unavailableMessage,
  };
}

function getBasicAuthHeader() {
  return Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");
}

export async function createGatewayOrder({ amount, currency = "INR", receipt, notes }) {
  if (!isPaymentGatewayConfigured()) {
    throw new ApiError(503, unavailableMessage);
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${getBasicAuthHeader()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt,
      notes,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.description || "Unable to create Razorpay order."
    );
  }

  return payload;
}

export function verifyGatewayPaymentSignature({
  orderId,
  paymentId,
  signature,
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new ApiError(503, unavailableMessage);
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(String(signature || ""));
  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

export function isWebhookConfigured() {
  return Boolean(process.env.RAZORPAY_WEBHOOK_SECRET?.trim());
}

export function verifyGatewayWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new ApiError(
      503,
      "Razorpay webhook secret is not configured yet. Webhook verification is unavailable."
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(String(signature || ""));
  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}
