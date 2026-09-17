import { Skeleton } from "@/components/ui/skeleton";

function HeaderSkeleton() {
  return (
    <header className="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-6">
      <div className="flex min-h-16 items-center justify-between gap-4 rounded-surface bg-card px-5 sm:min-h-[4.5rem] sm:px-6">
        <Skeleton className="h-7 w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="hidden h-4 w-36 md:block" />
          <Skeleton className="size-9 rounded-control" />
        </div>
      </div>
    </header>
  );
}

function SidebarSkeleton({ admin = false }: { admin?: boolean }) {
  return (
    <aside className="rounded-surface bg-card p-5 sm:p-6">
      {admin ? <Skeleton className="h-3 w-24" /> : null}
      <Skeleton className={`${admin ? "mt-5" : ""} h-11 w-4/5`} />
      <div className="mt-5 grid gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-7 grid gap-2">
        <Skeleton className="h-10 w-full rounded-control" />
        <Skeleton className="h-10 w-full rounded-control" />
      </div>
    </aside>
  );
}

export function DashboardPageSkeleton({ admin = false }: { admin?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Đang tải trang" role="status">
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-10 sm:px-8 sm:pt-8 sm:pb-14">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,2.28fr)] lg:gap-6">
          <SidebarSkeleton admin={admin} />
          <div className="min-w-0">
            {admin ? (
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    className="rounded-surface bg-card p-5 sm:p-6"
                    key={index}
                  >
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-4 h-12 w-20" />
                  </div>
                ))}
              </div>
            ) : null}
            <section className={admin ? "mt-10" : ""}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <Skeleton className="h-9 w-52" />
                <Skeleton className="h-3 w-16" />
              </div>
              {admin ? (
                <Skeleton className="mb-6 h-10 w-full max-w-xl" />
              ) : null}
              <div className="grid gap-2">
                {Array.from({ length: admin ? 5 : 3 }).map((_, index) => (
                  <div
                    className="flex items-center justify-between rounded-surface bg-card p-5 sm:px-6"
                    key={index}
                  >
                    <div className="flex w-full max-w-md items-center gap-4">
                      <Skeleton className="h-5 w-2/5" />
                      <Skeleton className="hidden h-4 w-1/3 sm:block" />
                    </div>
                    <Skeleton className="size-5 shrink-0" />
                  </div>
                ))}
              </div>
            </section>
            {!admin ? (
              <section className="mt-12">
                <Skeleton className="mb-6 h-9 w-44" />
                <div className="grid gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton
                      className="h-16 w-full rounded-surface"
                      key={index}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export function ProfileBuilderPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải hồ sơ"
      className="grid min-h-dvh bg-background lg:grid-cols-[23.5rem_minmax(0,1fr)]"
      role="status"
    >
      <aside className="hidden h-dvh bg-card p-5 lg:block">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="size-10 rounded-control" />
          <Skeleton className="h-10 w-36 rounded-control" />
        </div>
        <Skeleton className="mt-10 h-7 w-40" />
        <div className="mt-8 grid gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="grid gap-2" key={index}>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full rounded-control" />
            </div>
          ))}
        </div>
      </aside>
      <section className="min-w-0 px-4 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <Skeleton className="h-20 w-4/5 sm:h-28" />
              <Skeleton className="mt-6 h-5 w-2/3" />
              <div className="mt-8 flex gap-3">
                <Skeleton className="h-11 w-36 rounded-control" />
                <Skeleton className="h-11 w-28 rounded-control" />
              </div>
            </div>
            <Skeleton className="aspect-[4/5] w-full rounded-surface" />
          </div>
          <div className="mt-16 grid gap-12 border-t border-border/40 pt-12 lg:grid-cols-2">
            <div>
              <Skeleton className="h-10 w-40" />
              <Skeleton className="mt-6 h-4 w-full" />
              <Skeleton className="mt-3 h-4 w-5/6" />
              <Skeleton className="mt-3 h-4 w-3/4" />
            </div>
            <div>
              <Skeleton className="h-10 w-52" />
              <div className="mt-6 grid gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton className="h-14 w-full" key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function QrPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Đang tải mã QR"
      className="mx-auto grid min-h-dvh w-full max-w-6xl content-center gap-12 px-4 py-12 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-20"
      role="status"
    >
      <section>
        <Skeleton className="h-16 w-4/5 sm:h-20" />
        <Skeleton className="mt-6 h-5 w-full max-w-md" />
        <Skeleton className="mt-3 h-5 w-3/4" />
        <Skeleton className="mt-10 aspect-[1.9/1] w-full rounded-surface" />
      </section>
      <section className="self-center rounded-surface bg-card p-5 sm:p-6">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-4 h-4 w-3/4" />
        <div className="mt-8 grid gap-3">
          <Skeleton className="h-16 w-full rounded-overlay" />
          <Skeleton className="h-16 w-full rounded-overlay" />
          <Skeleton className="h-11 w-full rounded-control" />
        </div>
      </section>
    </main>
  );
}
