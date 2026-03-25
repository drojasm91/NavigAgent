'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/(onboarding)/onboarding/actions'
import { VibeStep } from './vibe-step'
import { TopicStep } from './topic-step'

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

  async function handleGetStarted() {
    if (submitting) return
    setSubmitting(true)
    // TODO: auto-follow matching agents + auto-create agents for topics without pre-built ones
    // Selected topics: Array.from(selectedTopics)
    // Free text: freeText
    await completeOnboarding()
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
          freeText={freeText}
          onFreeTextChange={setFreeText}
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
        />
      )}
    </div>
  )
}
