"use client";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { GalleryVerticalEnd } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Login() {
  const router = useRouter();

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    try {
      await api.post("/auth/login", {
        email: fd.get("email"),
        password: fd.get("password"),
      });

      toast.success("Login successful!", {
        description: "You have been logged in successfully.",
      });

      router.push("/dashboard");
    } catch (error: any) {
      setErrors(error.response?.data?.errors || {});
      console.log(error);

      toast.error("Login failed", {
        description:
          error.response?.data?.message || "An error occurred during login",
      });
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm onSubmit={handle} errors={errors} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block"></div>
    </div>
  );
}
