import type { ParsedContent } from './parseContent'
import type { VibeOptions } from '../components/VibesSelector'

/**
 * Generates a simple HTML string for the resume (used for PDF export and as base for DOCX)
 */
export function resumeToHtml(parsed: ParsedContent, vibes: VibeOptions): string {
  const { title, subtitle, sections } = parsed
  const accent = getPaletteAccent(vibes.palette)

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'DM Sans', sans-serif; color: #1a1a1a; line-height: 1.6; padding: 40px; max-width: 700px; margin: 0 auto; }
    h1 { font-family: 'Instrument Serif', serif; font-size: 2rem; margin: 0 0 0.35rem; }
    .subtitle { color: #6b6358; font-size: 0.95rem; margin: 0 0 1.5rem; }
    .header { border-bottom: 2px solid ${accent}; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    h2 { font-family: 'Instrument Serif', serif; font-size: 1.15rem; color: ${accent}; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 0.75rem; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { position: relative; padding-left: 1.25rem; margin-bottom: 0.6rem; }
    li::before { content: ''; position: absolute; left: 0; top: 0.65em; width: 4px; height: 4px; background: ${accent}; border-radius: 50%; }
    .section { margin-bottom: 1.5rem; }
  </style>
</head>
<body>
`

  if (title) {
    html += `<div class="header"><h1>${escapeHtml(title)}</h1>`
    if (subtitle) html += `<p class="subtitle">${escapeHtml(subtitle)}</p>`
    html += `</div>`
  }

  for (const section of sections) {
    html += `<div class="section"><h2>${escapeHtml(section.title)}</h2><ul>`
    for (const item of section.items) {
      html += `<li>${escapeHtml(item)}</li>`
    }
    html += `</ul></div>`
  }

  html += `</body></html>`
  return html
}

function getPaletteAccent(palette: string): string {
  const map: Record<string, string> = {
    classic: '#c45c3e',
    bold: '#2563eb',
    minimal: '#737373',
    warm: '#b45309',
    ocean: '#0ea5e9',
    forest: '#22c55e',
  }
  return map[palette] || '#c45c3e'
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Generates DOCX-compatible content as a Blob (requires docx package)
 */
export async function resumeToDocx(parsed: ParsedContent): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')

  const children: InstanceType<typeof Paragraph>[] = []

  if (parsed.title) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.title, bold: true, size: 32 })],
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
      })
    )
  }
  if (parsed.subtitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: parsed.subtitle, size: 22 })],
        spacing: { after: 240 },
      })
    )
  }

  for (const section of parsed.sections) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.title, bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    )
    for (const item of section.items) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: item, size: 22 })],
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      )
    }
  }

  const doc = new Document({
    sections: [{ children }],
  })

  return await Packer.toBlob(doc)
}
