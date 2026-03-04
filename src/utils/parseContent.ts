export interface ContentSection {
  title: string;
  items: string[];
}

export interface ParsedContent {
  title?: string;
  subtitle?: string;
  sections: ContentSection[];
  rawText: string;
}

/**
 * Parses raw resume/content text into structured sections.
 * Handles common formats: markdown headers, bullet points, plain text.
 */
export function parseContent(rawText: string): ParsedContent {
  const lines = rawText.trim().split('\n').map(l => l.trim());
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

    if (h1Match) {
      if (!title) title = h1Match[1];
      continue;
    }

    if (h2Match || h3Match) {
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: (h2Match || h3Match)![1],
        items: []
      };
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
        title = line;
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
      const content = (bulletMatch || numberedMatch)![1];
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
    if (!title && line.length < 80) {
      title = line;
      continue;
    }
    if (title && !subtitle && line.length < 80 && i === 1) {
      subtitle = line;
      continue;
    }

    // Add as item to current section
    if (currentSection && line.length > 0) {
      currentSection.items.push(line);
    } else if (line.length > 2 && !currentSection && sections.length > 0) {
      sections[sections.length - 1].items.push(line);
    } else if (line.length > 2 && sections.length === 0) {
      if (!title) title = 'Content';
      sections.push({ title: 'Overview', items: [line] });
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    title,
    subtitle,
    sections: sections.filter(s => s.items.length > 0 || s.title),
    rawText
  };
}

/**
 * Splits parsed content into slides - each section becomes a slide,
 * with long sections potentially split across multiple slides.
 */
export function contentToSlides(parsed: ParsedContent): string[][] {
  const slides: string[][] = [];
  const maxItemsPerSlide = 4;

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
