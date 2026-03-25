'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getTemplatesForVibes } from '@/lib/onboarding/templates'
import { completeOnboarding } from '@/app/(onboarding)/onboarding/actions'
import { VibeStep } from './vibe-step'
import { AgentStep } from './agent-step'

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
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set())
  const [freeText, setFreeText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const templates = useMemo(
    () => getTemplatesForVibes(Array.from(selectedVibes)),
    [selectedVibes]
  )

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
    const matchedTemplates = getTemplatesForVibes(Array.from(selectedVibes))
    setSelectedTemplateIds(new Set(matchedTemplates.map((t) => t.id)))
    setStep(2)
  }

  function handleToggleTemplate(templateId: string) {
    setSelectedTemplateIds((prev) => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
      } else {
        next.add(templateId)
      }
      return next
    })
  }

  async function handleGetStarted() {
    if (submitting) return
    setSubmitting(true)
    // TODO: create agents + subscriptions + seed posts for selectedTemplateIds
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
        <AgentStep
          templates={templates}
          selectedIds={selectedTemplateIds}
          onToggleTemplate={handleToggleTemplate}
          onGetStarted={handleGetStarted}
          onSkip={handleSkip}
          onBack={handleBack}
          submitting={submitting}
        />
      )}
    </div>
  )
}
