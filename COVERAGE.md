# Coverage Index -- EC Law MCP

> Auto-generated from census data. Do not edit manually.
> Generated: 2026-02-28

## Source

| Field | Value |
|-------|-------|
| Authority | Asamblea Nacional del Ecuador |
| Portal | [asambleanacional.gob.ec](https://www.asambleanacional.gob.ec/es/leyes-aprobadas) |
| License | Government Open Data |
| Census date | 2026-02-28 |

## Summary

| Metric | Count |
|--------|-------|
| Total laws enumerated | 301 |
| Ingestable | 301 |
| Ingested | 300 |
| Excluded | 0 |
| Provisions extracted | 10,361 |
| Definitions extracted | 50 |
| **Coverage** | **99.7%** |

## Notes

- Census covers all approved laws from the Asamblea Nacional across 4 legislative periods (2009-2026)
- All 301 laws are available as PDF downloads from asambleanacional.gob.ec
- Text extraction via pdftotext (poppler-utils) with article-level parsing
- Spanish-language articles parsed in "Artículo N.-" format
- 1 law failed to download (HTTP error)
- 2 laws had zero provisions (PDF text extraction returned insufficient text)
- Major codes included: COIP (523 articles), Código de Comercio (996), Código Orgánico Administrativo (255), Código Monetario y Financiero (339)
- Full re-ingestion can be done with `npm run ingest -- --force`
