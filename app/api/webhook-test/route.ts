import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { target_url, secret, payload } = await request.json();

  if (!target_url || !payload) {
    return NextResponse.json({ ok: false, status: 422, body: "Missing target_url or payload", signature: "" });
  }

  const body = JSON.stringify(payload);
  const sigSecret = secret || "test-secret";

  // Generate HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sigSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const signature = `sha256=${hex}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(target_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-eximia-signature": signature,
        "x-eximia-event": payload.event || "test.ping",
        "User-Agent": "eximia-hub-webhook-tester/1.0",
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let responseBody: unknown;
    try {
      responseBody = await res.json();
    } catch {
      responseBody = await res.text().catch(() => null);
    }

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      body: responseBody,
      signature,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      status: 0,
      body: err instanceof Error ? err.message : "Network error",
      signature,
    });
  }
}
