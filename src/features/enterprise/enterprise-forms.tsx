"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createEnterpriseAction,
  saveEnterpriseBrandAction,
  assignEnterpriseMemberAction,
  type EnterpriseActionState,
} from "./enterprise-actions";

const initial: EnterpriseActionState = { success: false };
function Result({ state }: { state: EnterpriseActionState }) {
  return state.message ? (
    <p
      className={
        state.success ? "text-sm text-success" : "text-sm text-destructive"
      }
      role={state.success ? "status" : "alert"}
    >
      {state.message}
    </p>
  ) : null;
}

export function CreateEnterpriseForm() {
  const [state, action, pending] = useActionState(
    createEnterpriseAction,
    initial,
  );
  return (
    <form action={action} className="grid max-w-xl gap-3">
      <label htmlFor="enterprise-name" className="text-sm font-medium">
        Tên doanh nghiệp mới
      </label>
      <Input
        name="name"
        id="enterprise-name"
        required
        minLength={2}
        maxLength={120}
        disabled={pending}
      />
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Đang thêm…" : "Thêm doanh nghiệp"}
      </Button>
      <Result state={state} />
    </form>
  );
}

export function EnterpriseBrandForm({
  company,
}: {
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    customLogoEnabled: boolean;
    hideMhgLogo: boolean;
    updatedAt: Date;
  };
}) {
  const [state, action, pending] = useActionState(
    saveEnterpriseBrandAction,
    initial,
  );
  return (
    <form action={action} className="grid gap-4 border-t border-border/60 py-6">
      <input type="hidden" name="enterpriseId" value={company.id} />
      <input
        type="hidden"
        name="expectedUpdatedAt"
        value={company.updatedAt.toISOString()}
      />
      <h3 className="text-lg font-medium">{company.name}</h3>
      {company.logoUrl ? (
        <Image
          alt={`Logo ${company.name}`}
          src={company.logoUrl}
          width={180}
          height={80}
          className="h-20 w-44 rounded-overlay bg-white object-contain p-2"
          unoptimized
        />
      ) : (
        <p className="text-sm text-muted-foreground">Chưa có logo riêng.</p>
      )}
      <label className="flex min-h-10 items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="customLogoEnabled"
          defaultChecked={company.customLogoEnabled}
          disabled={pending}
          className="size-4 accent-[var(--gold)]"
        />
        Bật logo riêng cho toàn bộ nhân sự của doanh nghiệp
      </label>
      <label className="flex min-h-10 items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="hideMhgLogo"
          defaultChecked={company.hideMhgLogo}
          disabled={pending}
          className="mt-0.5 size-4 accent-[var(--gold)]"
        />
        <span>
          Quyền đặc biệt: bỏ logo MHG Airpurity, thẻ chỉ hiện logo cơ quan
          <span className="block text-xs text-muted-foreground">
            Chỉ cấp cho cơ quan đặc biệt. Mặc định mọi thẻ bắt buộc có logo MHG.
          </span>
        </span>
      </label>
      <label htmlFor={`logo-${company.id}`} className="text-sm">
        Chọn hoặc thay logo (PNG, JPG, WebP; tối đa 2 MB)
      </label>
      <Input
        id={`logo-${company.id}`}
        name="logo"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={pending}
        className="h-auto py-2"
      />
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Đang lưu…" : "Lưu nhận diện doanh nghiệp"}
      </Button>
      <Result state={state} />
    </form>
  );
}

export function EnterpriseMemberForm({
  member,
  companies,
}: {
  member: {
    id: string;
    name: string;
    email: string;
    enterpriseId: string | null;
  };
  companies: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(
    assignEnterpriseMemberAction,
    initial,
  );
  return (
    <form
      action={action}
      className="grid gap-3 border-t border-border/60 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,1fr)_auto] sm:items-center"
    >
      <input type="hidden" name="userId" value={member.id} />
      <div className="min-w-0">
        <p className="text-sm font-medium break-words">{member.name}</p>
        <p className="text-xs text-muted-foreground break-all">
          {member.email}
        </p>
      </div>
      <select
        aria-label={`Doanh nghiệp của ${member.name}`}
        name="enterpriseId"
        defaultValue={member.enterpriseId || ""}
        required
        disabled={pending || !companies.length}
        className="h-10 min-w-0 rounded-control border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <option value="" disabled>
          Chọn doanh nghiệp
        </option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Button
        type="submit"
        variant="secondary"
        disabled={pending || !companies.length}
      >
        {pending ? "Đang lưu…" : "Gán nhân sự"}
      </Button>
      <div className="sm:col-span-3">
        <Result state={state} />
      </div>
    </form>
  );
}
