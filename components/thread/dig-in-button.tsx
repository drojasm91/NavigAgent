import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DigInButton({ snipperId }: { snipperId: string }) {
  return (
    <Link
      href={`/snipper/${snipperId}?tab=posts`}
      className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full mt-2')}
    >
      Dig In
      <ArrowRight className="ml-1 size-4" />
    </Link>
  )
}
