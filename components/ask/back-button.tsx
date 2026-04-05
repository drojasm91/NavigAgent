'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center w-8 h-8 -ml-1 rounded-full active:bg-muted transition-colors"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
  )
}
