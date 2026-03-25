'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getTemplatesForVibes } from '@/lib/onboarding/templates'
import { completeOnboarding } from '@/app/(onboarding)/onboarding/actions'
import { VibeStep } from './vibe-step'
import { AgentStep } from './agent-step'

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedVibes, setSelectedVibes] = useState<Set<string>>(new Set())
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set())
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

  if (step === 1) {
    return (
      <VibeStep
        selectedVibes={selectedVibes}
        onToggleVibe={handleToggleVibe}
        onContinue={handleContinue}
      />
    )
  }

  return (
    <AgentStep
      templates={templates}
      selectedIds={selectedTemplateIds}
      onToggleTemplate={handleToggleTemplate}
      onGetStarted={handleGetStarted}
      onSkip={handleSkip}
      onBack={handleBack}
      submitting={submitting}
    />
  )
}
