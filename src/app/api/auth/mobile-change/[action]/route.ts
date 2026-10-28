import { NextRequest, NextResponse } from "next/server";

const allowedActions = new Set(["request", "resend", "verify"]);

function rewriteOtpCookie(setCookie: string, secure: boolean) {
  const parts = setCookie
    .split(";")
    .map((part) => part.trim())
    .filter(
      (part) =>
        !/^domain=/i.test(part) &&
        !/^path=/i.test(part) &&
        !/^samesite=/i.test(part) &&
        !/^secure$/i.test(part),
    );

  parts.push("Path=/", "SameSite=Lax", "HttpOnly");
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!allowedActions.has(action)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { detail: "API URL is not configured." },
      { status: 500 },
    );
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  if (authorization) headers.set("Authorization", authorization);
  if (cookie) headers.set("Cookie", cookie);

  try {
    const upstream = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/auth/mobile-change/${action}/`,
      {
        method: "POST",
        headers,
        body: await request.text(),
        cache: "no-store",
      },
    );
    const responseHeaders = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    });
    const cookies = upstream.headers.getSetCookie?.() ?? [];
    for (const setCookie of cookies) {
      if (/^otp_token=/i.test(setCookie.trim())) {
        responseHeaders.append(
          "Set-Cookie",
          rewriteOtpCookie(setCookie, request.nextUrl.protocol === "https:"),
        );
      }
    }

    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { detail: "Could not reach the authentication service." },
      { status: 502 },
    );
  }
}
