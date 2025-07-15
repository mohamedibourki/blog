"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleGoogleRegister = async () => {
    try {
      // This will redirect to the backend's Google OAuth endpoint
      window.location.href = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/api/auth/google`;
    } catch (error) {
      console.error("Error during Google register:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await api.post("/auth/register", values);

    toast.success("Account created!", {
      description: "Your account has been created successfully.",
    });

    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Max" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create an account
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleRegister}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.223 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
                    fill="#FFC107"
                  />
                  <path
                    d="M6.30664 14.691L12.8776 19.51C14.6556 14.109 18.9616 10 24 10C27.059 10 29.842 11.154 31.961 13.039L37.618 7.382C34.046 4.053 29.268 2 24 2C14.577 2 6.84964 8.837 6.30664 14.691Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M24 44C29.166 44 33.86 41.877 37.409 38.568L31.219 33.6C29.1439 35.1483 26.6075 35.956 24 36C18.798 36 14.381 32.684 12.717 28.054L6.19531 33.079C7.50331 38.343 12.227 44 24 44Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M43.611 20.083L43.595 20H24V28H35.303C34.5142 30.2164 33.0934 32.1532 31.214 33.601L31.219 33.6L37.409 38.568C36.971 38.98 44 34 44 24C44 22.659 43.862 21.35 43.611 20.083Z"
                    fill="#1976D2"
                  />
                </svg>
                Login with Google
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
