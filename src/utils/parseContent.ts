import { stripAIArtifacts } from './stripAIArtifacts';
import { stripInlineMarkdown } from './stripInlineMarkdown';

export interface ContentSection {
  title: string;
  items: string[];
}

export interface ParsedContent {
  title?: string;
  subtitle?: string;
  sections: ContentSection[];
  rawText: string;
  /** True if AI conversation artifacts were stripped from the input */
  hadAIArtifacts?: boolean;
}

/**
 * Parses raw resume/content text into structured sections.
 * Strips AI conversation elements (User:, Assistant:, wrapper phrases) before parsing.
 * Handles common formats: markdown headers, bullet points, plain text.
 */
export function parseContent(rawText: string): ParsedContent {
  const { cleaned, hadArtifacts } = stripAIArtifacts(rawText);
  const lines = cleaned.trim().split('\n').map(l => l.trim());
  const sections: ContentSection[] = [];
  let currentSection: ContentSection | null = null;
  let title: string | undefined;
  let subtitle: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Check for markdown headers (## or ###)
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    const h1Match = line.match(/^#\s+(.+)$/);
    // **Bold** section headers (common across ChatGPT, Claude, Gemini, etc.)
    const boldHeaderMatch = line.match(/^\*\*(.+)\*\*\s*$/);

    if (h1Match) {
      if (!title) title = stripInlineMarkdown(h1Match[1].trim());
      continue;
    }

    if (h2Match || h3Match) {
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: stripInlineMarkdown((h2Match || h3Match)![1].trim()),
        items: []
      };
      continue;
    }

    // **Bold** as section header - common format across ChatGPT, Claude, Gemini, Copilot, etc.
    const boldContent = boldHeaderMatch?.[1].trim() ?? '';
    const KNOWN_SECTIONS = /^(Experience|Education|Skills|Summary|Objective|Projects|Certifications|Work Experience|Professional Experience|Technical Skills|Languages|References|Achievements|Honors|Activities|Contact|Employment|Work History|Academic|Qualifications|Publications|Volunteer|Interests|Additional Information|About Me|Profile|Relevant Experience|Key Skills|Core Competencies|Professional Summary|Career Objective)$/i;
    const isLikelySectionHeader = boldHeaderMatch && boldContent.length < 50 && KNOWN_SECTIONS.test(boldContent);
    if (isLikelySectionHeader) {
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: boldContent, items: [] };
      continue;
    }

    // Plain section headers (all caps or title case, no bullet)
    const looksLikeHeader = /^[A-Z][A-Za-z\s&]+$/.test(line) && 
      line.length < 50 && 
      !line.startsWith('•') && 
      !line.startsWith('-') &&
      !line.startsWith('*');

    if (looksLikeHeader && !currentSection) {
      if (!title) {
        title = stripInlineMarkdown(line);
        continue;
      }
    }

    if (looksLikeHeader && currentSection && currentSection.items.length === 0) {
      if (currentSection.title === line) continue;
    }

    // Bullet points or list items
    const bulletMatch = line.match(/^[•\-*]\s+(.+)$/);
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);

    if (bulletMatch || numberedMatch) {
      const content = stripInlineMarkdown((bulletMatch || numberedMatch)![1]);
      if (currentSection) {
        currentSection.items.push(content);
      } else {
        // Create implicit section for orphan bullets
        if (sections.length === 0 && !title) {
          title = 'Content';
        }
        const lastSection = sections[sections.length - 1];
        if (lastSection) {
          lastSection.items.push(content);
        } else {
          sections.push({ title: 'Highlights', items: [content] });
        }
      }
      continue;
    }

    // Regular paragraph - could be subtitle or section content
    const cleanedLine = stripInlineMarkdown(line);
    if (!title && line.length < 80) {
      title = cleanedLine;
      continue;
    }
    if (title && !subtitle && line.length < 80 && i === 1) {
      subtitle = cleanedLine;
      continue;
    }

    // Add as item to current section
    if (currentSection && line.length > 0) {
      currentSection.items.push(cleanedLine);
    } else if (line.length > 2 && !currentSection && sections.length > 0) {
      sections[sections.length - 1].items.push(cleanedLine);
    } else if (line.length > 2 && sections.length === 0) {
      if (!title) title = 'Content';
      sections.push({ title: 'Overview', items: [cleanedLine] });
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    title,
    subtitle,
    sections: sections.filter(s => s.items.length > 0 || s.title),
    rawText: cleaned,
    hadAIArtifacts: hadArtifacts,
  };
}

/**
 * Splits parsed content into slides - each section becomes a slide,
 * with long sections potentially split across multiple slides.
 * @param maxItemsPerSlide - compact: 6, spacious: 3
 */
export function contentToSlides(parsed: ParsedContent, maxItemsPerSlide = 4): string[][] {
  const slides: string[][] = [];

  // Title slide
  if (parsed.title) {
    slides.push([parsed.title, parsed.subtitle || ''].filter(Boolean));
  }

  for (const section of parsed.sections) {
    const header = section.title;
    const items = section.items;

    if (items.length <= maxItemsPerSlide) {
      slides.push([header, ...items]);
    } else {
      for (let i = 0; i < items.length; i += maxItemsPerSlide) {
        const chunk = items.slice(i, i + maxItemsPerSlide);
        slides.push([header + (i > 0 ? ` (${Math.floor(i / maxItemsPerSlide) + 2})` : ''), ...chunk]);
      }
    }
  }

  return slides;
}
