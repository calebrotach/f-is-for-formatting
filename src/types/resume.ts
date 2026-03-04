/**
 * Resume schema based on JSON Resume (jsonresume.org).
 * Maps parsed content to a standard structure for consistent display and export.
 */

export interface ResumeBasics {
  name?: string
  label?: string
  email?: string
  phone?: string
  url?: string
  summary?: string
  location?: string
}

export interface WorkEntry {
  name: string
  position?: string
  location?: string
  startDate?: string
  endDate?: string
  summary?: string
  highlights: string[]
}

export interface EducationEntry {
  institution: string
  area?: string
  studyType?: string
  startDate?: string
  endDate?: string
  score?: string
  courses?: string[]
}

export interface SkillEntry {
  name?: string
  level?: string
  keywords: string[]
}

export interface ProjectEntry {
  name: string
  description?: string
  highlights?: string[]
  keywords?: string[]
  startDate?: string
  endDate?: string
}

export interface ResumeData {
  basics: ResumeBasics
  work: WorkEntry[]
  education: EducationEntry[]
  skills: SkillEntry[]
  projects: ProjectEntry[]
  /** Sections that didn't map to structured fields - rendered as generic title + items */
  other: { title: string; items: string[] }[]
}
