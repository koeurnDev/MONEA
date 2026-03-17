import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const envelope = body.split("\n");
    const header = JSON.parse(envelope[0]);

    const dsn = new URL(header.dsn);
    const projectId = dsn.pathname.replace("/", "");

    // Sentry host (ingest.sentry.io or your own host)
    const sentryHost = dsn.host;
    const sentryUrl = `https://${sentryHost}/api/${projectId}/envelope/`;

    const response = await fetch(sentryUrl, {
      method: "POST",
      body,
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (e) {
    console.error("Sentry tunnel error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
