import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract and parse JSON from AI model output.
 * Handles: pure JSON, markdown fences, text before/after JSON, nested objects.
 */
export function parseJsonFromAI(raw: string): unknown {
  // Strip markdown fences
  const text = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()

  // Try direct parse first
  try {
    return JSON.parse(text)
  } catch {
    // Find the first { or [ and match to its closing counterpart
    const startObj = text.indexOf('{')
    const startArr = text.indexOf('[')

    let start: number
    let openChar: string
    let closeChar: string

    if (startObj === -1 && startArr === -1) {
      throw new Error('No JSON found in AI response')
    } else if (startArr === -1 || (startObj !== -1 && startObj < startArr)) {
      start = startObj
      openChar = '{'
      closeChar = '}'
    } else {
      start = startArr
      openChar = '['
      closeChar = ']'
    }

    // Walk forward counting braces/brackets to find the matching close
    let depth = 0
    let inString = false
    let escape = false

    for (let i = start; i < text.length; i++) {
      const ch = text[i]

      if (escape) {
        escape = false
        continue
      }

      if (ch === '\\' && inString) {
        escape = true
        continue
      }

      if (ch === '"') {
        inString = !inString
        continue
      }

      if (inString) continue

      if (ch === openChar) depth++
      if (ch === closeChar) depth--

      if (depth === 0) {
        return JSON.parse(text.slice(start, i + 1))
      }
    }

    throw new Error('Unbalanced JSON in AI response')
  }
}
