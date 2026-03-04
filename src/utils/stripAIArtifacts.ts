/**
 * Strips AI conversation elements from pasted content so they don't appear
 * in the final documents. Works with output from ChatGPT, Claude, Gemini,
 * Copilot, and other major AI tools. Recognizes chat prefixes, wrapper
 * phrases, and markdown code block fences.
 */

// Lines that indicate AI conversation structure - strip the prefix
const AI_PREFIX_PATTERN = /^\s*(User|Assistant|Human|AI|Model|ChatGPT|Claude|Gemini|Copilot|Bard)\s*[:：]\s*/i

// Phrases that typically introduce the actual content - strip these lines
const AI_WRAPPER_PHRASES = [
  /^here'?s?\s+(?:a\s+)?(?:formatted|revised|your)\s+(?:version\s+)?(?:of\s+)?(?:your\s+)?(?:resume|content)?\s*[.:]?$/i,
  /^here'?s?\s+(?:the\s+)?(?:formatted\s+)?(?:version|content|resume)\s*[.:]?$/i,
  /^i'?ve?\s+(?:formatted|formatted your|created|prepared)\s+(?:your\s+)?(?:resume|content)/i,
  /^i'?ve?\s+prepared\s+(?:the\s+)?(?:following|below)/i,
  /^you\s+can\s+copy\s+(?:the\s+above|this)/i,
  /^let\s+me\s+know\s+if\s+you\s+need\s+/i,
  /^(?:sure|of\s+course)[,!]?\s*(?:here'?s?|i'?ve?)\s+(?:your\s+)?(?:resume|content)/i,
  /^copy\s+(?:the\s+)?(?:above|below|this)\s*[.:]?$/i,
  /^here\s+it\s+is\s*(?:formatted)?\s*[.:]?$/i,
  /^below\s+is\s+(?:your\s+)?(?:formatted\s+)?(?:resume|content)\s*[.:]?$/i,
  /^(?:your\s+)?(?:resume|content)\s+is\s+(?:below|above)\s*[.:]?$/i,
  /^is\s+there\s+anything\s+else\s+/i,
  /^feel\s+free\s+to\s+(?:ask|let\s+me)\s+/i,
  /^hope\s+(?:this\s+)?(?:helps|is\s+helpful)/i,
  /^please\s+let\s+me\s+know\s+/i,
  /^if\s+you'?d?\s+like\s+(?:any\s+)?(?:changes|adjustments)\s+/i,
  /^i'?d?\s+be\s+happy\s+to\s+(?:help|revise)\s+/i,
]

// Trailing phrases - strip from the end of content (AI sign-offs)
const AI_TRAILING_PHRASES = [
  /^let\s+me\s+know\s+if\s+you\s+need\s+/i,
  /^feel\s+free\s+to\s+(?:ask|let\s+me|reach\s+out)\s+/i,
  /^hope\s+(?:this\s+)?(?:helps|is\s+helpful|you\s+find\s+this)/i,
  /^please\s+let\s+me\s+know\s+/i,
  /^if\s+you'?d?\s+like\s+(?:any\s+)?(?:changes|adjustments|modifications|revisions)\s+/i,
  /^i'?d?\s+be\s+(?:happy|glad)\s+to\s+(?:help|revise|assist)\s+/i,
  /^is\s+there\s+anything\s+else\s+/i,
  /^you\s+can\s+(?:copy|use)\s+(?:the\s+)?(?:above|below|this)\s*[.:]?$/i,
  /^copy\s+(?:the\s+)?(?:above|below|this)\s*[.:]?$/i,
  /^(?:good\s+)?luck\s+(?:with\s+)?(?:your\s+)?(?:job\s+)?(?:search|application)s?\s*[!.]?$/i,
  /^(?:i\s+)?hope\s+(?:you\s+)?(?:find\s+)?(?:this\s+)?(?:useful|helpful)\s*[!.]?$/i,
  /^if\s+you\s+need\s+(?:any\s+)?(?:further\s+)?(?:help|changes|assistance)\s+/i,
  /^would\s+you\s+like\s+me\s+to\s+/i,
  /^do\s+you\s+want\s+me\s+to\s+/i,
  /^shall\s+i\s+(?:write|add|create|include)\s+/i,
]

// Markdown horizontal rules - often used as separator before AI follow-up questions
const HORIZONTAL_RULE = /^[-*_]{2,}\s*$/

