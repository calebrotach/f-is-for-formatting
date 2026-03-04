import type { ParsedContent } from './parseContent'
import type { ResumeData, WorkEntry, EducationEntry, SkillEntry, ProjectEntry } from '../types/resume'

/** Section titles that map to Experience/Work */
const WORK_SECTION_NAMES = /^(Experience|Work Experience|Professional Experience|Employment|Work History|Relevant Experience)$/i

/** Section titles that map to Education */
const EDUCATION_SECTION_NAMES = /^(Education|Academic|Academic Background)$/i

/** Section titles that map to Skills */
const SKILLS_SECTION_NAMES = /^(Skills|Technical Skills|Key Skills|Core Competencies|Qualifications)$/i

/** Section titles that map to Projects */
const PROJECTS_SECTION_NAMES = /^(Projects|Key Projects|Notable Projects)$/i

/** Section titles for basics/summary */
const SUMMARY_SECTION_NAMES = /^(Summary|Objective|Professional Summary|Career Objective|Profile|About Me)$/i

/** Date range patterns: 2020–Present, 2020-2024, Jan 2020 – Dec 2024, etc. */
const DATE_RANGE =
  /(\d{4})\s*[–\-—]\s*(Present|\d{4}|[A-Za-z]+\s*\d{4})|([A-Za-z]+\.?\s*\d{4})\s*[–\-—]\s*([A-Za-z]+\.?\s*\d{4}|Present)|(\d{4})\s*[–\-—]\s*(\d{4})/i

/** Extract date range from a string, returns [start, end] or null */
function extractDates(text: string): { start: string; end: string } | null {
  const m = text.match(DATE_RANGE)
  if (!m) return null
  // Group 1-2: 2020–Present or 2020-2024
  if (m[1] && (m[2] === 'Present' || /^\d{4}$/.test(m[2])))
    return { start: m[1].trim(), end: m[2] }
  // Group 3-4: Jan 2020 – Dec 2024
  if (m[3] && m[4]) return { start: m[3].trim(), end: m[4] }
  // Group 5-6: 2020–2024
  if (m[5] && m[6]) return { start: m[5], end: m[6] }
  return null
}

/** Remove date range from text */
function stripDates(text: string): string {
  return text
    .replace(/\s*\(\d{4}[^)]*\)\s*$/, '') // (2020–Present) at end
    .replace(/\s*\|\s*\d{4}[^|]*$/, '') // | 2020–Present at end
    .replace(/\s*[–\-—]\s*(Present|\d{4}|[A-Za-z]+\s*\d{4})\s*$/i, '')
    .replace(/\s*,\s*\d{4}[^,]*$/, '')
    .trim()
}

/** Parse "Role at Company" or "Company – Role" or "Role | Company" */
function parseRoleCompany(text: string): { role?: string; company: string } {
  const atMatch = text.match(/^(.+?)\s+at\s+(.+)$/i)
  if (atMatch) return { role: atMatch[1].trim(), company: atMatch[2].trim() }

  const dashMatch = text.match(/^(.+?)\s+[–\-—]\s+(.+)$/)
  if (dashMatch) return { company: dashMatch[1].trim(), role: dashMatch[2].trim() }

  const pipeMatch = text.match(/^(.+?)\s+\|\s+(.+)$/)
  if (pipeMatch) return { role: pipeMatch[1].trim(), company: pipeMatch[2].trim() }

  const commaMatch = text.match(/^(.+?),\s*(.+)$/)
  if (commaMatch) return { role: commaMatch[1].trim(), company: commaMatch[2].trim() }

  return { company: text }
}

/** Detect if a line looks like a job/role header (company + role + optional dates) */
function isJobHeader(line: string): boolean {
  if (line.length > 100) return false
  const hasDates = DATE_RANGE.test(line) || /\(\d{4}[^)]*\)/.test(line)
  const hasRoleCompany =
    /\bat\b/i.test(line) ||
    /[–\-—]/.test(line) ||
    /\|/.test(line) ||
    /,\s*[A-Z]/.test(line)
  return hasRoleCompany || (hasDates && line.length < 80)
}

/** Parse Experience section items into WorkEntry[] */
function parseWorkSection(items: string[]): WorkEntry[] {
  const entries: WorkEntry[] = []
  let current: WorkEntry | null = null

  for (const item of items) {
    if (isJobHeader(item)) {
      if (current && (current.highlights.length > 0 || current.position || current.name)) {
        entries.push(current)
      }
      const dates = extractDates(item)
      const withoutDates = stripDates(item)
      const { role, company } = parseRoleCompany(withoutDates)
      current = {
        name: company || 'Unknown',
        position: role,
        startDate: dates?.start,
        endDate: dates?.end,
        highlights: [],
      }
    } else if (current) {
      current.highlights.push(item)
    } else if (entries.length > 0) {
      entries[entries.length - 1].highlights.push(item)
    } else {
      const dates = extractDates(item)
      const withoutDates = stripDates(item)
      const { role, company } = parseRoleCompany(withoutDates)
      current = {
        name: company || withoutDates || 'Unknown',
        position: role,
        startDate: dates?.start,
        endDate: dates?.end,
        highlights: [],
      }
    }
  }

  if (current) entries.push(current)
  return entries
}

