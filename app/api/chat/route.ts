import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { ASK_CONVERSATION_PROMPT, ASK_MODEL_ROUTER_PROMPT } from '@/lib/prompts'

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[]
  threadContext: { subPosts: { position: number; content: string }[]; targetPosition: number }
  snipperContext: { name: string; type: string; topicTags: string[] }
}

async function routeModel(
  client: Anthropic,
  question: string,
  threadSnippet: string
): Promise<'claude-haiku-4-5-20251001' | 'claude-sonnet-4-20250514'> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      system: ASK_MODEL_ROUTER_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Question: "${question}"\n\nThread context: ${threadSnippet}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : ''
    if (text.includes('sonnet')) return 'claude-sonnet-4-20250514'
    return 'claude-haiku-4-5-20251001'
  } catch {
    return 'claude-haiku-4-5-20251001'
  }
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = (await request.json()) as ChatRequestBody
  const { messages, threadContext } = body

  if (!messages?.length || !threadContext) {
    return new Response('Bad request', { status: 400 })
  }

  const client = new Anthropic()

  // Build thread context string
  const threadStr = threadContext.subPosts
    .map((sp) => `[${sp.position}] ${sp.content}`)
    .join('\n')

  const targetSubPost = threadContext.subPosts.find(
    (sp) => sp.position === threadContext.targetPosition
  )

  // Build system prompt
  const systemPrompt = ASK_CONVERSATION_PROMPT
    .replace('{threadContext}', threadStr)
    .replace('{position}', String(threadContext.targetPosition))
    .replace('{subPostContent}', targetSubPost?.content ?? '')

  // Route model based on the latest user message
  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
  const threadSnippet = threadContext.subPosts
    .slice(0, 3)
    .map((sp) => sp.content)
    .join(' ')

  const model = await routeModel(
    client,
    lastUserMessage?.content ?? '',
    threadSnippet
  )

  // Stream the response
  const stream = client.messages.stream({
    model,
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })

  const encoder = new TextEncoder()

  const readableStream = new ReadableStream({
    async start(controller) {
      // Send model choice as first event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'model', model })}\n\n`)
      )

      stream.on('text', (text: string) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`)
        )
      })

      stream.on('end', () => {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      })

      stream.on('error', () => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Something went wrong' })}\n\n`)
        )
        controller.close()
      })
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
