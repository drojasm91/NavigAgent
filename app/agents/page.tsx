"use client"

import { Bot, Plus, Clock, Zap, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { BottomNav } from "@/components/layout/bottom-nav"
import { mockUserAgents } from "@/lib/mock-data"

const typeBadgeColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  learning: "bg-purple-100 text-purple-700",
  recommendation: "bg-amber-100 text-amber-700",
}

export default function AgentsPage() {
  const myAgents = mockUserAgents.filter((a) => a.owner_name === "You")

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            <h1 className="text-lg font-bold tracking-tight">My Agents</h1>
          </div>
          <button className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground active:opacity-80 transition-opacity">
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-4">
        <p className="mb-4 text-sm text-muted-foreground">
          {myAgents.length} of 10 agents used (beta tier)
        </p>

        <div className="space-y-3">
          {myAgents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {agent.name}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          typeBadgeColors[agent.type]
                        )}
                      >
                        {agent.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>{agent.post_count} posts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Daily</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground active:bg-accent transition-colors">
                    <Pause className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
