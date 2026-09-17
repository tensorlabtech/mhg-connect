import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductSurface } from "@/components/product/product-page";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { claimQrAction } from "@/features/qr/claim-qr";
import { createPublicQrSvg } from "@/features/qr/create-public-qr-svg";
import { QrVisualCard } from "@/features/qr/qr-visual-card";
import { QrClaimSubmitButton } from "@/features/qr/qr-claim-submit-button";

type OwnedProfile = {
  id: string;
  linkedQrCount: number;
  name: string;
  profileLabel: string | null;
};

export async function QrActivationClaim({
  email,
  error,
  profiles,
  token,
}: {
  email: string;
  error: string | null;
  profiles: OwnedProfile[];
  token: string;
}) {
  const svg = await createPublicQrSvg(token);

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-6xl min-w-0 content-center gap-12 overflow-x-clip px-4 py-12 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-20">
      <section className="min-w-0 max-w-lg self-center">
        <h1 className="text-balance font-heading text-5xl leading-[1.02] tracking-[-0.035em] sm:text-6xl">
          Kích hoạt mã QR
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          Chọn hồ sơ khách sẽ thấy khi quét mã. Bạn luôn có thể đổi hồ sơ này
          sau.
        </p>
        <QrVisualCard
          className="mt-10"
          description="Quét để mở hồ sơ"
          heading="Hồ sơ của bạn"
          svg={svg}
        />
      </section>

      <ProductSurface className="min-w-0 self-center p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-medium">Sẵn sàng kích hoạt</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Đang dùng tài khoản{" "}
            <strong className="font-medium text-foreground">{email}</strong>
          </p>
        </div>
        {error ? (
          <Alert className="mt-6" variant="destructive">
            <AlertCircle />
            <AlertDescription>{getClaimErrorMessage(error)}</AlertDescription>
          </Alert>
        ) : null}
        <form action={claimQrAction} className="mt-6 grid gap-4">
          <input name="token" type="hidden" value={token} />
          {profiles.length ? (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">
                Hồ sơ hiển thị
              </legend>
              <RadioGroup defaultValue={profiles[0]?.id} name="profileId">
                {profiles.map((profile) => (
                  <label
                    className="flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl bg-secondary px-4 py-3 text-left"
                    key={profile.id}
                  >
                    <RadioGroupItem value={profile.id} />
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm text-foreground">
                        {profile.profileLabel ?? profile.name}
                      </strong>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Đã gắn {profile.linkedQrCount} mã QR
                      </span>
                    </span>
                  </label>
                ))}
                <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4">
                  <RadioGroupItem value="new" />
                  <span className="text-sm text-foreground">Tạo hồ sơ mới</span>
                </label>
              </RadioGroup>
            </fieldset>
          ) : (
            <>
              <input name="profileId" type="hidden" value="new" />
              <p className="rounded-overlay bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground">
                Bạn chưa có hồ sơ. Một hồ sơ mới sẽ được tạo sau khi kích hoạt.
              </p>
            </>
          )}
          <QrClaimSubmitButton />
        </form>
      </ProductSurface>
    </main>
  );
}

function getClaimErrorMessage(error: string) {
  if (error === "claim-conflict") {
    return "Mã vừa được một tài khoản khác kích hoạt. Hãy tải lại trang.";
  }
  if (error === "rate-limit") {
    return "Bạn thao tác quá nhanh. Vui lòng chờ một phút rồi thử lại.";
  }
  return "Không thể dùng hồ sơ đã chọn cho mã này.";
}
