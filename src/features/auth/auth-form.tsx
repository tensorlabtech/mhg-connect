"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function AuthForm({
  mode,
  returnTo,
  showModeLink = true,
}: {
  mode: "login" | "register";
  returnTo: string;
  showModeLink?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const idPrefix = `auth-${mode}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setPending(true);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (mode === "register") {
      const confirmation = String(formData.get("passwordConfirmation") ?? "");
      if (password !== confirmation) {
        setError("Mật khẩu xác nhận chưa khớp.");
        setPending(false);
        return;
      }
    }

    try {
      const response =
        mode === "login"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({
              email,
              password,
              name: email.split("@")[0] || "Thành viên MHG",
            });

      if (response.error) {
        setError(
          mode === "login"
            ? "Email hoặc mật khẩu chưa đúng. Vui lòng thử lại."
            : "Chưa thể tạo tài khoản. Email có thể đã được sử dụng.",
        );
        setPending(false);
        return;
      }

      router.replace(returnTo);
      return;
    } catch {
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
      setPending(false);
    }
  }

  const otherHref = `${mode === "login" ? "/register" : "/login"}?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <form className="grid gap-6" onSubmit={submit}>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          autoComplete="email"
          id={`${idPrefix}-email`}
          name="email"
          placeholder="ban@example.com"
          required
          type="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-password`}>Mật khẩu</Label>
        <div className="relative">
          <Input
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className="pr-12"
            id={`${idPrefix}-password`}
            minLength={8}
            name="password"
            placeholder={mode === "login" ? "Nhập mật khẩu" : "Ít nhất 8 ký tự"}
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {mode === "register" ? (
          <p className="text-xs leading-5 text-muted-foreground">
            Dùng ít nhất 8 ký tự.
          </p>
        ) : null}
      </div>
      {mode === "register" ? (
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-password-confirmation`}>
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <Input
              autoComplete="new-password"
              className="pr-12"
              id={`${idPrefix}-password-confirmation`}
              minLength={8}
              name="passwordConfirmation"
              placeholder="Nhập lại mật khẩu"
              required
              type={showConfirmation ? "text" : "password"}
            />
            <button
              aria-label={
                showConfirmation
                  ? "Ẩn mật khẩu xác nhận"
                  : "Hiện mật khẩu xác nhận"
              }
              aria-pressed={showConfirmation}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => setShowConfirmation((value) => !value)}
              type="button"
            >
              {showConfirmation ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>
      ) : null}
      <Button
        className="mt-2 w-full"
        disabled={pending}
        size="lg"
        type="submit"
      >
        {pending ? <LoaderCircle className="animate-spin" /> : null}
        {pending
          ? mode === "login"
            ? "Đang đăng nhập…"
            : "Đang tạo tài khoản…"
          : mode === "login"
            ? "Đăng nhập"
            : "Tạo tài khoản"}
      </Button>
      {showModeLink ? (
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={otherHref}
          >
            {mode === "login" ? "Tạo tài khoản" : "Đăng nhập"}
          </Link>
        </p>
      ) : null}
    </form>
  );
}
