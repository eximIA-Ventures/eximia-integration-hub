import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { url, method, api_key, body } = await request.json();

  if (!url || !api_key) {
    return NextResponse.json(
      { status: 422, body: { error: "URL and API key required" } },
      { status: 200 }
    );
  }

  // Sanitize — strip non-ASCII chars that break HTTP headers
  const cleanKey = api_key.replace(/[^\x20-\x7E]/g, "").trim();

  if (!cleanKey) {
    return NextResponse.json(
      { status: 422, body: { error: "API key contains invalid characters" } },
      { status: 200 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(url, {
      method: method || "GET",
      headers: {
        "x-eximia-api-key": cleanKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let responseBody: unknown;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("json")) {
      responseBody = await res.json();
    } else {
      responseBody = await res.text();
    }

    return NextResponse.json({ status: res.status, body: responseBody });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ status: 504, body: { error: "Timeout (15s)" } });
    }
    const message = err instanceof Error ? err.message : "Network error";
    const cause = err instanceof Error && err.cause ? String(err.cause) : undefined;
    return NextResponse.json({
      status: 0,
      body: { error: message, cause, hint: "If 'fetch failed', the Hub server cannot reach the target URL. Check if the domain is publicly accessible." },
    });
  }
}
