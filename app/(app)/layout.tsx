import { BottomTabBar } from '@/components/navigation/bottom-tab-bar'
import { ScrollToTop } from '@/components/navigation/scroll-to-top'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <main className="min-h-screen pb-16">
        {children}
      </main>
      <BottomTabBar />
    </>
  )
}
