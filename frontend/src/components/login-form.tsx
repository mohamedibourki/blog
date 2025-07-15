import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, onSubmit, errors, ...props }: any) {
  const handleGoogleLogin = async () => {
    try {
      // This will redirect to the backend's Google OAuth endpoint
      window.location.href = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/api/auth/google`;
    } catch (error) {
      console.error("Error during Google login:", error);
      // Handle error (you might want to show a toast or error message)
      if (errors && typeof errors.onSubmit === "function") {
        errors.onSubmit({ message: "Failed to initiate Google login" });
      }
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
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
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/register" className="underline underline-offset-4">
          Register
        </a>
      </div>
    </form>
  );
}
