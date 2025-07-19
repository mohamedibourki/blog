"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "./api";

export const protectRoute = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");
  const refreshToken = cookieStore.get("refreshToken");

  if (!accessToken || !refreshToken) {
    redirect("/login");
  }
};

export const checkAuthStatus = async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken) {
      return { isAuthenticated: false };
    }

    const response = await api.post("/auth/verify-token", {
      token: accessToken.value,
    });
    return { isAuthenticated: response.data.valid };
  } catch (error) {
    console.error("Auth check failed:", error);
    return { isAuthenticated: false };
  }
};

export const verifyToken = async (token: string) => {
  try {
    const response = await api.post("/auth/verify-token", { token });
    return response.data;
  } catch (error) {
    console.error("Token verification failed:", error);
    return { valid: false, userId: null };
  }
};

export const refreshToken = async (token: string) => {
  try {
    const response = await api.post("/auth/refresh-token", {
      refreshToken: token,
    });

    // Ensure proper response structure
    if (!response.data?.accessToken) {
      throw new Error("Invalid token response");
    }

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken, // Optional new refresh token
    };
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error; // Re-throw for middleware handling
  }
};
