"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QrTokenForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = token.trim();
    if (!normalized || pending) return;
    setPending(true);
    router.push(`/q/${encodeURIComponent(normalized)}`);
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
      <Input
        aria-label="Mã QR"
        disabled={pending}
        onChange={(event) => setToken(event.target.value)}
        placeholder="Nhập mã trên tem, ví dụ DEMO-NEW"
        value={token}
      />
      <Button
        className="sm:w-auto"
        disabled={!token.trim() || pending}
        type="submit"
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : null}
        {pending ? "Đang mở…" : "Mở mã QR"}
        {!pending ? <ArrowRight /> : null}
      </Button>
    </form>
  );
}
