import type { ParsedContent } from './parseContent'
import { contentToSlides } from './parseContent'
import type { VibeOptions } from '../components/VibesSelector'

/**
 * Generates HTML for slides (used for PDF export of slide deck)
 */
export function slidesToHtml(parsed: ParsedContent, vibes: VibeOptions): string {
  const slides = contentToSlides(parsed)
  const accent = getPaletteAccent(vibes.palette)

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; font-family: 'DM Sans', sans-serif; }
    .slide { width: 960px; height: 540px; padding: 60px 80px; box-sizing: border-box; }
    @media print {
      .slide { width: 100vw; height: 100vh; page-break-after: always; }
      .slide:last-child { page-break-after: auto; }
    }
    .slide.title { background: linear-gradient(135deg, ${accent} 0%, ${darken(accent)} 100%); color: white; display: flex; flex-direction: column; justify-content: center; text-align: center; }
    .slide.content { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; }
    .slide h1 { font-family: 'Instrument Serif', serif; font-size: 2.5rem; margin: 0 0 0.5rem; }
    .slide h2 { font-family: 'Instrument Serif', serif; font-size: 1.5rem; margin: 0 0 1rem; }
    .slide .subtitle { font-size: 1.1rem; opacity: 0.9; margin: 0; }
    .slide ul { list-style: none; padding: 0; margin: 0; }
    .slide li { position: relative; padding-left: 1.5rem; margin-bottom: 0.75rem; }
    .slide li::before { content: '—'; position: absolute; left: 0; color: ${accent}; }
  </style>
</head>
<body>
`

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const isTitle = i === 0 && slide.length <= 2

    html += `<div class="slide ${isTitle ? 'title' : 'content'}">`
    if (isTitle) {
      html += `<h1>${escapeHtml(slide[0])}</h1>`
      if (slide[1]) html += `<p class="subtitle">${escapeHtml(slide[1])}</p>`
    } else {
      html += `<h2>${escapeHtml(slide[0])}</h2><ul>`
      for (let j = 1; j < slide.length; j++) {
        html += `<li>${escapeHtml(slide[j])}</li>`
      }
      html += `</ul>`
    }
    html += `</div>`
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

function darken(hex: string, amt = 0.2): string {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amt))
  const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amt))
  const b = Math.max(0, (num & 0xff) * (1 - amt))
  return '#' + (0x1000000 + Math.round(r) * 0x10000 + Math.round(g) * 0x100 + Math.round(b)).toString(16).slice(1)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Generates PPTX (PowerPoint) - requires pptxgenjs
 */
export async function slidesToPptx(parsed: ParsedContent, vibes: VibeOptions): Promise<Blob> {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  const slides = contentToSlides(parsed)
  const accent = getPaletteAccent(vibes.palette)

  for (let i = 0; i < slides.length; i++) {
    const slideData = slides[i]
    const isTitle = i === 0 && slideData.length <= 2

    if (isTitle) {
      const s = pptx.addSlide()
      s.background = { color: accent.replace('#', '') }
      s.addText(slideData[0], { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 44, color: 'FFFFFF', align: 'center' })
      if (slideData[1]) {
        s.addText(slideData[1], { x: 0.5, y: 2.5, w: 9, h: 0.5, fontSize: 24, color: 'FFFFFF', align: 'center' })
      }
    } else {
      const s = pptx.addSlide()
      s.background = { color: '1a1a1a' }
      s.addText(slideData[0], { x: 0.5, y: 0.5, w: 9, h: 0.75, fontSize: 32, color: 'FFFFFF' })
      const bulletItems = slideData.slice(1).map((t) => ({ text: t }))
      s.addText(bulletItems, { x: 0.5, y: 1.5, w: 9, h: 5, fontSize: 18, color: 'FFFFFF', bullet: true })
    }
  }

  const result = await pptx.write({ outputType: 'blob' })
  return result as Blob
}
