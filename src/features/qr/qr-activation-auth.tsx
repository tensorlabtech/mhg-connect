import { ProductSurface } from "@/components/product/product-page";
import { AuthTabs } from "@/features/auth/auth-tabs";
import { createPublicQrSvg } from "@/features/qr/create-public-qr-svg";
import { QrVisualCard } from "@/features/qr/qr-visual-card";

export async function QrActivationAuth({ token }: { token: string }) {
  const svg = await createPublicQrSvg(token);

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-5xl min-w-0 content-center gap-10 overflow-x-clip px-4 py-12 sm:px-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-20 lg:py-16">
      <QrVisualCard
        className="order-2 mx-auto max-w-[20rem] lg:order-1 lg:mx-0"
        description="Quét để mở hồ sơ"
        heading="Hồ sơ của bạn"
        svg={svg}
      />

      <section className="order-1 min-w-0 max-w-lg self-center lg:order-2">
        <h1 className="text-balance font-heading text-5xl leading-[1.02] tracking-[-0.035em] sm:text-6xl">
          Kích hoạt mã QR
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          Đăng nhập để nhận quyền quản lý mã này. Sau đó, bạn có thể chọn hồ sơ
          khách sẽ thấy khi quét.
        </p>
        <ProductSurface
          className="mt-8 min-w-0 p-5 sm:p-6"
          aria-label="Xác thực tài khoản"
        >
          <AuthTabs returnTo={`/q/${token}`} />
        </ProductSurface>
      </section>
    </main>
  );
}
