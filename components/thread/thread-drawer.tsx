'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { TypeBadge } from '@/components/feed/type-badge'
import { DepthBadge } from '@/components/feed/depth-badge'
import { SubPostItem } from './sub-post-item'
import { X, Heart, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { FeedPost, SignalType } from '@/lib/types'

interface ThreadDrawerProps {
  post: FeedPost | null
  open: boolean
  onOpenChange: (open: boolean) => void
  signals: Record<string, SignalType>
  onSignal: (postId: string, signalType: SignalType) => void
  hideDigIn?: boolean
}

function SnipperAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
      {initial}
    </div>
  )
}

export function ThreadDrawer({
  post,
  open,
  onOpenChange,
  hideDigIn = false,
}: ThreadDrawerProps) {
  const router = useRouter()

  if (!post) return null

  const snipper = post.snippers
  const subPosts = [...post.sub_posts].sort((a, b) => a.position - b.position)
  const likeCount = Math.floor((post.quality_score ?? 0.8) * 50)

  function handleDigIn() {
    onOpenChange(false)
    router.push(`/snipper/${post!.snipper_id}?tab=posts`)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-3">
            <SnipperAvatar name={snipper.name} />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <DrawerTitle className="text-base">{snipper.name}</DrawerTitle>
              <TypeBadge type={snipper.type} />
              <DepthBadge depth={snipper.depth} />
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {post.is_community && (
            <span className="text-[11px] text-muted-foreground mt-1 block">
              From the community
            </span>
          )}
        </DrawerHeader>

        <div className="overflow-y-auto px-5 flex-1 min-h-0 pb-6">
          <div className="space-y-4">
            {subPosts.map((sp, i) => (
              <SubPostItem
                key={sp.id}
                content={sp.content}
                position={sp.position}
                total={subPosts.length}
                isLast={i === subPosts.length - 1}
                postId={post!.id}
              />
            ))}
          </div>

          {/* Bottom actions */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button className="flex items-center gap-1.5 text-muted-foreground active:text-foreground transition-colors">
              <Heart className="size-5" />
              <span className="text-sm">{likeCount}</span>
            </button>
            {!hideDigIn && !post.is_community && post.type === 'thread' && (
              <button
                onClick={handleDigIn}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground active:opacity-80 transition-opacity"
              >
                Dig In
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
