"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return NextResponse.json(
    { message: "User logged out successfully" },
    { status: 200 }
  );
}
