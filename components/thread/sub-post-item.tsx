interface SubPostItemProps {
  content: string
  position: number
  total: number
  isLast: boolean
}

export function SubPostItem({ content, position, isLast }: SubPostItemProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center w-6 shrink-0 pt-1">
        <span className="text-sm font-medium text-muted-foreground/40 relative z-10 bg-background px-0.5">
          {position}
        </span>
        {!isLast && (
          <div className="absolute left-1/2 -translate-x-1/2 top-7 bottom-0 w-px bg-border" />
        )}
      </div>
      <p className="text-[15px] leading-relaxed text-foreground pb-5">
        {content}
      </p>
    </div>
  )
}
