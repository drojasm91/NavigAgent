export interface PerplexityResponse {
  content: string
  citations: string[]
}

export async function queryPerplexity(prompt: string): Promise<PerplexityResponse> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not set')
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Perplexity API error (${response.status}): ${text}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  const citations: string[] = Array.isArray(data.citations) ? data.citations : []

  return { content, citations }
}
