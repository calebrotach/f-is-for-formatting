import { useState } from 'react'
import { contentToSlides } from '../utils/parseContent'
import type { ParsedContent } from '../utils/parseContent'
import type { VibeOptions } from './VibesSelector'
import './SlideDeck.css'

interface SlideDeckProps {
  parsed: ParsedContent
  vibes: VibeOptions
}

export default function SlideDeck({ parsed, vibes }: SlideDeckProps) {
  const maxItems = vibes.slideStyle === 'spacious' ? 3 : 6
  const slides = contentToSlides(parsed, maxItems)
  const [currentSlide, setCurrentSlide] = useState(0)

  if (slides.length === 0) {
    return (
      <div className={`slide-deck empty palette-${vibes.palette} font-${vibes.font} slide-style-${vibes.slideStyle || 'compact'}`} data-palette={vibes.palette} data-font={vibes.font}>
        <p>Add some content to generate slides.</p>
      </div>
    )
  }

  const slide = slides[currentSlide]
  const isTitleSlide = currentSlide === 0 && slide.length <= 2

  const slideStyle = vibes.slideStyle || 'compact'

  return (
    <div className={`slide-deck palette-${vibes.palette} font-${vibes.font} slide-style-${slideStyle}`} data-palette={vibes.palette} data-font={vibes.font}>
      <div className={`slide-viewport ${isTitleSlide ? 'title-slide' : ''}`}>
        <div className="slide-content">
          {isTitleSlide ? (
            <>
              <h1 className="slide-title-main">{slide[0]}</h1>
              {slide[1] && <p className="slide-subtitle-main">{slide[1]}</p>}
            </>
          ) : (
            <>
              <h2 className="slide-heading">{slide[0]}</h2>
              <ul className="slide-list">
                {slide.slice(1).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="slide-nav">
        <button
          className="nav-btn"
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          ← Previous
        </button>
        <span className="slide-counter">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          className="nav-btn"
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
        >
          Next →
        </button>
      </div>

      <div className="slide-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
