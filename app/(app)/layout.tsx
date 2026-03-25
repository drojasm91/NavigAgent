import { BottomTabBar } from '@/components/navigation/bottom-tab-bar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-screen pb-16">
        {children}
      </main>
      <BottomTabBar />
    </>
  )
}
