import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ConversationCountsResult {
  counts: Record<string, number>
  loaded: boolean
}

export function useConversationCounts(
  subPostIds: string[],
  enabled: boolean
): ConversationCountsResult {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!enabled || subPostIds.length === 0) return

    const supabase = createClient()

    async function fetchCounts() {
      const { data, error } = await supabase
        .from('conversation_summaries')
        .select('sub_post_id')
        .in('sub_post_id', subPostIds)

      if (error || !data) {
        setLoaded(true)
        return
      }

      const result: Record<string, number> = {}
      for (const row of data) {
        result[row.sub_post_id] = (result[row.sub_post_id] ?? 0) + 1
      }
      setCounts(result)
      setLoaded(true)
    }

    fetchCounts()
  }, [subPostIds.join(','), enabled])

  return { counts, loaded }
}
