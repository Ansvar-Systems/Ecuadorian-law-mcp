/**
 * Ecuador Law PDF/Text Parser
 *
 * Parses law text extracted from PDFs downloaded from
 * asambleanacional.gob.ec. Uses `pdftotext` for extraction,
 * then applies regex-based article parsing.
 *
 * Article patterns in Ecuadorian legislation:
 *   "Artículo 1.- Objeto..."
 *   "Art. 1.-"
 *   "DISPOSICIÓN TRANSITORIA PRIMERA.-"
 *   "DISPOSICIÓN GENERAL.-"
 *
 * Chapter/Title patterns:
 *   "CAPÍTULO I", "TÍTULO II", "SECCIÓN PRIMERA"
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

export interface ActIndexEntry {
  id: string;
  title: string;
  titleEn: string;
  shortName: string;
  status: 'in_force' | 'amended' | 'repealed' | 'not_yet_in_force';
  issuedDate: string;
  inForceDate: string;
  url: string;
  description?: string;
}

export interface ParsedProvision {
  provision_ref: string;
  chapter?: string;
  section: string;
  title: string;
  content: string;
}

export interface ParsedDefinition {
  term: string;
  definition: string;
  source_provision?: string;
}

export interface ParsedAct {
  id: string;
  type: 'statute';
  title: string;
  title_en: string;
  short_name: string;
  status: string;
  issued_date: string;
  in_force_date: string;
  url: string;
  description?: string;
  provisions: ParsedProvision[];
  definitions: ParsedDefinition[];
}

/* ---------- PDF Text Extraction ---------- */

/**
 * Extract text from a PDF file using pdftotext (poppler-utils).
 * Falls back to reading the file as text if pdftotext is not available.
 */
export function extractTextFromPdf(pdfPath: string): string {
  try {
    // Use pdftotext with -layout to preserve formatting
    const result = execSync(`pdftotext -layout "${pdfPath}" -`, {
      maxBuffer: 50 * 1024 * 1024, // 50 MB buffer
      encoding: 'utf-8',
      timeout: 30000,
    });
    return result;
  } catch (err) {
    // Try without -layout flag
    try {
      const result = execSync(`pdftotext "${pdfPath}" -`, {
        maxBuffer: 50 * 1024 * 1024,
        encoding: 'utf-8',
        timeout: 30000,
      });
      return result;
    } catch {
      console.error(`  Warning: pdftotext failed for ${pdfPath}: ${err}`);
      return '';
    }
  }
}

/* ---------- Text Parsing ---------- */

// Regex for article headings
const ARTICLE_RE = /(?:^|\n)\s*(?:Art[ií]culo|Art\.?)\s+((?:\d+[\s.]*(?:bis|ter|qu[aá]ter|quinquies)?|\d+[A-Z]?(?:\.\d+)?))\s*[.°º]*[-.:–]?\s*([^\n]*)/gimu;

// Regex for transitional/general dispositions
const DISPOSITION_RE = /(?:^|\n)\s*(DISPOSICI[ÓO]N\s+(?:TRANSITORIA|GENERAL|DEROGATORIA|REFORMATORIA|FINAL)\s*(?:PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|S[EÉ]PTIMA|OCTAVA|NOVENA|D[EÉ]CIMA|[ÚU]NICA)?)\s*[.°º]*[-.:–]?\s*([^\n]*)/gimu;

// Regex for chapter/title/section headings
const CHAPTER_RE = /(?:^|\n)\s*((?:CAP[ÍI]TULO|T[ÍI]TULO|SECCI[ÓO]N)\s+[IVXLC0-9]+[^\n]*)/gimu;

// Definition patterns (Spanish)
const DEFINITION_PATTERNS = [
  /se\s+(?:define|entiende|entender[aá])\s+(?:como|por)\s+"?([^".:]+)"?\s*(?:como|a|:)\s*([^.]+\.)/gi,
  /(?:Para\s+(?:los\s+)?efectos?\s+de\s+(?:esta|la\s+presente)\s+(?:ley|norma)[^:]*:\s*)\n?\s*(?:\d+[.)]\s*)?([^:–-]+)\s*[:–-]\s*([^.;]+[.;])/gim,
];

