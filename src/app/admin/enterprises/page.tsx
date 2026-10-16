import Link from "next/link";
import { ProductHeader } from "@/components/product/product-header";
import {
  ProductPage,
  ProductSectionHeading,
} from "@/components/product/product-page";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/session";
import { getEnterpriseAdministration } from "@/features/enterprise/enterprise-data";
import {
  CreateEnterpriseForm,
  EnterpriseBrandForm,
  EnterpriseMemberForm,
} from "@/features/enterprise/enterprise-forms";

export default async function EnterpriseAdministrationPage() {
  const session = await requireAdmin();
  const { companies, members } = await getEnterpriseAdministration();
  return (
    <>
      <ProductHeader admin email={session.user.email} />
      <ProductPage className="py-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">Quay lại quản lý QR</Link>
        </Button>
        <h1 className="mt-6 font-heading text-4xl">Nhận diện doanh nghiệp</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          Quản trị MHG bật quyền và tải logo một lần cho mỗi doanh nghiệp. Tất
          cả thẻ chính, mẫu thẻ và bản in của các nhân sự được gán đều dùng
          chung logo. Khi tắt quyền, hệ thống dùng lại logo MHG.
        </p>
        <section className="mt-10">
          <ProductSectionHeading title="Thêm doanh nghiệp" />
          <CreateEnterpriseForm />
        </section>
        <section className="mt-10">
          <ProductSectionHeading
            title="Logo và quyền sử dụng"
            count={`${companies.length} doanh nghiệp`}
          />
          {companies.length ? (
            companies.map((company) => (
              <EnterpriseBrandForm
                key={`${company.id}-${company.updatedAt.getTime()}`}
                company={company}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Thêm doanh nghiệp trước, sau đó tải logo và gán nhân sự.
            </p>
          )}
        </section>
        <section className="mt-10">
          <ProductSectionHeading title="Gán nhân sự theo tài khoản" />
          <p className="mb-4 text-sm text-muted-foreground">
            Mỗi tài khoản thuộc một doanh nghiệp nhận diện. Gán lại sẽ chuyển
            toàn bộ thẻ của tài khoản sang doanh nghiệp mới; không tự suy luận
            từ trường công ty trên hồ sơ.
          </p>
          {members.map((member) => (
            <EnterpriseMemberForm
              key={`${member.id}-${member.enterpriseId}`}
              member={member}
              companies={companies}
            />
          ))}
        </section>
      </ProductPage>
    </>
  );
}
