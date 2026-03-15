import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { url, method, api_key, body } = await request.json();

  if (!url || !api_key) {
    return NextResponse.json(
      { status: 422, body: { error: "URL and API key required" } },
      { status: 200 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(url, {
      method: method || "GET",
      headers: {
        "x-eximia-api-key": api_key,
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
    return NextResponse.json({
      status: 0,
      body: { error: err instanceof Error ? err.message : "Network error" },
    });
  }
}
