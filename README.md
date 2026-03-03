# Oracle 26ai — Converged Database POC

An interactive visualiser that demonstrates how Oracle 26ai unifies SQL, Vector Search, Graph traversal, and Vectorless/PageIndex into a single converged database engine — eliminating the need for separate specialist systems and the "Vector Tax."

---

## What This POC Does

This React application walks through the full story of modern database architecture — from raw data ingestion to AI-powered query execution — across four interactive tabs.

| Tab | What It Shows |
|---|---|
| **Overview** | The three retrieval paradigms, when to use specialist tools, Oracle 26ai capabilities |
| **Router** | Full pipeline from ingestion → backend setup → routing → query → result |
| **Architecture** | Animated before/after: fragmented stack → Oracle 26ai converged |
| **PostgreSQL** | Phase-by-phase migration journey from plain Postgres to full convergence |

---

## Project Structure

```
oracle-poc/
├── src/
│   ├── oracle_26ai_poc.jsx     ← Main application (single file)
│   └── App.js                  ← Entry point (imports the POC)
├── public/
│   └── index.html
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have Node.js installed. Download it from [nodejs.org](https://nodejs.org) if needed.

```bash
node --version   # should be v16 or higher
npm --version
```

### Installation

```bash
# 1. Create a new React app
npx create-react-app oracle-poc

# 2. Move into the project folder
cd oracle-poc

# 3. Copy oracle_26ai_poc.jsx into the src folder
cp path/to/oracle_26ai_poc.jsx src/

# 4. Replace src/App.js with the following content:
```

**`src/App.js`**
```js
export { default } from './oracle_26ai_poc';
```

### Run

```bash
npm start
```

Opens automatically at **http://localhost:3000**

---

## Features

### 1. Agentic Query Router (Main Feature)

Click any of the four sample queries to see the complete end-to-end pipeline:

| Query | Type | Engine Used |
|---|---|---|
| "What is the account balance for A101?" | SQL | Traditional RDBMS |
| "Find me relaxing, calm background music" | Vector | HNSW ANN Search |
| "What is the notice period in our HR policy?" | Graph/Vectorless | PageIndex + GraphRAG |
| "Find similar laptops in stock under $1200" | Hybrid | SQL + Vector + Graph |

Each query reveals three sub-tabs:

- **⚙ Ingestion / Backend Setup** — step-by-step data preparation before any query can run
- **📋 Schema** — the actual database tables with column types, PKs, FKs, and AI columns
- **⚡ Query & Result** — animated routing pipeline + generated SQL + typewriter result output
- **Specialist Tool tab** — when to use Neo4j / pgvector instead, with equivalent code

### 2. Ingestion Pipelines Explained

The Router tab shows exactly what backend work is required per retrieval type:

**SQL**
- Standard `CREATE TABLE` + `INSERT` + B-Tree index
- No special setup required

**Vector Search**
- `ALTER TABLE ADD COLUMN embedding VECTOR(1536)`
- Batch embedding job (Python + OpenAI / OCI GenAI) or in-DB `DBMS_VECTOR.UTL_TO_EMBEDDING()`
- `CREATE VECTOR INDEX` with HNSW algorithm
- Trigger-based refresh on data updates

**Graph / Vectorless**
- SQL Property Graph: `CREATE PROPERTY GRAPH` — virtual, zero data duplication, auto-syncs via FK
- PageIndex: `DBMS_VECTOR_CHAIN.CREATE_PAGE_INDEX()` — parses PDF structure into navigable clause nodes
- No chunking errors, exact section + page citation

**Hybrid**
- All three pipelines combined in one schema
- Readiness verification queries included

### 3. Architecture Transformation

The Architecture tab shows an animated before/after:

- **Before** — Three separate systems: PostgreSQL + pgvector + Neo4j/Apache AGE, each with ETL pipelines, separate security surfaces, and data sync overhead
- **After** — Single Oracle 26ai engine with SQL, Vector, Graph, and LLM capabilities unified
- Click **CONVERGE** to animate the transformation

### 4. PostgreSQL Migration Journey

Four clickable phases showing how teams typically evolve:

| Phase | Stack | Key Limitation |
|---|---|---|
| Phase 1 | PostgreSQL only | No semantic search |
| Phase 2 | PostgreSQL + pgvector | No graph, manual embedding refresh |
| Phase 3 | + Apache AGE / Neo4j | 3× overhead, ETL drift, data duplication |
| Oracle 26ai | Converged | All limitations resolved |

Each phase shows the actual DDL schema at that stage.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Styling | Inline styles (no Tailwind dependency) |
| Fonts | JetBrains Mono + Syne (Google Fonts CDN) |
| State | React hooks (`useState`, `useEffect`, `useRef`) |
| Data | Mock / simulated (no backend required) |
| Build | Create React App |

No additional npm packages needed beyond the default CRA setup.

---

## Architecture Concepts Covered

### The Three Retrieval Paradigms

```
SQL (Deterministic)
  └── Exact aggregations, ACID transactions, B-Tree indexes
  └── Use when: price filters, balance calculations, date ranges

