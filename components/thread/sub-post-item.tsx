import { Separator } from '@/components/ui/separator'

interface SubPostItemProps {
  content: string
  position: number
  total: number
  isLast: boolean
}

export function SubPostItem({ content, position, total, isLast }: SubPostItemProps) {
  return (
    <div className="py-4">
      <p className="text-[15px] leading-relaxed">{content}</p>
      <span className="text-[11px] text-muted-foreground mt-2 block">
        {position}/{total}
      </span>
      {!isLast && <Separator className="mt-4" />}
    </div>
  )
}
