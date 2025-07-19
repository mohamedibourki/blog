"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAuthStatus } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await checkAuthStatus();
      
      if (!isAuthenticated) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);
}
