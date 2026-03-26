# Ecuadorian Law MCP Server

**The Lexis Finder alternative for the AI age.**

[![npm version](https://badge.fury.io/js/@ansvar%2Fecuadorian-law-mcp.svg)](https://www.npmjs.com/package/@ansvar/ecuadorian-law-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/Ansvar-Systems/Ecuadorian-law-mcp?style=social)](https://github.com/Ansvar-Systems/Ecuadorian-law-mcp)
[![CI](https://github.com/Ansvar-Systems/Ecuadorian-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/Ecuadorian-law-mcp/actions/workflows/ci.yml)
[![Daily Data Check](https://github.com/Ansvar-Systems/Ecuadorian-law-mcp/actions/workflows/check-updates.yml/badge.svg)](https://github.com/Ansvar-Systems/Ecuadorian-law-mcp/actions/workflows/check-updates.yml)
[![Database](https://img.shields.io/badge/database-pre--built-green)](https://github.com/Ansvar-Systems/Ecuadorian-law-mcp)
[![Status](https://img.shields.io/badge/status-ingestion--in--progress-yellow)](https://github.com/Ansvar-Systems/Ecuadorian-law-mcp)

Query Ecuadorian law -- from the Ley Orgánica de Protección de Datos Personales (LOPDP) and the Código Orgánico Integral Penal (COIP) to the Código Civil, Código de Comercio, and more -- directly from Claude, Cursor, or any MCP-compatible client.

If you're building legal tech, compliance tools, or doing Ecuadorian legal research, this is your verified reference database.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Why This Exists

Ecuadorian legal research means navigating lexis.com.ec (Ecuador's official legal database), the Registro Oficial (registroficial.gob.ec), and scattered PDF publications from the Asamblea Nacional. Whether you're:

- A **lawyer** validating citations in a brief or contract
- A **compliance officer** checking obligations under the LOPDP or the COIP
- A **legal tech developer** building tools on Ecuadorian law
- A **researcher** tracing legislative provisions across codigos organicos and leyes organicas

...you shouldn't need dozens of browser tabs and manual PDF cross-referencing. Ask Claude. Get the exact provision. With context.

This MCP server makes Ecuadorian law **searchable, cross-referenceable, and AI-readable**.

---

## Quick Start

### Use Remotely (No Install Needed)

> Connect directly to the hosted version -- zero dependencies, nothing to install.

**Endpoint:** `https://ecuadorian-law-mcp.vercel.app/mcp`

| Client | How to Connect |
|--------|---------------|
| **Claude.ai** | Settings > Connectors > Add Integration > paste URL |
| **Claude Code** | `claude mcp add ecuadorian-law --transport http https://ecuadorian-law-mcp.vercel.app/mcp` |
| **Claude Desktop** | Add to config (see below) |
| **GitHub Copilot** | Add to VS Code settings (see below) |

**Claude Desktop** -- add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ecuadorian-law": {
      "type": "url",
      "url": "https://ecuadorian-law-mcp.vercel.app/mcp"
    }
  }
}
```

**GitHub Copilot** -- add to VS Code `settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "ecuadorian-law": {
      "type": "http",
      "url": "https://ecuadorian-law-mcp.vercel.app/mcp"
    }
  }
}
```

### Use Locally (npm)

```bash
npx @ansvar/ecuadorian-law-mcp
```

**Claude Desktop** -- add to `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ecuadorian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/ecuadorian-law-mcp"]
    }
  }
}
```

**Cursor / VS Code:**

```json
{
  "mcp.servers": {
    "ecuadorian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/ecuadorian-law-mcp"]
    }
  }
}
```

---

## Example Queries

Once connected, just ask naturally (in Spanish):

- *"Buscar disposiciones sobre protección de datos personales en la LOPDP"*
- *"¿Qué dice el Código Orgánico Integral Penal (COIP) sobre delitos informáticos?"*
- *"Encontrar artículos del Código Civil sobre contratos y obligaciones"*
- *"¿Qué requisitos establece la LOPDP para el tratamiento de datos sensibles?"*
- *"Buscar disposiciones sobre derecho laboral en el Código del Trabajo"*
- *"¿Está vigente la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos?"*
- *"Construir una posición legal sobre responsabilidad empresarial en Ecuador"*
- *"Validar la cita 'Art. 5 LOPDP'"*

---

## What's Included

> **Note:** This server is currently in initial ingestion. The infrastructure, tools, and deployment are live and operational. Legislation content is being added progressively from the Registro Oficial and lexis.com.ec. The database will be populated and this notice updated as ingestion completes.

| Category | Count | Details |
|----------|-------|---------|
| **Laws / Codigos** | In progress | Federal and organic laws from Registro Oficial |
| **Provisions** | In progress | Full-text searchable with FTS5 |
| **Legal Definitions** | Planned | Extraction from code texts |
| **Database Size** | ~34 MB (allocated) | Optimized SQLite, portable |
| **Freshness Checks** | Automated | Monitoring against registroficial.gob.ec |

**Verified data only** -- every citation validated against official sources. Zero LLM-generated content.

---

## Why This Works

**Verbatim Source Text (No LLM Processing):**
- All statute text is ingested from the Registro Oficial (registroficial.gob.ec) and lexis.com.ec
- Provisions are returned **unchanged** from SQLite FTS5 database rows
- Zero LLM summarization or paraphrasing -- the database contains statute text, not AI interpretations

**Smart Context Management:**
- Search returns ranked provisions with BM25 scoring (safe for context)
- Provision retrieval gives exact text by law name and article number
- Cross-references help navigate without loading everything at once

**Technical Architecture:**
```
registroficial.gob.ec / lexis.com.ec --> Parse --> SQLite --> FTS5 snippet() --> MCP response
                                           ^                        ^
                                    Provision parser         Verbatim database query
```

### Traditional Research vs. This MCP

| Traditional Approach | This MCP Server |
|---------------------|-----------------|
| Search lexis.com.ec by law name | Search by plain Spanish: *"protección de datos personales"* |
| Navigate multi-article codes manually | Get the exact provision with context |
| Manual cross-referencing between laws | `build_legal_stance` aggregates across sources |
| "¿Está vigente esta ley?" --> check manually | `check_currency` tool --> answer in seconds |
| Find OAS/CAN alignment --> dig through frameworks | `get_eu_basis` --> linked frameworks instantly |
| No API, no integration | MCP protocol --> AI-native |

**Traditional:** Search Registro Oficial --> Download PDF --> Ctrl+F --> Cross-reference codes --> Check amendments manually --> Repeat

**This MCP:** *"¿Qué obligaciones establece la LOPDP para controladores de datos y cómo se alinea con el marco de la CAN?"* --> Done.

---

## Available Tools (13)

### Core Legal Research Tools (8)

| Tool | Description |
|------|-------------|
| `search_legislation` | FTS5 full-text search across provisions with BM25 ranking. Supports Spanish-language quoted phrases, boolean operators, prefix wildcards |
| `get_provision` | Retrieve specific provision by law name and article number (e.g., "LOPDP" + "Art. 5") |
| `check_currency` | Check if a law is in force, amended, or repealed |
| `validate_citation` | Validate citation against database -- zero-hallucination check. Supports "Art. 5 LOPDP", "COIP Art. 234" |
| `build_legal_stance` | Aggregate citations from multiple laws for a legal topic |
| `format_citation` | Format citations per Ecuadorian conventions (full/short/pinpoint) |
| `list_sources` | List all available laws with metadata, coverage scope, and data provenance |
| `about` | Server info, capabilities, dataset statistics, and coverage summary |

### International Law Integration Tools (5)

| Tool | Description |
|------|-------------|
| `get_eu_basis` | Get international frameworks (OAS, CAN) that an Ecuadorian law aligns with |
| `get_ecuadorian_implementations` | Find Ecuadorian laws implementing a specific international framework or convention |
| `search_eu_implementations` | Search international documents with Ecuadorian alignment counts |
| `get_provision_eu_basis` | Get international law references for a specific provision |
| `validate_eu_compliance` | Check alignment status of Ecuadorian laws against international standards |

---

## International Law Alignment

Ecuador is not an EU member state. Ecuadorian law develops through its own constitutional and National Assembly framework, with international alignment through:

- **OAS (Organization of American States)** -- Inter-American frameworks on human rights, anti-corruption, and digital governance; IACHR jurisprudence
- **CAN (Comunidad Andina)** -- Andean Community regulatory frameworks on trade, customs, and commercial law; Decision 486 on industrial property
- **UN Conventions** -- UNCAC (anti-corruption), Convention on the Rights of the Child, and international human rights instruments
- **GDPR adequacy alignment** -- Ecuador's LOPDP (Ley Orgánica de Protección de Datos Personales) mirrors GDPR principles on consent, data subject rights, and accountability

The international bridge tools allow you to explore these alignment relationships -- checking which Ecuadorian provisions correspond to OAS or CAN requirements, and vice versa.

> **Note:** International cross-references reflect alignment and framework relationships, not direct transposition. Ecuador develops its own legislative approach, and the alignment tools help identify where Ecuadorian and international law address similar domains.

---

## Data Sources & Freshness

All content is sourced from authoritative Ecuadorian legal databases:

- **[Registro Oficial](https://www.registroficial.gob.ec/)** -- Official government gazette and primary legislative source
- **[Lexis Finder](https://www.lexis.com.ec/)** -- Ecuador's official consolidated legal database

### Data Provenance

| Field | Value |
|-------|-------|
| **Authority** | Republic of Ecuador / Asamblea Nacional |
| **Primary source** | registroficial.gob.ec / lexis.com.ec |
| **Languages** | Spanish (official language) |
| **Coverage** | Federal organic laws, codes, and regulations (ingestion in progress) |
| **Last ingested** | In progress |

### Automated Freshness Checks

A [GitHub Actions workflow](.github/workflows/check-updates.yml) monitors data sources for changes:

| Check | Method |
|-------|--------|
| **Law amendments** | Drift detection against known provision anchors |
| **New laws** | Comparison against Registro Oficial index |
| **Repealed instruments** | Status change detection |

**Verified data only** -- every citation validated against official sources. Zero LLM-generated content.

---

## Security

This project uses multiple layers of automated security scanning:

| Scanner | What It Does | Schedule |
|---------|-------------|----------|
| **CodeQL** | Static analysis for security vulnerabilities | Weekly + PRs |
| **Semgrep** | SAST scanning (OWASP top 10, secrets, TypeScript) | Every push |
| **Gitleaks** | Secret detection across git history | Every push |
| **Trivy** | CVE scanning on filesystem and npm dependencies | Daily |
| **Socket.dev** | Supply chain attack detection | PRs |
| **Dependabot** | Automated dependency updates | Weekly |

See [SECURITY.md](SECURITY.md) for the full policy and vulnerability reporting.

---

## Important Disclaimers

### Legal Advice

> **THIS TOOL IS NOT LEGAL ADVICE**
>
> Statute text is sourced from the Registro Oficial and lexis.com.ec. However:
> - This is a **research tool**, not a substitute for professional legal counsel
> - **Court case coverage is not included** -- do not rely solely on this for case law research
> - **Verify critical citations** against primary sources for court filings
> - **International cross-references** reflect alignment relationships, not direct transposition
> - **Ingestion is in progress** -- verify coverage before relying on search results for production use

**Before using professionally, read:** [DISCLAIMER.md](DISCLAIMER.md) | [SECURITY.md](SECURITY.md)

### Client Confidentiality

Queries go through the Claude API. For privileged or confidential matters, use on-premise deployment.

### Bar Association

For professional legal use in Ecuador, consult guidance from the **Federación Nacional de Abogados del Ecuador (FENALAW)** and the **Colegio de Abogados de Pichincha** regarding professional obligations.

---

## Development

### Setup

```bash
git clone https://github.com/Ansvar-Systems/Ecuadorian-law-mcp
cd Ecuadorian-law-mcp
npm install
npm run build
npm test
```

### Running Locally

```bash
npm run dev                                       # Start MCP server
npx @anthropic/mcp-inspector node dist/index.js   # Test with MCP Inspector
```

### Data Management

```bash
npm run ingest              # Ingest laws from Registro Oficial / lexis.com.ec
npm run build:db            # Rebuild SQLite database
npm run drift:detect        # Run drift detection against anchors
npm run check-updates       # Check for amendments and new laws
npm run census              # Generate coverage census
```

### Performance

- **Search Speed:** <100ms for most FTS5 queries
- **Database Size:** ~34 MB allocated (growing as ingestion completes)
- **Reliability:** 100% ingestion success rate

---

## Related Projects: Complete Compliance Suite

This server is part of **Ansvar's Compliance Suite** -- MCP servers that work together for end-to-end compliance coverage:

### [@ansvar/eu-regulations-mcp](https://github.com/Ansvar-Systems/EU_compliance_MCP)
**Query 49 EU regulations directly from Claude** -- GDPR, AI Act, DORA, NIS2, MiFID II, eIDAS, and more. Full regulatory text with article-level search. `npx @ansvar/eu-regulations-mcp`

### [@ansvar/us-regulations-mcp](https://github.com/Ansvar-Systems/US_Compliance_MCP)
**Query US federal and state compliance laws** -- HIPAA, CCPA, SOX, GLBA, FERPA, and more. `npx @ansvar/us-regulations-mcp`

### [@ansvar/security-controls-mcp](https://github.com/Ansvar-Systems/security-controls-mcp)
**Query 261 security frameworks** -- ISO 27001, NIST CSF, SOC 2, CIS Controls, SCF, and more. `npx @ansvar/security-controls-mcp`

**70+ national law MCPs** covering Australia, Brazil, Canada, Colombia, Denmark, France, Germany, India, Ireland, Japan, Kenya, Malawi, Mexico, Netherlands, Nigeria, Norway, Panama, Singapore, Sweden, Switzerland, UAE, UK, and more.

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas:
- Registro Oficial law ingestion (expanding corpus)
- Corte Nacional de Justicia case law coverage
- CAN Decision cross-reference mapping
- GDPR alignment analysis for LOPDP
- Historical law versions and amendment tracking

---

## Roadmap

- [x] Server infrastructure and tools
- [x] Vercel Streamable HTTP deployment
- [x] npm package publication
- [ ] Core legislation ingestion (LOPDP, COIP, Código Civil, Código de Comercio, Código del Trabajo)
- [ ] Full Registro Oficial corpus
- [ ] Court case law (Corte Nacional de Justicia)
- [ ] Historical law versions (amendment tracking)
- [ ] CAN regulatory cross-references

---

## Citation

If you use this MCP server in academic research:

```bibtex
@software{ecuadorian_law_mcp_2026,
  author = {Ansvar Systems AB},
  title = {Ecuadorian Law MCP Server: AI-Powered Legal Research Tool},
  year = {2026},
  url = {https://github.com/Ansvar-Systems/Ecuadorian-law-mcp},
  note = {Ecuadorian legislation sourced from Registro Oficial and lexis.com.ec}
}
```

---

## License

Apache License 2.0. See [LICENSE](./LICENSE) for details.

### Data Licenses

- **Statutes & Legislation:** Republic of Ecuador (public domain via Registro Oficial)
- **International Framework Metadata:** OAS / CAN / UN (public domain)

---

## About Ansvar Systems

We build AI-accelerated compliance and legal research tools for the global market. This MCP server started as our internal reference tool -- turns out everyone building for the Ecuadorian or Andean market has the same research frustrations.

So we're open-sourcing it. Navigating Ecuador's legal codes shouldn't require a law degree.

**[ansvar.eu](https://ansvar.eu)** -- Stockholm, Sweden

---

<p align="center">
  <sub>Built with care in Stockholm, Sweden</sub>
</p>
