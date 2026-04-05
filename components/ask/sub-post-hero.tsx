interface SubPostHeroProps {
  content: string
  position: number
  total: number
}

export function SubPostHero({ content, position, total }: SubPostHeroProps) {
  return (
    <div className="rounded-xl bg-muted/50 border p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
          {position}
        </div>
        <span className="text-xs text-muted-foreground">
          {position} of {total}
        </span>
      </div>
      <p className="text-[15px] leading-relaxed text-foreground">
        {content}
      </p>
    </div>
  )
}
