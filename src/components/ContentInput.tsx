import './ContentInput.css'

interface ContentInputProps {
  value: string
  onChange: (value: string) => void
  onFormattingHelp?: () => void
}

export default function ContentInput({ value, onChange, onFormattingHelp }: ContentInputProps) {
  return (
    <div className="content-input">
      <label htmlFor="content" className="input-label">
        Paste your content
      </label>
      <textarea
        id="content"
        className="input-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Resume, bio, project description... Use ## for section headers and • for bullet points."
        spellCheck={false}
      />
      <p className="input-hint">
        Tip: Use <code>## Section Name</code> for headers and <code>•</code> or <code>-</code> for bullets
        {onFormattingHelp && (
          <> — <button type="button" className="input-help-link" onClick={onFormattingHelp}>More details</button></>
        )}
      </p>
    </div>
  )
}
