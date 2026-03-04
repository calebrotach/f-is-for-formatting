import { useState } from 'react'
import { parseContent } from './utils/parseContent'
import ContentInput from './components/ContentInput'
import FormattedResume from './components/FormattedResume'
import SlideDeck from './components/SlideDeck'
import FormattingGuide from './components/FormattingGuide'
import VibesSelector, { type VibeOptions } from './components/VibesSelector'
import DownloadLinks from './components/DownloadLinks'
import './theme.css'
import './App.css'

const SAMPLE_CONTENT = `Jane Doe
Senior Product Designer | San Francisco

## Experience

• Lead Designer at TechCorp (2020–Present)
  Shaped product vision for 3 flagship products. Led a team of 5 designers.

• Senior UX Designer at StartupXYZ (2017–2020)
  Redesigned onboarding flow, increasing activation by 40%.

• Product Designer at AgencyCo (2014–2017)
  Delivered 20+ client projects across fintech and healthcare.

## Education

• MFA in Design, California College of the Arts
• BFA in Visual Communication, UCLA

## Skills

• Product strategy, user research, prototyping
• Figma, Framer, HTML/CSS
• Design systems, accessibility`

function App() {
  const [content, setContent] = useState(SAMPLE_CONTENT)
  const [viewMode, setViewMode] = useState<'resume' | 'slides'>('resume')
  const [vibes, setVibes] = useState<VibeOptions>({
    palette: 'classic',
    font: 'instrument-dm',
  })
  const [showFormattingGuide, setShowFormattingGuide] = useState(false)

  const parsed = parseContent(content)

  return (
    <div className="app">
      <FormattingGuide
        isOpen={showFormattingGuide}
        onClose={() => setShowFormattingGuide(false)}
      />

      <header className="app-header">
        <h1 className="app-title">F is for Formatting</h1>
        <p className="app-tagline">Transform your content into beautiful resumes & slide decks</p>
      </header>

      <main className="app-main">
        {/* Step 1: Choose output type */}
        <section className="app-step">
          <h2 className="step-heading">
            <span className="step-num">1</span>
            Choose your output type
          </h2>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'resume' ? 'active' : ''}`}
              onClick={() => setViewMode('resume')}
            >
              Formatted Resume
            </button>
            <button
              className={`toggle-btn ${viewMode === 'slides' ? 'active' : ''}`}
              onClick={() => setViewMode('slides')}
            >
              Slide Deck
            </button>
          </div>
        </section>

        {/* Step 2: Paste your content */}
        <section className="app-step">
          <h2 className="step-heading">
            <span className="step-num">2</span>
            Paste your text
          </h2>
          <p className="step-hint">
            Most AI tools can output markdown—perfect for pasting here.{' '}
            <button type="button" className="inline-link" onClick={() => setShowFormattingGuide(true)}>
              More details on formatting →
            </button>
          </p>
          <ContentInput
            value={content}
            onChange={setContent}
            onFormattingHelp={() => setShowFormattingGuide(true)}
          />
        </section>

        {/* Step 3: Choose the vibes */}
        <section className="app-step">
          <h2 className="step-heading">
            <span className="step-num">3</span>
            Choose the vibes
          </h2>
          <VibesSelector value={vibes} onChange={setVibes} />
        </section>

        {/* Step 4: Review & download */}
        <section className="app-step app-step--output">
          <h2 className="step-heading">
            <span className="step-num">4</span>
            Review and download
          </h2>
          <p className="step-hint">Tweak your content or switch vibes until it feels right.</p>

          <div className="output-panel">
            <div className="output-toolbar">
              <div className="view-toggle view-toggle--compact">
                <button
                  className={`toggle-btn ${viewMode === 'resume' ? 'active' : ''}`}
                  onClick={() => setViewMode('resume')}
                >
                  Resume
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'slides' ? 'active' : ''}`}
                  onClick={() => setViewMode('slides')}
                >
                  Slides
                </button>
              </div>
              <DownloadLinks
                parsed={parsed}
                viewMode={viewMode}
                vibes={vibes}
              />
            </div>

            <div className="output-content" data-palette={vibes.palette} data-font={vibes.font}>
              {viewMode === 'resume' ? (
                <FormattedResume parsed={parsed} vibes={vibes} />
              ) : (
                <SlideDeck parsed={parsed} vibes={vibes} />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
