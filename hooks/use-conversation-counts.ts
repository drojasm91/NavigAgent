import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useConversationCounts(subPostIds: string[], enabled: boolean) {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!enabled || subPostIds.length === 0) return

    const supabase = createClient()

    async function fetchCounts() {
      const { data, error } = await supabase
        .from('conversation_summaries')
        .select('sub_post_id')
        .in('sub_post_id', subPostIds)

      if (error || !data) return

      const result: Record<string, number> = {}
      for (const row of data) {
        result[row.sub_post_id] = (result[row.sub_post_id] ?? 0) + 1
      }
      setCounts(result)
    }

    fetchCounts()
  }, [subPostIds.join(','), enabled])

  return counts
}
