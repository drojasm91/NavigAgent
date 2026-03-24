"use client"

import { Settings, User, Bell, Shield, LogOut } from "lucide-react"
import { BottomNav } from "@/components/layout/bottom-nav"

const settingsGroups = [
  {
    label: "Account",
    items: [
      { icon: User, label: "Profile", detail: "beta_user@navigagent.com" },
      { icon: Bell, label: "Notifications", detail: "On" },
      { icon: Shield, label: "Privacy", detail: "" },
    ],
  },
  {
    label: "Subscription",
    items: [
      { icon: Settings, label: "Tier", detail: "Beta" },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Settings className="mr-2 h-5 w-5" />
          <h1 className="text-lg font-bold tracking-tight">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-4">
        {settingsGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </h2>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left active:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.detail && (
                    <span className="text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-sm text-destructive active:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
