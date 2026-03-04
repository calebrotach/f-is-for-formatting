import type { ResumeData } from '../types/resume'
import type { VibeOptions } from '../components/VibesSelector'

function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return ''
  if (start && end) return `${start} – ${end}`
  return start || end || ''
}

/**
 * Generates a simple HTML string for the resume (used for PDF export and as base for DOCX)
 */
export function resumeToHtml(resume: ResumeData, vibes: VibeOptions): string {
  const { basics, work, education, skills, projects, other } = resume
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
    .summary { margin: 0.5rem 0 1rem; font-size: 0.95rem; color: #6b6358; }
    .header { border-bottom: 2px solid ${accent}; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    h2 { font-family: 'Instrument Serif', serif; font-size: 1.15rem; color: ${accent}; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 0.75rem; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { position: relative; padding-left: 1.25rem; margin-bottom: 0.6rem; }
    li::before { content: ''; position: absolute; left: 0; top: 0.65em; width: 4px; height: 4px; background: ${accent}; border-radius: 50%; }
    .section { margin-bottom: 1.5rem; }
    .job, .edu, .project { margin-bottom: 1.25rem; }
    .job-header, .edu-header, .project-header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem; }
    .job-company, .edu-institution, .project-name { font-weight: 600; }
    .job-role, .edu-degree { color: #6b6358; }
    .job-dates, .edu-dates, .project-dates { margin-left: auto; font-size: 0.9rem; color: #6b6358; }
    .skill-group { margin-bottom: 0.4rem; }
  </style>
</head>
<body>
`

  if (basics.name || basics.label) {
    html += `<div class="header"><h1>${escapeHtml(basics.name || '')}</h1>`
    if (basics.label) html += `<p class="subtitle">${escapeHtml(basics.label)}</p>`
    if (basics.summary) html += `<p class="summary">${escapeHtml(basics.summary)}</p>`
    html += `</div>`
  }

  if (work.length > 0) {
    html += `<div class="section"><h2>Experience</h2>`
    for (const job of work) {
      html += `<div class="job">`
      html += `<div class="job-header">`
      html += `<span class="job-company">${escapeHtml(job.name)}</span>`
      if (job.position) html += `<span class="job-role">${escapeHtml(job.position)}</span>`
      if (job.startDate || job.endDate)
        html += `<span class="job-dates">${escapeHtml(formatDateRange(job.startDate, job.endDate))}</span>`
      html += `</div>`
      if (job.location) html += `<p style="margin:0 0 0.4rem;font-size:0.85rem;color:#6b6358">${escapeHtml(job.location)}</p>`
      if (job.highlights.length > 0) {
        html += `<ul>`
        for (const h of job.highlights) html += `<li>${escapeHtml(h)}</li>`
        html += `</ul>`
      }
      html += `</div>`
    }
    html += `</div>`
  }

  if (education.length > 0) {
    html += `<div class="section"><h2>Education</h2>`
    for (const edu of education) {
      html += `<div class="edu">`
      html += `<div class="edu-header">`
      html += `<span class="edu-institution">${escapeHtml(edu.institution)}</span>`
      if (edu.area || edu.studyType)
        html += `<span class="edu-degree">${escapeHtml([edu.studyType, edu.area].filter(Boolean).join(', '))}</span>`
      if (edu.startDate || edu.endDate)
        html += `<span class="edu-dates">${escapeHtml(formatDateRange(edu.startDate, edu.endDate))}</span>`
      html += `</div></div>`
    }
    html += `</div>`
  }

  if (skills.length > 0) {
    html += `<div class="section"><h2>Skills</h2>`
    for (const skill of skills) {
      html += `<div class="skill-group">`
      if (skill.name) html += `<strong>${escapeHtml(skill.name)}: </strong>`
      html += escapeHtml(skill.keywords.join(', '))
      html += `</div>`
    }
    html += `</div>`
  }

  if (projects.length > 0) {
    html += `<div class="section"><h2>Projects</h2>`
    for (const proj of projects) {
      html += `<div class="project">`
      html += `<div class="project-header">`
      html += `<span class="project-name">${escapeHtml(proj.name)}</span>`
      if (proj.startDate || proj.endDate)
        html += `<span class="project-dates">${escapeHtml(formatDateRange(proj.startDate, proj.endDate))}</span>`
      html += `</div>`
      if (proj.highlights && proj.highlights.length > 0) {
        html += `<ul>`
        for (const h of proj.highlights) html += `<li>${escapeHtml(h)}</li>`
        html += `</ul>`
      }
      html += `</div>`
    }
    html += `</div>`
  }

  for (const section of other) {
    html += `<div class="section"><h2>${escapeHtml(section.title)}</h2><ul>`
    for (const item of section.items) html += `<li>${escapeHtml(item)}</li>`
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
export async function resumeToDocx(resume: ResumeData): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')

  const children: InstanceType<typeof Paragraph>[] = []

  if (resume.basics.name) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: resume.basics.name, bold: true, size: 32 })],
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
      })
    )
  }
  if (resume.basics.label) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: resume.basics.label, size: 22 })],
        spacing: { after: 120 },
      })
    )
  }
  if (resume.basics.summary) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: resume.basics.summary, size: 22 })],
        spacing: { after: 240 },
      })
    )
  }

  if (resume.work.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Experience', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    )
    for (const job of resume.work) {
      const headerParts = [job.name]
      if (job.position) headerParts.push(job.position)
      if (job.startDate || job.endDate) headerParts.push(formatDateRange(job.startDate, job.endDate))
      children.push(
        new Paragraph({
          children: [new TextRun({ text: headerParts.join(' • '), bold: true, size: 22 })],
          spacing: { before: 160, after: 80 },
        })
      )
      for (const h of job.highlights) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: h, size: 22 })],
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        )
      }
    }
  }

  if (resume.education.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Education', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    )
    for (const edu of resume.education) {
      const parts = [edu.institution]
      if (edu.area || edu.studyType) parts.push([edu.studyType, edu.area].filter(Boolean).join(', '))
      if (edu.startDate || edu.endDate) parts.push(formatDateRange(edu.startDate, edu.endDate))
      children.push(
        new Paragraph({
          children: [new TextRun({ text: parts.join(' • '), bold: true, size: 22 })],
          spacing: { before: 160, after: 80 },
        })
      )
    }
  }

  if (resume.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Skills', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    )
    for (const skill of resume.skills) {
      const text = skill.name ? `${skill.name}: ${skill.keywords.join(', ')}` : skill.keywords.join(', ')
      children.push(
        new Paragraph({
          children: [new TextRun({ text, size: 22 })],
          spacing: { after: 80 },
        })
      )
    }
  }

  if (resume.projects.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Projects', bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    )
    for (const proj of resume.projects) {
      const headerParts = [proj.name]
      if (proj.startDate || proj.endDate) headerParts.push(formatDateRange(proj.startDate, proj.endDate))
      children.push(
        new Paragraph({
          children: [new TextRun({ text: headerParts.join(' • '), bold: true, size: 22 })],
          spacing: { before: 160, after: 80 },
        })
      )
      for (const h of proj.highlights || []) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: h, size: 22 })],
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        )
      }
    }
  }

  for (const section of resume.other) {
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
