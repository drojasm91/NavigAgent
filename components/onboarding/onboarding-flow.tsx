'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding, classifyInterest } from '@/app/(onboarding)/onboarding/actions'
import { TOPICS } from '@/lib/onboarding/templates'
import { VibeStep } from './vibe-step'
import { TopicStep } from './topic-step'

export interface CustomTopic {
  label: string
  vibeId: string
}

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`h-1.5 rounded-full transition-all duration-300 ${
          current === 1 ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
        }`}
      />
      <div
        className={`h-1.5 rounded-full transition-all duration-300 ${
          current === 2 ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
        }`}
      />
    </div>
  )
}

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedVibes, setSelectedVibes] = useState<Set<string>>(new Set())
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [freeText, setFreeText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [customTopics, setCustomTopics] = useState<Map<string, CustomTopic>>(new Map())
  const [classifying, setClassifying] = useState(false)

  function handleToggleVibe(vibeId: string) {
    setSelectedVibes((prev) => {
      const next = new Set(prev)
      if (next.has(vibeId)) {
        next.delete(vibeId)
      } else {
        next.add(vibeId)
      }
      return next
    })
  }

  function handleContinue() {
    setStep(2)
  }

  function handleToggleTopic(topicId: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topicId)) {
        next.delete(topicId)
      } else {
        next.add(topicId)
      }
      return next
    })
  }

  async function handleAddInterest(text: string) {
    const trimmed = text.trim()
    if (!trimmed || classifying) return
    setClassifying(true)

    const result = await classifyInterest(trimmed)

    const firstVibe = Array.from(selectedVibes)[0]
    const vibeId = result.vibeId ?? (firstVibe || 'stay_informed')
    const topicId = `custom:${trimmed.toLowerCase().replace(/\s+/g, '-')}`

    // Auto-add the vibe if not selected
    if (!selectedVibes.has(vibeId)) {
      setSelectedVibes((prev) => {
        const next = new Set(Array.from(prev))
        next.add(vibeId)
        return next
      })
    }

    // Add typed text as custom topic
    const nextCustom = new Map(customTopics)
    nextCustom.set(topicId, { label: trimmed, vibeId })

    // Add suggestions — match predefined topics if possible, otherwise create custom
    const nextSelected = new Set(selectedTopics)
    nextSelected.add(topicId)

    for (const suggestion of result.suggestedTopics) {
      const predefined = TOPICS.find(
        (t) => t.label.toLowerCase() === suggestion.toLowerCase() && t.vibeId === vibeId,
      )
      if (predefined) {
        nextSelected.add(predefined.id)
      } else {
        const suggestionId = `custom:${suggestion.toLowerCase().replace(/\s+/g, '-')}`
        if (!nextCustom.has(suggestionId)) {
          nextCustom.set(suggestionId, { label: suggestion, vibeId })
        }
        // Suggestions are NOT auto-selected — user picks them
      }
    }

    setCustomTopics(nextCustom)
    setSelectedTopics(nextSelected)
    setFreeText('')
    setClassifying(false)
  }

  async function handleGetStarted() {
    if (submitting) return
    setSubmitting(true)
    await completeOnboarding({
      vibes: Array.from(selectedVibes),
      topics: Array.from(selectedTopics),
      freeText: JSON.stringify({
        customTopics: Object.fromEntries(customTopics),
      }),
    })
    router.push('/')
  }

  async function handleSkip() {
    if (submitting) return
    setSubmitting(true)
    await completeOnboarding()
    router.push('/')
  }

  function handleBack() {
    setStep(1)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Step indicator */}
      <div className="px-4 pt-6">
        <StepDots current={step} />
      </div>

      {step === 1 ? (
        <VibeStep
          selectedVibes={selectedVibes}
          onToggleVibe={handleToggleVibe}
          onContinue={handleContinue}
        />
      ) : (
        <TopicStep
          selectedVibes={selectedVibes}
          selectedTopics={selectedTopics}
          onToggleTopic={handleToggleTopic}
          onGetStarted={handleGetStarted}
          onSkip={handleSkip}
          onBack={handleBack}
          submitting={submitting}
          freeText={freeText}
          onFreeTextChange={setFreeText}
          customTopics={customTopics}
          classifying={classifying}
          onAddInterest={handleAddInterest}
        />
      )}
    </div>
  )
}
