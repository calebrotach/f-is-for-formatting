import './OutputTypeSelector.css'

interface OutputTypeSelectorProps {
  value: 'resume' | 'slides'
  onChange: (value: 'resume' | 'slides') => void
}

export default function OutputTypeSelector({ value, onChange }: OutputTypeSelectorProps) {
  return (
    <div className="output-type-selector">
      <button
        type="button"
        className={`output-type-card ${value === 'resume' ? 'active' : ''}`}
        onClick={() => onChange('resume')}
      >
        <span className="output-type-icon" aria-hidden>📄</span>
        <span className="output-type-label">Formatted Resume</span>
        <span className="output-type-desc">Clean, professional layout for job applications</span>
      </button>
      <button
        type="button"
        className={`output-type-card ${value === 'slides' ? 'active' : ''}`}
        onClick={() => onChange('slides')}
      >
        <span className="output-type-icon" aria-hidden>🖼️</span>
        <span className="output-type-label">Slide Deck</span>
        <span className="output-type-desc">Present your content as navigable slides</span>
      </button>
    </div>
  )
}
