import { SiteFooter } from "@/features/layout/site-footer";
import { SiteHeader } from "@/features/layout/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 sm:px-8 lg:px-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
