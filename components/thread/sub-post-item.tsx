import { Separator } from '@/components/ui/separator'

interface SubPostItemProps {
  content: string
  position: number
  total: number
  isLast: boolean
}

export function SubPostItem({ content, position, isLast }: SubPostItemProps) {
  return (
    <>
      <div className="flex gap-4 py-4">
        <span className="text-lg font-medium text-muted-foreground/50 w-6 shrink-0 pt-0.5 text-right">
          {position}
        </span>
        <p className="text-[15px] leading-relaxed flex-1">{content}</p>
      </div>
      {!isLast && <Separator />}
    </>
  )
}
