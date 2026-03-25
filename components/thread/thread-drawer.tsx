'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { TypeBadge } from '@/components/feed/type-badge'
import { SubPostItem } from './sub-post-item'
import { DigInButton } from './dig-in-button'
import { X } from 'lucide-react'
import type { FeedPost, SignalType } from '@/lib/types'

interface ThreadDrawerProps {
  post: FeedPost | null
  open: boolean
  onOpenChange: (open: boolean) => void
  signals: Record<string, SignalType>
  onSignal: (postId: string, signalType: SignalType) => void
}

function AgentAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="size-10 rounded-full bg-neutral-800 dark:bg-neutral-200 flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-white dark:text-neutral-800">
        {initial}
      </span>
    </div>
  )
}

export function ThreadDrawer({
  post,
  open,
  onOpenChange,
}: ThreadDrawerProps) {
  if (!post) return null

  const agent = post.user_agents
  const subPosts = [...post.sub_posts].sort((a, b) => a.position - b.position)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-3">
            <AgentAvatar name={agent.name} />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <DrawerTitle className="text-base">{agent.name}</DrawerTitle>
              <TypeBadge type={agent.type} />
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="size-5" />
            </button>
          </div>
          {post.is_community && (
            <span className="text-[11px] text-muted-foreground mt-1 block">
              From the community
            </span>
          )}
        </DrawerHeader>

        <div className="overflow-y-auto px-4 flex-1 min-h-0 pb-6">
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
      </DrawerContent>
    </Drawer>
  )
}
