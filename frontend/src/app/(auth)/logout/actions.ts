"use server";

import { cookies } from "next/headers";

export const POST = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return { status: 200, success: true };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      success: false,
      error: error.message,
    };
  }
};