// Markdown code block fences - we strip these but keep the content inside
const CODE_FENCE = /^```[\w]*\s*$/

// Lines that indicate the START of actual resume/content (strip everything before)
const CONTENT_START_PATTERNS = [
  /^#\s+.+$/,           // # Name
  /^##\s+.+$/,          // ## Section
  /^###\s+.+$/,         // ### Section
  /^\*\*[^*]+\*\*\s*$/,  // **Bold**
  /^[-*•]\s+.+$/,       // - or * bullet
]

// A line looks like a resume title if it's short, title case, no AI-ish words
const LOOKS_LIKE_TITLE = (line: string) => {
  const t = line.trim()
  if (t.length > 60 || t.length < 2) return false
  if (/^(here'?s?|i'?ve?|you\s+can|let\s+me|please|hope|feel\s+free)/i.test(t)) return false
  return /^[A-Z][a-zA-Z\s\-'&.,]+$/.test(t) || /^[A-Z][A-Z\s]+$/.test(t)  // "Jane Doe" or "CALEB ROTACH"
}

export interface CleanResult {
  cleaned: string
  hadArtifacts: boolean
  removedCount: number
}

/**
 * Removes AI conversation artifacts from pasted content.
 * Returns the cleaned text and whether any artifacts were found.
 */
export function stripAIArtifacts(rawText: string): CleanResult {
  const lines = rawText.split(/\r?\n/)
  const kept: string[] = []
  let removedCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Markdown code block fences - strip the fence line only, keep content inside
    if (CODE_FENCE.test(trimmed)) {
      removedCount++
      continue
    }

    // Skip empty lines that are purely from AI formatting (consecutive empties)
    if (!trimmed) {
      if (kept.length > 0 && kept[kept.length - 1] === '') {
        removedCount++
        continue
      }
      kept.push('')
      continue
    }

    // AI conversation prefix (User:, Assistant:, etc.) - strip the line
    if (AI_PREFIX_PATTERN.test(trimmed)) {
      const withoutPrefix = trimmed.replace(AI_PREFIX_PATTERN, '').trim()
      // If content remains and it's not a wrapper phrase, keep it
      if (withoutPrefix.length > 0 && !AI_WRAPPER_PHRASES.some((re) => re.test(withoutPrefix))) {
        kept.push(withoutPrefix)
      } else {
        removedCount++
      }
      continue
    }

    // AI wrapper phrases - strip entirely
    if (AI_WRAPPER_PHRASES.some((re) => re.test(trimmed))) {
      removedCount++
      continue
    }

    kept.push(line)
  }

  let cleaned = kept.join('\n').replace(/\n{3,}/g, '\n\n').trim()

  // Find where actual content starts - strip any leading AI explainer we missed
  const contentLines = cleaned.split(/\r?\n/)
  let contentStartIndex = -1
  for (let i = 0; i < contentLines.length; i++) {
    const trimmed = contentLines[i].trim()
    if (!trimmed) continue
    const isContentStart = CONTENT_START_PATTERNS.some((re) => re.test(trimmed)) ||
      (i < 5 && LOOKS_LIKE_TITLE(trimmed) && !AI_WRAPPER_PHRASES.some((re) => re.test(trimmed)))
    if (isContentStart) {
      contentStartIndex = i
      break
    }
  }
  if (contentStartIndex > 0) {
    cleaned = contentLines.slice(contentStartIndex).join('\n').replace(/^\n+/, '').trim()
    removedCount += contentStartIndex
  }

  // Strip trailing AI sign-offs from the end
  const trailingLines = cleaned.split(/\r?\n/)
  let lastContentIndex = trailingLines.length - 1
  while (lastContentIndex >= 0) {
    const t = trailingLines[lastContentIndex].trim()
    if (!t) {
      lastContentIndex--
      continue
    }
    if (
      HORIZONTAL_RULE.test(t) ||
      AI_TRAILING_PHRASES.some((re) => re.test(t)) ||
      AI_WRAPPER_PHRASES.some((re) => re.test(t))
    ) {
      removedCount++
      lastContentIndex--
    } else {
      break
    }
  }
  if (lastContentIndex < trailingLines.length - 1) {
    cleaned = trailingLines
      .slice(0, lastContentIndex + 1)
      .join('\n')
      .replace(/\n+$/, '\n')
      .trim()
  }

  return {
    cleaned,
    hadArtifacts: removedCount > 0,
    removedCount,
  }
}
