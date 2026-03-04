import './FormattingGuide.css'

interface FormattingGuideProps {
  isOpen: boolean
  onClose: () => void
}

export default function FormattingGuide({ isOpen, onClose }: FormattingGuideProps) {
  if (!isOpen) return null

  return (
    <div className="formatting-guide-overlay" onClick={onClose}>
      <div className="formatting-guide" onClick={(e) => e.stopPropagation()}>
        <button className="guide-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className="guide-title">Getting your content right</h2>
        <p className="guide-intro">
          F is for Formatting works best with structured text. Here's how to get the best results—whether you're writing by hand or using AI.
        </p>

        <section className="guide-section">
          <h3>From AI tools (ChatGPT, Claude, etc.)</h3>
          <p>
            Ask your AI to output your resume, bio, or project description in <strong>markdown format</strong>. For example:
          </p>
          <blockquote>
            "Write my resume in markdown format with ## for section headers and bullet points for each role."
          </blockquote>
          <p>
            Most AI tools already use markdown—headers, bullets, and lists—so you can often copy directly from the response.
          </p>
        </section>

        <section className="guide-section">
          <h3>Formatting syntax</h3>
          <ul>
            <li><code>## Section Name</code> — Creates a section header (Experience, Education, Skills, etc.)</li>
            <li><code>•</code> or <code>-</code> — Bullet points for list items</li>
            <li><strong>First line</strong> — Treated as your name or title</li>
            <li><strong>Second line</strong> — Subtitle (e.g., job title, location)</li>
          </ul>
        </section>

        <section className="guide-section">
          <h3>Example</h3>
          <pre className="guide-example">{`Jane Doe
Senior Designer | San Francisco

## Experience

• Lead Designer at TechCorp (2020–Present)
  Shaped product vision for 3 flagship products.

## Skills

• Figma, prototyping, design systems`}</pre>
        </section>

        <button className="guide-done" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}
