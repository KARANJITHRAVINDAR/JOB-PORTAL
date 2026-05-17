import { BottomNav, Sidebar } from '@/components/layout/Navigation';

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-deep-black text-white overflow-hidden">
      <Sidebar role="seeker" />
      <div className="flex-1 md:ml-64 flex flex-col h-full overflow-y-auto pb-16 md:pb-0">
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <BottomNav role="seeker" />
    </div>
  );
}
