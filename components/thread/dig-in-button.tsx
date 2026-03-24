import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DigInButton({ agentId }: { agentId: string }) {
  return (
    <Link
      href={`/rabbit-hole/${agentId}`}
      className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full mt-2')}
    >
      Dig In
      <ArrowRight className="ml-1 size-4" />
    </Link>
  )
}
