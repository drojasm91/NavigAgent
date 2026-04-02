'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Newspaper, GraduationCap, MapPin, Sparkles, Plus } from 'lucide-react'
import { TopicChip } from '@/components/onboarding/topic-chip'
import {
  generateFollowUpQuestions,
  generateAgentPreview,
  createAgent,
} from '@/app/(app)/agents/new/actions'
import type { FollowUpQuestion } from '@/app/(app)/agents/new/actions'
import type { UserAgentType } from '@/lib/types'

const AGENT_TYPES = [
  {
    type: 'news' as UserAgentType,
    label: 'Stay on top of news',
    description: 'Current events, trends, and developments',
    icon: Newspaper,
    topics: ['World politics', 'Tech & startups', 'Crypto & web3', 'Markets & finance', 'Sports', 'Science & space'],
  },
  {
    type: 'learning' as UserAgentType,
    label: 'Learn something new',
    description: 'Build knowledge on a subject over time',
    icon: GraduationCap,
    topics: ['History', 'Philosophy', 'Science', 'How things work', 'Psychology', 'Economics'],
  },
  {
    type: 'recommendation' as UserAgentType,
    label: 'Get recommendations',
    description: 'Discover restaurants, movies, books, and more',
    icon: MapPin,
    topics: ['Restaurants', 'Movies & TV', 'Books', 'Music', 'Local events', 'Travel'],
  },
]

