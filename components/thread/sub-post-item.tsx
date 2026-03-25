interface SubPostItemProps {
  content: string
  position: number
  total: number
  isLast: boolean
}

export function SubPostItem({ content, position, isLast }: SubPostItemProps) {
  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
      )}
      <div className="flex gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground mt-0.5">
          {position}
        </div>
        <p className="text-[15px] leading-relaxed text-foreground pb-2">
          {content}
        </p>
      </div>
    </div>
  )
}
