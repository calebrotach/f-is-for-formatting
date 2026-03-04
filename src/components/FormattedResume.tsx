import type { ResumeData } from '../types/resume'
import type { VibeOptions } from './VibesSelector'
import './FormattedResume.css'

interface FormattedResumeProps {
  resume: ResumeData
  vibes: VibeOptions
}

function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return ''
  if (start && end) return `${start} – ${end}`
  return start || end || ''
}

export default function FormattedResume({ resume, vibes }: FormattedResumeProps) {
  const { basics, work, education, skills, projects, other } = resume
  const layout = vibes.resumeLayout || 'expand'

  return (
    <div className={`formatted-resume palette-${vibes.palette} font-${vibes.font} layout-${layout}`} data-palette={vibes.palette} data-font={vibes.font}>
      <div className="resume-paper">
        {(basics.name || basics.label) && (
          <header className="resume-header">
            {basics.name && <h1 className="resume-name">{basics.name}</h1>}
            {basics.label && <p className="resume-subtitle">{basics.label}</p>}
            {basics.summary && <p className="resume-summary">{basics.summary}</p>}
          </header>
        )}

        <div className="resume-sections">
          {work.length > 0 && (
            <section className="resume-section resume-section--work">
              <h2 className="resume-section-title">Experience</h2>
              {work.map((job, i) => (
                <div key={i} className="resume-job">
                  <div className="resume-job-header">
                    <span className="resume-job-company">{job.name}</span>
                    {job.position && <span className="resume-job-role">{job.position}</span>}
                    {(job.startDate || job.endDate) && (
                      <span className="resume-job-dates">
                        {formatDateRange(job.startDate, job.endDate)}
                      </span>
                    )}
                  </div>
                  {job.location && <p className="resume-job-location">{job.location}</p>}
                  {job.highlights.length > 0 && (
                    <ul className="resume-list">
                      {job.highlights.map((h, j) => (
                        <li key={j} className="resume-item">
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {education.length > 0 && (
            <section className="resume-section resume-section--education">
              <h2 className="resume-section-title">Education</h2>
              {education.map((edu, i) => (
                <div key={i} className="resume-edu">
                  <div className="resume-edu-header">
                    <span className="resume-edu-institution">{edu.institution}</span>
                    {(edu.area || edu.studyType) && (
                      <span className="resume-edu-degree">
                        {[edu.studyType, edu.area].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {(edu.startDate || edu.endDate) && (
                      <span className="resume-edu-dates">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </span>
                    )}
                  </div>
                  {edu.courses && edu.courses.length > 0 && (
                    <ul className="resume-list resume-list--inline">
                      {edu.courses.map((c, j) => (
                        <li key={j} className="resume-item">{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {skills.length > 0 && (
            <section className="resume-section resume-section--skills">
              <h2 className="resume-section-title">Skills</h2>
              <div className="resume-skills">
                {skills.map((skill, i) => (
                  <div key={i} className="resume-skill-group">
                    {skill.name && <span className="resume-skill-name">{skill.name}: </span>}
                    <span className="resume-skill-keywords">
                      {skill.keywords.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="resume-section resume-section--projects">
              <h2 className="resume-section-title">Projects</h2>
              {projects.map((proj, i) => (
                <div key={i} className="resume-project">
                  <div className="resume-project-header">
                    <span className="resume-project-name">{proj.name}</span>
                    {(proj.startDate || proj.endDate) && (
                      <span className="resume-project-dates">
                        {formatDateRange(proj.startDate, proj.endDate)}
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="resume-project-desc">{proj.description}</p>}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="resume-list">
                      {proj.highlights.map((h, j) => (
                        <li key={j} className="resume-item">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {other.map((section, i) => (
            <section key={i} className="resume-section">
              <h2 className="resume-section-title">{section.title}</h2>
              <ul className="resume-list">
                {section.items.map((item, j) => (
                  <li key={j} className="resume-item">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