function decodeEntities(text: string): string {
  return text
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

function cleanText(text: string): string {
  return decodeEntities(text)
    .replace(/<[^>]*>/g, '') // Strip any HTML tags
    .replace(/\r\n/g, '\n')
    .replace(/\f/g, '\n') // Form feeds from PDF
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Find the start of the actual law text, skipping preamble
 * (presidential letters, R.O. metadata, etc.)
 */
function findLawTextStart(text: string): number {
  // Look for patterns that indicate the start of the actual law
  const startPatterns = [
    /\b(?:EL\s+PLENO\s+DE\s+LA\s+ASAMBLEA\s+NACIONAL)\b/i,
    /\bCONSIDERANDO\b/i,
    /\b(?:LA\s+ASAMBLEA\s+NACIONAL)\s*\n\s*(?:CONSIDERANDO|EXPIDE)/i,
    /\bEXPIDE\s*:/i,
    /\bRESUELVE\s*:/i,
    /\bDECRETA\s*:/i,
    /(?:^|\n)\s*Art[ií]culo\s+1\s*[.°º]*[-.:–]/im,
  ];

  let earliestPos = text.length;
  for (const pattern of startPatterns) {
    const match = pattern.exec(text);
    if (match && match.index < earliestPos) {
      earliestPos = match.index;
    }
  }

  // If no pattern found, start from beginning
  return earliestPos === text.length ? 0 : earliestPos;
}

/**
 * Parse extracted PDF text into provisions.
 */
export function parseEcuadorLawText(text: string, act: ActIndexEntry): ParsedAct {
  const cleaned = cleanText(text);
  const startIdx = findLawTextStart(cleaned);
  const lawText = cleaned.substring(startIdx);

  const provisions: ParsedProvision[] = [];
  const definitions: ParsedDefinition[] = [];

  // Collect all headings (articles + dispositions) with positions
  interface Heading {
    ref: string;
    title: string;
    position: number;
  }

  const headings: Heading[] = [];

  // Articles
  const articleRe = new RegExp(ARTICLE_RE.source, ARTICLE_RE.flags);
  let match: RegExpExecArray | null;

  while ((match = articleRe.exec(lawText)) !== null) {
    const num = match[1].replace(/\s+/g, '').replace(/\.$/, '');
    const title = (match[2] ?? '').trim();
    headings.push({
      ref: `art${num}`,
      title: title || `Artículo ${num}`,
      position: match.index,
    });
  }

  // Dispositions
  const dispRe = new RegExp(DISPOSITION_RE.source, DISPOSITION_RE.flags);
  while ((match = dispRe.exec(lawText)) !== null) {
    const heading = match[1].trim();
    const title = (match[2] ?? '').trim();
    const ref = heading
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40);
    headings.push({
      ref,
      title: title || heading,
      position: match.index,
    });
  }

  // Sort by position
  headings.sort((a, b) => a.position - b.position);

  // Track current chapter
  let currentChapter = '';
  const chapterRe = new RegExp(CHAPTER_RE.source, CHAPTER_RE.flags);
  const chapterPositions: { chapter: string; position: number }[] = [];

  while ((match = chapterRe.exec(lawText)) !== null) {
    chapterPositions.push({
      chapter: match[1].trim(),
      position: match.index,
    });
  }

  // Extract content between headings
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextHeading = headings[i + 1];
    const endPos = nextHeading ? nextHeading.position : lawText.length;
    const content = lawText.substring(heading.position, endPos).trim();

    // Determine chapter for this provision
    for (const cp of chapterPositions) {
      if (cp.position <= heading.position) {
        currentChapter = cp.chapter;
      }
    }

    // Clean the content - remove the heading itself from the content start
    const contentLines = content.split('\n');
    const cleanedContent = contentLines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    if (cleanedContent.length > 10) {
      provisions.push({
        provision_ref: heading.ref,
        chapter: currentChapter || undefined,
        section: currentChapter || act.title,
        title: heading.title,
        content: cleanedContent,
      });
    }
  }

  // Extract definitions
  for (const pattern of DEFINITION_PATTERNS) {
    const defRe = new RegExp(pattern.source, pattern.flags);
    while ((match = defRe.exec(lawText)) !== null) {
      const term = (match[1] ?? '').trim();
      const definition = (match[2] ?? '').trim();
      if (term.length > 2 && term.length < 100 && definition.length > 10) {
        // Find which provision this definition is in
        let sourceProvision: string | undefined;
        for (let i = headings.length - 1; i >= 0; i--) {
          if (headings[i].position <= match.index) {
            sourceProvision = headings[i].ref;
            break;
          }
        }
        definitions.push({
          term,
          definition,
          source_provision: sourceProvision,
        });
      }
    }
  }

  // If no articles found, create a single provision from the entire law text
  if (provisions.length === 0 && lawText.length > 50) {
    provisions.push({
      provision_ref: 'full-text',
      section: act.title,
      title: act.title,
      content: lawText.substring(0, 50000), // Cap at 50KB
    });
  }

  return {
    id: act.id,
    type: 'statute',
    title: act.title,
    title_en: act.titleEn,
    short_name: act.shortName,
    status: act.status,
    issued_date: act.issuedDate,
    in_force_date: act.inForceDate,
    url: act.url,
    provisions,
    definitions,
  };
}

/**
 * Parse a PDF file into a ParsedAct.
 * This is the main entry point used by ingest.ts.
 */
export function parseEcuadorLawPdf(pdfPath: string, act: ActIndexEntry): ParsedAct {
  const text = extractTextFromPdf(pdfPath);
  if (!text || text.trim().length < 50) {
    // Return empty provisions if extraction fails
    return {
      id: act.id,
      type: 'statute',
      title: act.title,
      title_en: act.titleEn,
      short_name: act.shortName,
      status: act.status,
      issued_date: act.issuedDate,
      in_force_date: act.inForceDate,
      url: act.url,
      provisions: [],
      definitions: [],
    };
  }
  return parseEcuadorLawText(text, act);
}

// Alias for backwards compatibility with template ingest.ts
export function parseHtml(html: string, act: ActIndexEntry): ParsedAct {
  return parseEcuadorLawText(html, act);
}

// Named export for ingest.ts
export { parseEcuadorLawPdf as parseEcuadorLawHtml };
