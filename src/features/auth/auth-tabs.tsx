"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthForm } from "@/features/auth/auth-form";

export function AuthTabs({
  defaultMode = "login",
  returnTo,
}: {
  defaultMode?: "login" | "register";
  returnTo: string;
}) {
  return (
    <Tabs className="min-w-0" defaultValue={defaultMode}>
      <TabsList className="mb-7 grid w-full grid-cols-2">
        <TabsTrigger value="login">Đăng nhập</TabsTrigger>
        <TabsTrigger value="register">Tạo tài khoản</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <AuthForm mode="login" returnTo={returnTo} showModeLink={false} />
      </TabsContent>
      <TabsContent value="register">
        <AuthForm mode="register" returnTo={returnTo} showModeLink={false} />
      </TabsContent>
    </Tabs>
  );
}
