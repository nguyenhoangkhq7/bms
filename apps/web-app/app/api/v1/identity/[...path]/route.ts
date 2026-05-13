import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const IDENTITY_BASE_URL =
  process.env.IDENTITY_API_BASE_URL || "http://identity-service:8080";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyIdentity(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetUrl = `${IDENTITY_BASE_URL}/${path.join("/")}${req.nextUrl.search}`;
  const authorization = req.headers.get("authorization");
  const cookie = req.headers.get("cookie");

  try {
    const body = req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.text();

    const response = await axios.request({
      url: targetUrl,
      method: req.method,
      data: body,
      headers: {
        "Content-Type": req.headers.get("content-type") || "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      validateStatus: () => true,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        message:
          error?.code === "ECONNREFUSED"
            ? "Identity service is not reachable from web-app"
            : error?.message || "Identity proxy failed",
      },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxyIdentity(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxyIdentity(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxyIdentity(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxyIdentity(req, context);
}
