'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { recordLikeSignal } from '@/lib/supabase/queries'
import type { SignalType } from '@/lib/types'

export function useLikeSignal(userId: string) {
  const [signals, setSignals] = useState<Record<string, SignalType>>({})
  const supabase = createClient()

  const recordSignal = useCallback(
    async (postId: string, signalType: SignalType) => {
      // Optimistic update
      setSignals((prev) => ({ ...prev, [postId]: signalType }))

      try {
        await recordLikeSignal(supabase, userId, postId, signalType)
      } catch {
        // Revert on failure
        setSignals((prev) => {
          const next = { ...prev }
          delete next[postId]
          return next
        })
      }
    },
    [supabase, userId]
  )

  return { signals, recordSignal }
}
