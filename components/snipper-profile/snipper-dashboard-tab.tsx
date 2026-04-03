'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { FeedPost, FeedSnipper } from '@/lib/types'

interface SnipperDashboardTabProps {
  snipper: FeedSnipper
  posts: FeedPost[]
}

export function SnipperDashboardTab({ snipper, posts }: SnipperDashboardTabProps) {
  const avgQuality = posts.length > 0
    ? (posts.reduce((sum, p) => sum + (p.quality_score ?? 0), 0) / posts.length).toFixed(2)
    : '--'

  const topPosts = [...posts]
    .sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0))
    .slice(0, 3)

  return (
    <div className="space-y-4 pt-4">
      {/* Description */}
      {snipper.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {snipper.description}
        </p>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <span className="text-[11px] text-muted-foreground font-medium">Total Posts</span>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <span className="text-2xl font-bold">{posts.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <span className="text-[11px] text-muted-foreground font-medium">Avg Quality</span>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <span className="text-2xl font-bold">{avgQuality}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <span className="text-[11px] text-muted-foreground font-medium">Type</span>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <span className="text-2xl font-bold capitalize">{snipper.type}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <span className="text-[11px] text-muted-foreground font-medium">Cadence</span>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <span className="text-2xl font-bold">Daily</span>
          </CardContent>
        </Card>
      </div>

      {/* Most liked posts */}
      {topPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Top Posts</h3>
          <div className="space-y-2">
            {topPosts.map((post) => {
              const hook = post.sub_posts[0]?.content ?? ''
              return (
                <Card key={post.id} className="p-3">
                  <p className="text-sm leading-relaxed line-clamp-2">{hook}</p>
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Quality: {(post.quality_score ?? 0).toFixed(2)}
                  </span>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
