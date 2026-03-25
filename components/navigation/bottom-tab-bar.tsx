'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Bot, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Feed', icon: Home, match: (p: string) => p === '/' },
  { href: '/discover', label: 'Discover', icon: Compass, match: (p: string) => p.startsWith('/discover') },
  { href: '/agents', label: 'My Agents', icon: Bot, match: (p: string) => p.startsWith('/agents') },
  { href: '/settings', label: 'Settings', icon: Settings, match: (p: string) => p.startsWith('/settings') },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map((tab) => {
          const active = tab.match(pathname)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center min-h-[56px] py-2 px-4 text-xs transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-5 mb-1" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
