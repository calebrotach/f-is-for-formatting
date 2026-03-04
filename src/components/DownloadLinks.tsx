import { useState } from 'react'
import type { ParsedContent } from '../utils/parseContent'
import type { VibeOptions } from './VibesSelector'
import { resumeToHtml, resumeToDocx } from '../utils/exportResume'
import { slidesToHtml, slidesToPptx } from '../utils/exportSlides'
import './DownloadLinks.css'

interface DownloadLinksProps {
  parsed: ParsedContent
  viewMode: 'resume' | 'slides'
  vibes: VibeOptions
}

export default function DownloadLinks({ parsed, viewMode, vibes }: DownloadLinksProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const downloadPdf = () => {
    setDownloading('pdf')
    const html = viewMode === 'resume' ? resumeToHtml(parsed, vibes) : slidesToHtml(parsed, vibes)
    const win = window.open('', '_blank')
    if (!win) {
      setDownloading(null)
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
      setDownloading(null)
    }, 250)
  }

  const downloadDocx = async () => {
    if (viewMode !== 'resume') return
    setDownloading('docx')
    try {
      const blob = await resumeToDocx(parsed)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('DOCX export failed:', e)
    }
    setDownloading(null)
  }

  const downloadSlides = async () => {
    if (viewMode !== 'slides') return
    setDownloading('pptx')
    try {
      const blob = await slidesToPptx(parsed, vibes)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'slides.pptx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('PPTX export failed:', e)
    }
    setDownloading(null)
  }

  return (
    <div className="download-links">
      <span className="download-label">Download</span>
      <div className="download-buttons">
        {viewMode === 'resume' && (
          <button
            className="download-btn"
            onClick={downloadDocx}
            disabled={downloading !== null}
            title="Download as Word document"
          >
            {downloading === 'docx' ? '…' : 'DOCX'}
          </button>
        )}
        <button
          className="download-btn"
          onClick={downloadPdf}
          disabled={downloading !== null}
          title="Print or save as PDF"
        >
          {downloading === 'pdf' ? '…' : 'PDF'}
        </button>
        {viewMode === 'slides' && (
          <button
            className="download-btn"
            onClick={downloadSlides}
            disabled={downloading !== null}
            title="Download as PowerPoint"
          >
            {downloading === 'pptx' ? '…' : 'PPTX'}
          </button>
        )}
      </div>
    </div>
  )
}
