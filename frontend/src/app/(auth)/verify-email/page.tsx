"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);

        if (response.status === 200) {
          setIsVerified(true);
        } else {
          // If verification fails, redirect to home
          router.push("/");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  if (!token || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Email Verified
        </h1>
        <p className="mt-4">
          Congratulations! You have successfully verified your email address.
          You can now continue to the next step.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            prefetch={false}
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}
