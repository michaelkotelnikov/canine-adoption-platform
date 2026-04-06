import { SiteHeader } from "@/features/layout/site-header";

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
