'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronDown, ArrowRight, Loader2, Newspaper, GraduationCap, MapPin, Sparkles, Plus } from 'lucide-react'
import { TopicChip } from '@/components/onboarding/topic-chip'
import { SubPostItem } from '@/components/thread/sub-post-item'
import {
  generateFollowUpQuestions,
  generateAgentPreview,
  generateSamplePost,
  createAgentWithSamples,
} from '@/app/(app)/agents/new/actions'
import type { FollowUpQuestion } from '@/app/(app)/agents/new/actions'
import type { WriterOutput } from '@/lib/pipelines/types'
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
  const [samplePosts, setSamplePosts] = useState<WriterOutput[]>([])
  const [expandedSamples, setExpandedSamples] = useState<Set<number>>(new Set())
  const [loadingSample, setLoadingSample] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const samplesEndRef = useRef<HTMLDivElement>(null)

  function scrollToTopAndSetStep(nextStep: number) {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    setStep(nextStep)
  }

  // Auto-scroll to bottom only when adding another sample (not the first)
  useEffect(() => {
    if (samplePosts.length > 1 && samplesEndRef.current) {
      samplesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [samplePosts])

  function handleSelectType(type: UserAgentType) {
    setSelectedType(type)
    setSelectedTopic(null)
    setCustomTopic('')
    setFollowUpQuestions([])
    setFollowUpAnswers({})
    setCustomAnswers({})
    setPreview(null)
    setSamplePosts([])
    scrollToTopAndSetStep(2)
  }

  async function handleSelectTopic(topic: string) {
    setSelectedTopic(topic)
    setFollowUpQuestions([])
    setFollowUpAnswers({})
    setCustomAnswers({})
    setPreview(null)
    setSamplePosts([])
    setLoadingQuestions(true)
    scrollToTopAndSetStep(3)

    const result = await generateFollowUpQuestions(selectedType!, topic)
    setLoadingQuestions(false)

    if (result.error || result.questions.length === 0) {
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
    scrollToTopAndSetStep(4)

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

  async function handleGenerateSample() {
    if (!preview || !selectedType) return
    setLoadingSample(true)
    setError(null)
    scrollToTopAndSetStep(5)

    const result = await generateSamplePost(
      selectedType,
      preview.name,
      preview.description,
      preview.topicTags
    )

    setLoadingSample(false)

    if (result.error || !result.post) {
      setError(result.error ?? 'Failed to generate sample post. Please try again.')
      return
    }

    setSamplePosts((prev) => [...prev, result.post!])
  }

  async function handleShowMeAnother() {
    if (!preview || !selectedType) return
    setLoadingSample(true)
    setError(null)

    const existingHooks = samplePosts.map((s) => s.subPosts[0]?.content ?? '')
    const result = await generateSamplePost(
      selectedType,
      preview.name,
      preview.description,
      preview.topicTags,
      existingHooks
    )

    setLoadingSample(false)

    if (result.error || !result.post) {
      setError(result.error ?? 'Failed to generate another sample.')
      return
    }

    setSamplePosts((prev) => [...prev, result.post!])
  }

  function handleTweakPreferences() {
    // Erase all samples, go back to Step 3
    setSamplePosts([])
    setPreview(null)
    setError(null)
    if (followUpQuestions.length > 0) {
      scrollToTopAndSetStep(3)
    } else {
      scrollToTopAndSetStep(2)
    }
  }

  async function handleActivate() {
    if (!preview || !selectedType || samplePosts.length === 0) return
    setCreating(true)
    setError(null)

    const result = await createAgentWithSamples(
      selectedType,
      preview.name,
      preview.description,
      preview.topicTags,
      samplePosts
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
    if (step === 5) {
      setSamplePosts([])
      scrollToTopAndSetStep(4)
    } else if (step === 4) {
      setPreview(null)
      if (followUpQuestions.length > 0) {
        scrollToTopAndSetStep(3)
      } else {
        scrollToTopAndSetStep(2)
      }
    } else if (step === 3) {
      setFollowUpQuestions([])
      setFollowUpAnswers({})
      scrollToTopAndSetStep(2)
    } else if (step === 2) {
      setSelectedType(null)
      scrollToTopAndSetStep(1)
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
                  <ArrowRight className="h-4 w-4" />
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
              <div className="space-y-8">
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
                      {followUpAnswers[fq.question] &&
                        Array.from(followUpAnswers[fq.question])
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 4: Name preview */}
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

        {/* Step 5: Sample posts */}
        {step === 5 && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Here&apos;s a preview
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 mb-6">
              This is the kind of content your agent will create.
            </p>

            {/* Compact agent card */}
            {preview && (
              <div className="flex items-center gap-3 mb-6">
                <div className="shrink-0 rounded-full bg-primary/10 p-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{preview.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{selectedType} agent</p>
                </div>
              </div>
            )}

            {/* Sample posts list */}
            <div className="space-y-3">
              {samplePosts.map((sample, sampleIndex) => {
                const isLatest = sampleIndex === samplePosts.length - 1 && !loadingSample
                const isManuallyExpanded = expandedSamples.has(sampleIndex)
                const showExpanded = isLatest || isManuallyExpanded
                const hookText = sample.subPosts[0]?.content ?? ''

                return (
                  <div
                    key={sampleIndex}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    {showExpanded ? (
                      <>
                        {samplePosts.length > 1 && (
                          <p className="text-[11px] text-muted-foreground font-medium mb-3">
                            Sample {sampleIndex + 1}
                          </p>
                        )}
                        <div className="space-y-0">
                          {sample.subPosts.map((sp) => (
                            <SubPostItem
                              key={sp.position}
                              content={sp.content}
                              position={sp.position}
                              total={sample.subPosts.length}
                              isLast={sp.position === sample.subPosts.length}
                            />
                          ))}
                        </div>
                        {!isLatest && (
                          <button
                            type="button"
                            onClick={() => setExpandedSamples((prev) => {
                              const next = new Set(prev)
                              next.delete(sampleIndex)
                              return next
                            })}
                            className="mt-2 text-xs text-muted-foreground active:opacity-70"
                          >
                            Collapse
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setExpandedSamples((prev) => {
                          const next = new Set(prev)
                          next.add(sampleIndex)
                          return next
                        })}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] text-muted-foreground font-medium">
                            Sample {sampleIndex + 1}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>1/{sample.subPosts.length}</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </div>
                        </div>
                        <p className="text-[15px] leading-relaxed">{hookText}</p>
                      </button>
                    )}
                  </div>
                )
              })}

              {/* Loading skeleton for new sample */}
              {loadingSample && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  {samplePosts.length > 0 && (
                    <p className="text-[11px] text-muted-foreground font-medium mb-3">
                      Sample {samplePosts.length + 1}
                    </p>
                  )}
                  <div className="space-y-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-4/5" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-3/5" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Researching and writing...
                  </p>
                </div>
              )}

              <div ref={samplesEndRef} />
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            )}
          </>
        )}
      </div>

      {/* Sticky bottom CTAs */}
      {step === 3 && !loadingQuestions && followUpQuestions.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40">
          <div className="mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => handleGeneratePreview(selectedTopic!, followUpAnswers)}
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
              onClick={handleGenerateSample}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98]"
            >
              Show me a sample post
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-3 text-xs text-muted-foreground active:opacity-70"
            >
              Go back and tweak
            </button>
          </div>
        </div>
      )}

      {step === 5 && samplePosts.length > 0 && !loadingSample && (
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40">
          <div className="mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleActivate}
              disabled={creating}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-30 active:scale-[0.98]"
            >
              {creating ? 'Activating...' : 'Activate agent'}
            </button>
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                type="button"
                onClick={handleTweakPreferences}
                className="py-2 text-xs text-muted-foreground active:opacity-70"
              >
                Tweak preferences
              </button>
              <button
                type="button"
                onClick={handleShowMeAnother}
                className="py-2 text-xs text-muted-foreground active:opacity-70"
              >
                Show me another
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
