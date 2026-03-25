'use client'

import type { AgentTemplate } from '@/lib/onboarding/templates'
import { AgentTemplateCard } from './agent-template-card'

interface AgentStepProps {
  templates: AgentTemplate[]
  selectedIds: Set<string>
  onToggleTemplate: (templateId: string) => void
  onGetStarted: () => void
  onSkip: () => void
  onBack: () => void
  submitting?: boolean
}

export function AgentStep({
  templates,
  selectedIds,
  onToggleTemplate,
  onGetStarted,
  onSkip,
  onBack,
  submitting = false,
}: AgentStepProps) {
  const canStart = selectedIds.size > 0 && !submitting

  return (
    <div className="flex min-h-screen flex-col px-6 py-12">
      <div className="flex-1">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm text-muted-foreground active:opacity-70"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold tracking-tight">
          Meet your agents.
        </h1>
        <p className="text-muted-foreground mt-2 mb-8">
          Based on what you like, here&apos;s who we&apos;d pick for you.
        </p>

        <div className="flex flex-col gap-3">
          {templates.map((template, i) => (
            <AgentTemplateCard
              key={template.id}
              template={template}
              selected={selectedIds.has(template.id)}
              onToggle={() => onToggleTemplate(template.id)}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-center text-xs text-muted-foreground">
          You can always add or remove agents later.
        </p>

        <button
          type="button"
          onClick={onGetStarted}
          disabled={!canStart}
          className={`w-full rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground transition-all disabled:opacity-40 ${
            canStart && !submitting ? 'animate-pulse' : ''
          }`}
        >
          {submitting ? 'Setting up...' : 'Get started'}
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2 text-sm text-muted-foreground"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
