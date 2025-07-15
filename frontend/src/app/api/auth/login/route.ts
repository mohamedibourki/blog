import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await api.post("/auth/login", body);
  const setCookie = res.headers["set-cookie"];

  const response = NextResponse.json(res.data, { status: res.status });
  if (setCookie) response.headers.set("Set-Cookie", setCookie.join(","));

  return response;
}
