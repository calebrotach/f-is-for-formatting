import './VibesSelector.css'

export type PaletteId = 'classic' | 'bold' | 'minimal' | 'warm' | 'ocean' | 'forest'
export type FontId = 'instrument-dm' | 'playfair-inter' | 'crimson-source'
export type ResumeLayoutId = 'condense' | 'expand'
export type SlideStyleId = 'compact' | 'spacious'

export interface VibeOptions {
  palette: PaletteId
  font: FontId
  resumeLayout?: ResumeLayoutId
  slideStyle?: SlideStyleId
}

export const PALETTES: { id: PaletteId; label: string; colors: string[] }[] = [
  { id: 'classic', label: 'Classic', colors: ['#1a1a1a', '#c45c3e', '#6b6358'] },
  { id: 'bold', label: 'Bold', colors: ['#0a0a0a', '#2563eb', '#4b5563'] },
  { id: 'minimal', label: 'Minimal', colors: ['#171717', '#737373', '#a3a3a3'] },
  { id: 'warm', label: 'Warm', colors: ['#1c1917', '#b45309', '#78716c'] },
  { id: 'ocean', label: 'Ocean', colors: ['#0f172a', '#0ea5e9', '#64748b'] },
  { id: 'forest', label: 'Forest', colors: ['#14532d', '#22c55e', '#4d7c0f'] },
]

export const FONTS: { id: FontId; label: string; heading: string; body: string }[] = [
  { id: 'instrument-dm', label: 'Instrument & DM Sans', heading: 'Instrument Serif', body: 'DM Sans' },
  { id: 'playfair-inter', label: 'Playfair & Inter', heading: 'Playfair Display', body: 'Inter' },
  { id: 'crimson-source', label: 'Crimson & Source Sans', heading: 'Crimson Pro', body: 'Source Sans 3' },
]

const RESUME_LAYOUTS: { id: ResumeLayoutId; label: string; desc: string }[] = [
  { id: 'condense', label: 'One page', desc: 'Condense to fit on a single page' },
  { id: 'expand', label: 'Expand', desc: 'More spacing, easier to read' },
]

const SLIDE_STYLES: { id: SlideStyleId; label: string; desc: string }[] = [
  { id: 'compact', label: 'Compact', desc: 'More content per slide' },
  { id: 'spacious', label: 'Spacious', desc: 'Fewer items, larger text' },
]

interface VibesSelectorProps {
  value: VibeOptions
  onChange: (vibes: VibeOptions) => void
  viewMode: 'resume' | 'slides'
}

export default function VibesSelector({ value, onChange, viewMode }: VibesSelectorProps) {
  return (
    <div className="vibes-selector">
      <div className="vibes-group">
        <label className="vibes-label">Color palette</label>
        <div className="vibes-options vibes-options--palettes">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`vibe-palette-btn ${value.palette === p.id ? 'active' : ''}`}
              onClick={() => onChange({ ...value, palette: p.id })}
              title={p.label}
            >
              <span className="palette-swatches">
                <span className="palette-swatch" style={{ background: p.colors[0] }} />
                <span className="palette-swatch" style={{ background: p.colors[1] }} />
                <span className="palette-swatch" style={{ background: p.colors[2] }} />
              </span>
              <span className="palette-name">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="vibes-group">
        <label className="vibes-label">Font pairing</label>
        <div className="vibes-options vibes-options--fonts">
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`vibe-font-btn ${value.font === f.id ? 'active' : ''}`}
              onClick={() => onChange({ ...value, font: f.id })}
            >
              <span className="font-label">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'resume' && (
        <div className="vibes-group">
          <label className="vibes-label">Layout</label>
          <div className="vibes-options vibes-options--layout">
            {RESUME_LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`vibe-layout-btn ${value.resumeLayout === l.id ? 'active' : ''}`}
                onClick={() => onChange({ ...value, resumeLayout: l.id })}
              >
                <span className="layout-label">{l.label}</span>
                <span className="layout-desc">{l.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'slides' && (
        <div className="vibes-group">
          <label className="vibes-label">Slide style</label>
          <div className="vibes-options vibes-options--layout">
            {SLIDE_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`vibe-layout-btn ${value.slideStyle === s.id ? 'active' : ''}`}
                onClick={() => onChange({ ...value, slideStyle: s.id })}
              >
                <span className="layout-label">{s.label}</span>
                <span className="layout-desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
