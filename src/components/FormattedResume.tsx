import type { ParsedContent } from '../utils/parseContent'
import type { VibeOptions } from './VibesSelector'
import './FormattedResume.css'

interface FormattedResumeProps {
  parsed: ParsedContent
  vibes: VibeOptions
}

export default function FormattedResume({ parsed, vibes }: FormattedResumeProps) {
  const { title, subtitle, sections } = parsed

  return (
    <div className={`formatted-resume palette-${vibes.palette} font-${vibes.font}`} data-palette={vibes.palette} data-font={vibes.font}>
      <div className="resume-paper">
        {title && (
          <header className="resume-header">
            <h1 className="resume-name">{title}</h1>
            {subtitle && <p className="resume-subtitle">{subtitle}</p>}
          </header>
        )}

        <div className="resume-sections">
          {sections.map((section, i) => (
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
