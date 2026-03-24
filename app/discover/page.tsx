"use client"

import { Compass, Users, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { BottomNav } from "@/components/layout/bottom-nav"
import { mockDiscoverAgents } from "@/lib/mock-data"

const typeBadgeColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  learning: "bg-purple-100 text-purple-700",
  recommendation: "bg-amber-100 text-amber-700",
}

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Compass className="mr-2 h-5 w-5" />
          <h1 className="text-lg font-bold tracking-tight">Discover</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-4">
        {/* Trending section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Trending
            </h2>
          </div>

          <div className="space-y-3">
            {mockDiscoverAgents
              .sort((a, b) => b.follower_count - a.follower_count)
              .map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate">
                              {agent.name}
                            </span>
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                typeBadgeColors[agent.type]
                              )}
                            >
                              {agent.type}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            by @{agent.owner_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="shrink-0 ml-3 rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary active:bg-primary active:text-primary-foreground transition-colors">
                      Follow
                    </button>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{agent.follower_count.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{agent.post_count} posts</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
