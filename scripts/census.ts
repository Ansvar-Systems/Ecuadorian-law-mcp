#!/usr/bin/env tsx
/**
 * Ecuador Law MCP -- Census Script
 *
 * Scrapes the Asamblea Nacional (asambleanacional.gob.ec) to enumerate
 * ALL approved laws across all legislative periods (2009-present).
 *
 * The listing is a Drupal views table with pagination. Each entry has:
 *   - Law number
 *   - Title
 *   - Registro Oficial reference
 *   - PDF download link
 *
 * Source: https://www.asambleanacional.gob.ec/es/leyes-aprobadas
 *
 * Usage:
 *   npx tsx scripts/census.ts
 *   npx tsx scripts/census.ts --limit 20
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const CENSUS_PATH = path.join(DATA_DIR, 'census.json');

const BASE_URL = 'https://www.asambleanacional.gob.ec/es/leyes-aprobadas';

// Legislative period tag IDs from the Drupal view filter
const PERIODS: { tid: string; label: string }[] = [
  { tid: 'All', label: 'All periods' },
];

interface RawLawEntry {
  number: string;
  title: string;
  registroOficial: string;
  pdfUrl: string;
}

/* ---------- Parsing ---------- */

function parseLawListingPage(html: string): RawLawEntry[] {
  const entries: RawLawEntry[] = [];

  // Match table rows (odd/even classes) in the Drupal view
  const rowRe = /<tr\s+class="(?:odd|even)[^"]*">([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRe.exec(html)) !== null) {
    const row = rowMatch[1];

    // Extract cells
    const cellRe = /<td\s+class="views-field\s+([^"]+)"[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: Record<string, string> = {};
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRe.exec(row)) !== null) {
      const field = cellMatch[1].trim();
      const value = cellMatch[2].trim();
      cells[field] = value;
    }

    const number = (cells['views-field-field-numeros-de-ley'] ?? '').trim();
    const title = (cells['views-field-title'] ?? '').replace(/<[^>]*>/g, '').trim();
    const ro = (cells['views-field-field-registro-oficial-de'] ?? '').replace(/<[^>]*>/g, '').trim();

    // Extract PDF URL from download cell
    const downloadCell = cells['views-field-field-descarga'] ?? '';
    const pdfMatch = downloadCell.match(/href="([^"]+\.pdf)"/i);
    const pdfUrl = pdfMatch ? pdfMatch[1] : '';

    // Ensure PDF URL is absolute
    const absolutePdfUrl = pdfUrl.startsWith('http')
      ? pdfUrl
      : pdfUrl.startsWith('/')
        ? `https://www.asambleanacional.gob.ec${pdfUrl}`
        : pdfUrl
          ? `https://www.asambleanacional.gob.ec/${pdfUrl}`
          : '';

    if (title) {
      entries.push({
        number,
        title,
        registroOficial: ro,
        pdfUrl: absolutePdfUrl,
      });
    }
  }

  return entries;
}

function hasNextPage(html: string, currentPage: number): boolean {
  const nextPagePattern = new RegExp(`page=${currentPage + 1}`, 'i');
  return nextPagePattern.test(html);
}

/* ---------- Helpers ---------- */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

function extractDateFromRO(ro: string): string {
  // Pattern: "R.O. No. 229, Sexto Suplemento, de 23-02-2026"
  const dateMatch = ro.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    return `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`;
  }
  return '';
}

function parseArgs(): { limit: number | null } {
  const args = process.argv.slice(2);
  let limit: number | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return { limit };
}

/* ---------- Main ---------- */

async function main(): Promise<void> {
  const { limit } = parseArgs();

  console.log('Ecuador Law MCP -- Census');
  console.log('========================\n');
  console.log('  Source: asambleanacional.gob.ec/es/leyes-aprobadas');
  console.log('  Method: Drupal views pagination scraping');
  if (limit) console.log(`  --limit ${limit}`);
  console.log('');

  fs.mkdirSync(DATA_DIR, { recursive: true });

  const allEntries: RawLawEntry[] = [];
  const seenTitles = new Set<string>();

  // Scrape "All" filter to get all laws in one go
  let page = 0;
  let consecutiveEmpty = 0;
  const MAX_EMPTY = 3;

  while (consecutiveEmpty < MAX_EMPTY) {
    const url = `${BASE_URL}?leyes-aprobadas=All&title=&fecha=&page=${page}`;
    process.stdout.write(`  Page ${page}...`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ecuadorian-law-mcp/1.0 (census; https://github.com/Ansvar-Systems/ecuadorian-law-mcp)',
        'Accept': 'text/html',
      },
    });

    if (response.status !== 200) {
      console.log(` HTTP ${response.status}`);
      consecutiveEmpty++;
      page++;
      continue;
    }

    const html = await response.text();
    const entries = parseLawListingPage(html);

    if (entries.length === 0) {
      console.log(' empty');
      consecutiveEmpty++;
      page++;
      continue;
    }

    consecutiveEmpty = 0;

    // Deduplicate by title
    let newCount = 0;
    for (const entry of entries) {
      const key = entry.title.toLowerCase();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        allEntries.push(entry);
        newCount++;
      }
    }

    console.log(` ${entries.length} entries (${newCount} new, cumulative ${allEntries.length})`);

    if (limit && allEntries.length >= limit) {
      console.log(`\n  Reached --limit ${limit}`);
      break;
    }

    if (!hasNextPage(html, page)) {
      console.log('\n  No more pages.');
      break;
    }

    page++;

    // Rate limit: 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (consecutiveEmpty >= MAX_EMPTY) {
    console.log('\n  Reached end of pagination.');
  }

  // Build census entries
  const laws = allEntries
    .slice(0, limit ?? allEntries.length)
    .map((entry, idx) => {
      const date = extractDateFromRO(entry.registroOficial);
      const id = `ec-ley-${slugify(entry.title).substring(0, 40)}-${idx}`;

      return {
        id,
        title: entry.title,
        identifier: entry.number ? `Ley ${entry.number}` : entry.title,
        url: entry.pdfUrl,
        status: 'in_force' as const,
        category: 'act' as const,
        classification: entry.pdfUrl ? 'ingestable' as const : 'inaccessible' as const,
        ingested: false,
        provision_count: 0,
        ingestion_date: null as string | null,
        registro_oficial: entry.registroOficial,
        issued_date: date,
      };
    });

  const ingestable = laws.filter(l => l.classification === 'ingestable').length;
  const inaccessible = laws.filter(l => l.classification === 'inaccessible').length;

  const census = {
    schema_version: '2.0',
    jurisdiction: 'EC',
    jurisdiction_name: 'Ecuador',
    portal: 'asambleanacional.gob.ec',
    census_date: new Date().toISOString().split('T')[0],
    agent: 'ecuadorian-law-mcp/census.ts',
    summary: {
      total_laws: laws.length,
      ingestable,
      ocr_needed: 0,
      inaccessible,
      excluded: 0,
    },
    laws,
  };

  fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2));

  console.log('\n==================================================');
  console.log('CENSUS COMPLETE');
  console.log('==================================================');
  console.log(`  Total laws discovered:  ${laws.length}`);
  console.log(`  Ingestable:             ${ingestable}`);
  console.log(`  Inaccessible:           ${inaccessible}`);
  console.log(`  Pages scanned:          ${page + 1}`);
  console.log(`\n  Output: ${CENSUS_PATH}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
