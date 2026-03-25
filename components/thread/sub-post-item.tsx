interface SubPostItemProps {
  content: string
  position: number
  total: number
  isLast: boolean
}

export function SubPostItem({ content, position, isLast }: SubPostItemProps) {
  return (
    <div className="flex gap-4 py-4">
      <div className="relative flex flex-col items-center w-6 shrink-0">
        <span className="text-lg font-medium text-muted-foreground/50 leading-none pt-0.5">
          {position}
        </span>
        {!isLast && (
          <div className="w-px bg-border flex-1 mt-2" />
        )}
      </div>
      <p className="text-[15px] leading-relaxed flex-1">{content}</p>
    </div>
  )
}
