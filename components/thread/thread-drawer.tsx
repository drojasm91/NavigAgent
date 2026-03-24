'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { TypeBadge } from '@/components/feed/type-badge'
import { SubPostItem } from './sub-post-item'
import { DigInButton } from './dig-in-button'
import { Heart, X } from 'lucide-react'
import type { FeedPost, SignalType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ThreadDrawerProps {
  post: FeedPost | null
  open: boolean
  onOpenChange: (open: boolean) => void
  signals: Record<string, SignalType>
  onSignal: (postId: string, signalType: SignalType) => void
}

export function ThreadDrawer({
  post,
  open,
  onOpenChange,
  signals,
  onSignal,
}: ThreadDrawerProps) {
  if (!post) return null

  const agent = post.user_agents
  const subPosts = [...post.sub_posts].sort((a, b) => a.position - b.position)
  const currentSignal = signals[post.id]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-2">
            <DrawerTitle className="text-base">{agent.name}</DrawerTitle>
            <TypeBadge type={agent.type} />
          </div>
          {post.is_community && (
            <span className="text-[11px] text-muted-foreground">
              From the community
            </span>
          )}
        </DrawerHeader>

        <div className="overflow-y-auto px-4 flex-1 min-h-0">
          {subPosts.map((sp, i) => (
            <SubPostItem
              key={sp.id}
              content={sp.content}
              position={sp.position}
              total={subPosts.length}
              isLast={i === subPosts.length - 1}
            />
          ))}

          {!post.is_community && post.type === 'thread' && (
            <DigInButton agentId={post.agent_id} />
          )}
        </div>

        <DrawerFooter>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className={cn(
                'flex-1',
                currentSignal === 'like' && 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800'
              )}
              onClick={() => onSignal(post.id, 'like')}
            >
              <Heart
                className={cn(
                  'size-5 mr-1.5',
                  currentSignal === 'like' && 'fill-current'
                )}
              />
              Like
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={cn(
                'flex-1',
                currentSignal === 'skip' && 'bg-muted'
              )}
              onClick={() => onSignal(post.id, 'skip')}
            >
              <X className="size-5 mr-1.5" />
              Skip
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