/** Parse Education section items into EducationEntry[] */
function parseEducationSection(items: string[]): EducationEntry[] {
  const entries: EducationEntry[] = []

  for (const item of items) {
    const dates = extractDates(item)
    const withoutDates = stripDates(item)
    const degreeMatch = withoutDates.match(
      /^((?:B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|M\.?F\.?A\.?|B\.?F\.?A\.?|Ph\.?D\.?|J\.?D\.?)\s+(?:in\s+)?[^,]+)(?:,\s*(.+))?$/i
    )
    if (degreeMatch) {
      entries.push({
        studyType: degreeMatch[1].trim(),
        institution: degreeMatch[2]?.trim() || degreeMatch[1].trim(),
        area: degreeMatch[2] ? degreeMatch[1].trim() : undefined,
        startDate: dates?.start,
        endDate: dates?.end,
      })
    } else {
      const commaIdx = withoutDates.lastIndexOf(',')
      const hasComma = commaIdx > 0
      entries.push({
        institution: hasComma ? withoutDates.slice(0, commaIdx).trim() : withoutDates,
        area: hasComma ? withoutDates.slice(commaIdx + 1).trim() : undefined,
        startDate: dates?.start,
        endDate: dates?.end,
      })
    }
  }

  return entries
}

/** Parse Skills section - can be flat list or "Category: item, item" */
function parseSkillsSection(items: string[]): SkillEntry[] {
  const entries: SkillEntry[] = []

  for (const item of items) {
    const colonMatch = item.match(/^(.+?):\s*(.+)$/)
    if (colonMatch) {
      entries.push({
        name: colonMatch[1].trim(),
        keywords: colonMatch[2].split(/[,;]/).map((k) => k.trim()).filter(Boolean),
      })
    } else {
      const keywords = item.split(/[,;]/).map((k) => k.trim()).filter(Boolean)
      if (keywords.length > 0) {
        entries.push({ keywords })
      }
    }
  }

  return entries
}

/** Parse Projects section - similar to work */
function parseProjectsSection(items: string[]): ProjectEntry[] {
  const entries: ProjectEntry[] = []
  let current: ProjectEntry | null = null

  for (const item of items) {
    if (isJobHeader(item) || (item.length < 60 && !item.startsWith('•'))) {
      if (current) entries.push(current)
      const dates = extractDates(item)
      const withoutDates = stripDates(item)
      current = {
        name: withoutDates || 'Project',
        startDate: dates?.start,
        endDate: dates?.end,
        highlights: [],
      }
    } else if (current) {
      current.highlights!.push(item)
    } else if (entries.length > 0) {
      entries[entries.length - 1].highlights = entries[entries.length - 1].highlights || []
      entries[entries.length - 1].highlights!.push(item)
    } else {
      current = { name: item, highlights: [] }
    }
  }

  if (current) entries.push(current)
  return entries
}

/**
 * Converts parsed content (sections + items) into structured ResumeData
 * following the JSON Resume schema.
 */
export function parseToResumeData(parsed: ParsedContent): ResumeData {
  const basics: ResumeData['basics'] = {}
  if (parsed.title) basics.name = parsed.title
  if (parsed.subtitle) basics.label = parsed.subtitle

  const work: WorkEntry[] = []
  const education: EducationEntry[] = []
  const skills: SkillEntry[] = []
  const projects: ProjectEntry[] = []
  const other: { title: string; items: string[] }[] = []

  for (const section of parsed.sections) {
    const title = section.title
    const items = section.items

    if (WORK_SECTION_NAMES.test(title)) {
      work.push(...parseWorkSection(items))
    } else if (EDUCATION_SECTION_NAMES.test(title)) {
      education.push(...parseEducationSection(items))
    } else if (SKILLS_SECTION_NAMES.test(title)) {
      skills.push(...parseSkillsSection(items))
    } else if (PROJECTS_SECTION_NAMES.test(title)) {
      projects.push(...parseProjectsSection(items))
    } else if (SUMMARY_SECTION_NAMES.test(title) && items.length > 0) {
      basics.summary = items.join(' ')
    } else {
      other.push({ title, items })
    }
  }

  return {
    basics,
    work,
    education,
    skills,
    projects,
    other,
  }
}