export function CreateAgentFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<UserAgentType | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [customTopic, setCustomTopic] = useState('')
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([])
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, Set<string>>>({})
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({})
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [preview, setPreview] = useState<{ name: string; description: string; topicTags: string[] } | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const questionsRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when questions load
  useEffect(() => {
    if (followUpQuestions.length > 0 && questionsRef.current) {
      questionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [followUpQuestions])

  function handleSelectType(type: UserAgentType) {
    setSelectedType(type)
    setSelectedTopic(null)
    setCustomTopic('')
    setFollowUpQuestions([])
    setFollowUpAnswers({})
    setCustomAnswers({})
    setPreview(null)
    setStep(2)
  }

  async function handleSelectTopic(topic: string) {
    setSelectedTopic(topic)
    setFollowUpQuestions([])
    setFollowUpAnswers({})
    setCustomAnswers({})
    setPreview(null)
    setLoadingQuestions(true)
    setStep(3)

    const result = await generateFollowUpQuestions(selectedType!, topic)
    setLoadingQuestions(false)

    if (result.error || result.questions.length === 0) {
      // If AI fails, skip to preview with just type + topic
      await handleGeneratePreview(topic, {})
      return
    }

    setFollowUpQuestions(result.questions)
  }

  function handleSubmitCustomTopic() {
    const trimmed = customTopic.trim()
    if (!trimmed) return
    handleSelectTopic(trimmed)
  }

  function handleToggleAnswer(question: string, option: string) {
    setFollowUpAnswers((prev) => {
      const current = prev[question] ?? new Set()
      const next = new Set(current)
      if (next.has(option)) {
        next.delete(option)
      } else {
        next.add(option)
      }
      return { ...prev, [question]: next }
    })
  }

  function handleAddCustomAnswer(question: string) {
    const text = customAnswers[question]?.trim()
    if (!text) return
    setFollowUpAnswers((prev) => {
      const current = prev[question] ?? new Set()
      const next = new Set(current)
      next.add(text)
      return { ...prev, [question]: next }
    })
    setCustomAnswers((prev) => ({ ...prev, [question]: '' }))
  }

  async function handleGeneratePreview(
    topic: string,
    answers: Record<string, Set<string>>
  ) {
    setLoadingPreview(true)
    setStep(4)

    const answersObj: Record<string, string[]> = {}
    for (const [q, selections] of Object.entries(answers)) {
      answersObj[q] = Array.from(selections)
    }

    const result = await generateAgentPreview(selectedType!, topic, answersObj)
    setLoadingPreview(false)

    if (result.error) {
      setError('Failed to generate agent preview. Please try again.')
      return
    }

    setPreview(result)
  }

  async function handleCreate() {
    if (!preview || !selectedType) return
    setCreating(true)
    setError(null)

    const result = await createAgent(
      selectedType,
      preview.name,
      preview.description,
      preview.topicTags
    )

    if (result.error) {
      setError(result.error)
      setCreating(false)
      return
    }

    router.push(`/agent/${result.agentId}`)
  }

  function handleBack() {
    setError(null)
    if (step === 4) {
      if (followUpQuestions.length > 0) {
        setStep(3)
        setPreview(null)
      } else {
        setStep(2)
        setPreview(null)
      }
    } else if (step === 3) {
      setStep(2)
      setFollowUpQuestions([])
      setFollowUpAnswers({})
    } else if (step === 2) {
      setStep(1)
      setSelectedType(null)
    } else {
      router.back()
    }
  }

  const typeConfig = AGENT_TYPES.find((t) => t.type === selectedType)

  const hasAnswers = Object.values(followUpAnswers).some((s: Set<string>) => s.size > 0)

  return (
    <>
      <div className="flex-1 px-4 pt-4 pb-56">
        {/* Back button */}
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-0.5 text-sm text-muted-foreground active:opacity-70 mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {/* Step 1: Pick type */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Create an agent
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 mb-8">
              What kind of content do you want?
            </p>

            <div className="flex flex-col gap-3">
              {AGENT_TYPES.map((agentType) => {
                const Icon = agentType.icon
                return (
                  <button
                    key={agentType.type}
                    type="button"
                    onClick={() => handleSelectType(agentType.type)}
                    className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-all active:scale-[0.98] active:bg-muted"
                  >
                    <div className="shrink-0 rounded-xl bg-primary/10 p-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{agentType.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {agentType.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Step 2: Pick topic */}
        {step === 2 && typeConfig && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              What topic?
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 mb-8">
              Pick one or write your own.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {typeConfig.topics.map((topic) => (
                <TopicChip
                  key={topic}
                  label={topic}
                  selected={false}
                  onToggle={() => handleSelectTopic(topic)}
                />
              ))}
            </div>

            <div>
              <label htmlFor="custom-topic" className="text-sm font-medium">
                Something else?
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="custom-topic"
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSubmitCustomTopic()
                    }
                  }}
                  placeholder="e.g. Korean skincare, Formula 1..."
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSubmitCustomTopic}
                  disabled={!customTopic.trim()}
                  className="shrink-0 rounded-xl bg-primary p-3 text-primary-foreground transition-all disabled:opacity-30 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Follow-up questions */}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Let&apos;s refine it
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 mb-8">
              Tap what resonates — pick as many as you like.
            </p>

            {loadingQuestions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking about {selectedTopic}...
              </div>
            ) : (
              <div ref={questionsRef} className="space-y-8">
                {followUpQuestions.map((fq) => (
                  <div key={fq.question}>
                    <p className="text-sm font-semibold mb-3">{fq.question}</p>
                    <div className="flex flex-wrap gap-2">
                      {fq.options.map((option) => (
                        <TopicChip
                          key={option}
                          label={option}
                          selected={followUpAnswers[fq.question]?.has(option) ?? false}
                          onToggle={() => handleToggleAnswer(fq.question, option)}
                        />
                      ))}
                    </div>
                    {/* Write your own for this question */}
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={customAnswers[fq.question] ?? ''}
                        onChange={(e) =>
                          setCustomAnswers((prev) => ({ ...prev, [fq.question]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddCustomAnswer(fq.question)
                          }
                        }}
                        placeholder="Write your own..."
                        className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomAnswer(fq.question)}
                        disabled={!customAnswers[fq.question]?.trim()}
                        className="shrink-0 rounded-lg bg-primary p-2 text-primary-foreground transition-all disabled:opacity-30 active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Show custom selections as chips */}
                    {followUpAnswers[fq.question] && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.from(followUpAnswers[fq.question])
                          .filter((a) => !fq.options.includes(a))
                          .map((custom) => (
                            <TopicChip
                              key={custom}
                              label={custom}
                              selected={true}
                              onToggle={() => handleToggleAnswer(fq.question, custom)}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Meet your agent
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 mb-8">
              Here&apos;s what we came up with.
            </p>

            {loadingPreview ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating your agent...
              </div>
            ) : preview ? (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="shrink-0 rounded-full bg-primary/10 p-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{preview.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedType} agent
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {preview.description}
                </p>
                {preview.topicTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {preview.topicTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {error && (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            )}
          </>
        )}
      </div>

      {/* Sticky bottom CTA */}
      {step === 3 && !loadingQuestions && followUpQuestions.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40">
          <div className="mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() =>
                handleGeneratePreview(selectedTopic!, followUpAnswers)
              }
              disabled={!hasAnswers}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-30 active:scale-[0.98]"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => handleGeneratePreview(selectedTopic!, {})}
              className="w-full py-3 text-xs text-muted-foreground active:opacity-70"
            >
              Skip — surprise me
            </button>
          </div>
        </div>
      )}

      {step === 4 && preview && !loadingPreview && (
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40">
          <div className="mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-30 active:scale-[0.98]"
            >
              {creating ? 'Activating...' : 'Activate agent'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