Vector Search (Approximate)
  └── Embedding model → float[1536] → HNSW index → ANN search
  └── Use when: semantic similarity, synonym search, unstructured data

Graph / Vectorless (Structural)
  └── SQL Property Graphs (virtual) or PageIndex (document hierarchy)
  └── Use when: multi-hop relationships, document clause lookup, audit citations
```

### The Embedding Pipeline (Vector)

```
Raw Text Column
    ↓
ALTER TABLE ADD COLUMN embedding VECTOR(1536)
    ↓
Batch Job: call OCI GenAI / OpenAI API for each row
    ↓
UPDATE table SET embedding = [0.023, -0.441, ...1536 floats]
    ↓
CREATE VECTOR INDEX ... USING HNSW WITH DISTANCE COSINE
    ↓
Semantic search ready
```

### The Property Graph Build

```
Existing relational tables with FK constraints
    ↓
CREATE PROPERTY GRAPH supply_graph
  VERTEX TABLES (products, suppliers)
  EDGE TABLES (products AS supplied_by ...)
    ↓
Virtual graph — zero data duplication
Auto-syncs with relational data via FK mapping
    ↓
Graph traversal ready (no ETL required)
```

### The Hybrid Query (Oracle 26ai only)

```sql
SELECT p.name, p.price, s.supplier_name,
       VECTOR_DISTANCE(p.embedding, :ref_vec, COSINE) AS score
FROM products p
JOIN suppliers s ON p.supplier_id = s.supplier_id  -- Graph join
WHERE p.price < 1200 AND p.in_stock = TRUE          -- SQL filter
ORDER BY score ASC                                   -- Vector rank
FETCH FIRST 5 ROWS ONLY;
-- One query, one execution plan, three engines
```

---

## Extending This POC

### Connecting to a Real Oracle 26ai Instance

To wire the query cards to a real database, replace the mock result rendering in the `subTab === "query"` section with a fetch call:

```js
const res = await fetch('/api/query', {
  method: 'POST',
  body: JSON.stringify({ queryId: selQ.id, params: {} })
});
const data = await res.json();
```

You would need a backend (Node.js / Python FastAPI) that:
1. Accepts the query type
2. Runs the appropriate Oracle 26ai query via `node-oracledb` or `cx_Oracle`
3. Returns the result set as JSON

### Adding a Real Embedding Pipeline

```python
# FastAPI backend example
import openai, cx_Oracle

@app.post("/embed")
def embed_songs():
    conn = cx_Oracle.connect(os.environ["ORACLE_DSN"])
    rows = conn.execute("SELECT song_id, title, genre FROM songs WHERE embedding IS NULL")
    for song_id, title, genre in rows:
        vec = openai.embeddings.create(
            model="text-embedding-3-small",
            input=f"{title} {genre}"
        ).data[0].embedding
        conn.execute(
            "UPDATE songs SET embedding = :1 WHERE song_id = :2",
            [vec, song_id]
        )
    conn.commit()
    return {"status": "done"}
```

---

## Key Concepts Glossary

| Term | Definition |
|---|---|
| **Vector Tax** | The compounded cost of maintaining a separate vector store alongside a relational DB — ETL pipelines, sync jobs, separate security, duplicate data |
| **Embedding** | A high-dimensional float array (e.g. 1536 floats) that represents the semantic meaning of a text, image, or audio clip |
| **HNSW** | Hierarchical Navigable Small World — a graph-based ANN index structure enabling sub-millisecond approximate nearest neighbour search |
| **ANN** | Approximate Nearest Neighbor — finds the closest vectors to a query vector; trades a small recall loss for dramatic speed gains |
| **SQL Property Graph** | A virtual graph layer over existing relational tables in Oracle 26ai — no data duplication, auto-syncs via FK constraints |
| **PageIndex** | Oracle 26ai's structural document parser — indexes document hierarchy (chapters, sections, clauses) instead of fixed-size text chunks |
| **GraphRAG** | Graph-augmented Retrieval — uses graph traversal to resolve multi-hop relationships before generating an answer |
| **Select AI** | Oracle 26ai feature that translates plain English questions directly into SQL, Vector Search, or Graph queries |
| **DBMS_VECTOR** | Oracle 26ai PL/SQL package for in-database embedding generation and vector operations |
| **Chunking Error** | When a sentence or clause is split across two fixed-size RAG chunks, losing its meaning and producing hallucinated answers |

---

## Related Files

| File | Description |
|---|---|
| `oracle_26ai_poc.jsx` | This React POC application |
| `Oracle_26ai_Architecture_Brief.docx` | Full architecture brief document covering all concepts including data preprocessing pipelines (Section 6) |

---

## Notes

- All data in this POC is **mocked / simulated** — no real database connection is required to run it
- The POC is designed as a **presentation and education tool** for stakeholders evaluating Oracle 26ai
- For a production prototype with real queries, a Node.js or Python backend connecting to an Oracle 26ai instance is required (see Extending section above)
- The document `Oracle_26ai_Architecture_Brief.docx` contains the full written explanation of every concept shown in this POC, including the complete data preprocessing pipeline documentation in Section 6
