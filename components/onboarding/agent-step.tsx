'use client'

import { ChevronLeft } from 'lucide-react'
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
    <>
      {/* Scrollable content */}
      <div className="flex-1 px-4 pt-4 pb-48">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-0.5 text-sm text-muted-foreground active:opacity-70 mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold tracking-tight">
          Meet your agents.
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-6">
          Based on what you like, here&apos;s who we&apos;d pick for you.
        </p>

        <div className="flex flex-col gap-2.5">
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

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-lg border-t bg-background/80 backdrop-blur-sm px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-center text-xs text-muted-foreground mb-3">
            You can always add or remove agents later.
          </p>

          <button
            type="button"
            onClick={onGetStarted}
            disabled={!canStart}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-30 active:scale-[0.98]"
          >
            {submitting ? 'Setting up...' : 'Get started'}
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            className="w-full py-3 text-xs text-muted-foreground active:opacity-70 disabled:opacity-30"
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  )
}
