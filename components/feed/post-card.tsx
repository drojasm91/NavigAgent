'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TypeBadge } from './type-badge'
import { SubPostItem } from '@/components/thread/sub-post-item'
import type { FeedPost } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Heart, Layers, Bot, ArrowRight, ChevronUp } from 'lucide-react'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function SnipperAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
      {initial}
    </div>
  )
}

interface PostCardProps {
  post: FeedPost
  currentSnipperId?: string
  hideDigIn?: boolean
}

export function PostCard({ post, currentSnipperId, hideDigIn = false }: PostCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const snipper = post.snippers
  const hookText = post.sub_posts?.[0]?.content ?? ''
  const likeCount = Math.floor((post.quality_score ?? 0.8) * 50)
  const subPosts = [...post.sub_posts].sort((a, b) => a.position - b.position)
  const postCount = subPosts.length
  const isThread = post.type === 'thread' && postCount > 1
  const showSnipperLink = !currentSnipperId || post.snipper_id !== currentSnipperId
  const showDigIn = !hideDigIn && !post.is_community && post.type === 'thread'

  function handleCardTap() {
    if (isThread) {
      setExpanded((prev) => !prev)
    }
  }

  function handleDigIn() {
    router.push(`/snipper/${post.snipper_id}?tab=posts`)
  }

  return (
    <div ref={cardRef} className="scroll-mt-16">
    <Card
      className={cn(
        'cursor-pointer',
        post.is_community && 'border-dashed'
      )}
    >
      {post.is_community && (
        <div className="px-4 pt-3 pb-0">
          <span className="text-[11px] text-muted-foreground font-medium">
            From the community
          </span>
        </div>
      )}

      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <Link
          href={`/snipper/${snipper.id}`}
          className="flex items-center gap-2 min-w-0 flex-1 active:opacity-70 transition-opacity"
        >
          <SnipperAvatar name={snipper.name} />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm truncate">{snipper.name}</span>
            <TypeBadge type={snipper.type} />
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground mt-0.5">
            {timeAgo(post.created_at)}
          </span>
          {showSnipperLink && (
            <Link
              href={`/snipper/${snipper.id}?tab=posts`}
              className="rounded-full p-1 text-muted-foreground active:bg-accent transition-colors"
            >
              <Bot className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </CardHeader>

      <div onClick={handleCardTap} className="active:scale-[0.98] transition-transform">
        <CardContent className="pb-3">
          <p className="text-[15px] leading-relaxed">{hookText}</p>
        </CardContent>

        {!expanded && (
          <CardFooter className="justify-between pt-0">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="size-4" />
              {likeCount}
            </span>
            {isThread && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                1/{postCount}
                <Layers className="size-3.5" />
              </span>
            )}
          </CardFooter>
        )}
      </div>

      {/* Expanded sub-posts (2+) */}
      {expanded && isThread && (
        <div className="px-4 pb-4">
          <div className="space-y-4 mt-1">
            {subPosts.slice(1).map((sp, i) => (
              <SubPostItem
                key={sp.id}
                content={sp.content}
                position={sp.position}
                total={postCount}
                isLast={i === subPosts.length - 2}
              />
            ))}
          </div>

          {/* Sources */}
          {(() => {
            const metadata = post.metadata as Record<string, unknown> | null
            const rawSources = Array.isArray(metadata?.sources) ? metadata.sources : []
            const sources = rawSources.map((s: unknown) => {
              if (typeof s === 'string') return { url: s, label: s }
              if (s && typeof s === 'object' && 'url' in s) {
                const obj = s as Record<string, unknown>
                return {
                  url: typeof obj.url === 'string' ? obj.url : '',
                  label: typeof obj.label === 'string' ? obj.label : (typeof obj.url === 'string' ? obj.url : ''),
                }
              }
              return null
            }).filter((s): s is { url: string; label: string } => !!s?.url)
            if (sources.length === 0) return null
            return (
              <details className="mt-3 text-xs">
                <summary className="text-muted-foreground cursor-pointer select-none">
                  Sources ({sources.length})
                </summary>
                <div className="mt-2 space-y-1.5 pl-1">
                  {sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block text-primary truncate hover:underline"
                    >
                      {src.label}
                    </a>
                  ))}
                </div>
              </details>
            )
          })()}

          {/* Bottom actions */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <button className="flex items-center gap-1.5 text-muted-foreground active:text-foreground transition-colors">
              <Heart className="size-5" />
              <span className="text-sm">{likeCount}</span>
            </button>

            <div className="flex items-center gap-2">
              {showDigIn && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDigIn()
                  }}
                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground active:opacity-80 transition-opacity"
                >
                  Dig In
                  <ArrowRight className="size-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(false)
                  // Wait for React to re-render (collapse), then scroll to card
                  setTimeout(() => {
                    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }, 50)
                }}
                className="rounded-full p-2 text-muted-foreground active:bg-accent transition-colors"
              >
                <ChevronUp className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
    </div>
  )
}
