import { useState, useEffect, useRef } from "react";

const C = {
  oracleRed: "#C74634", darkBlue: "#0A1628", midBlue: "#1B3A5C",
  accent: "#E8A027", cyan: "#00D4FF", green: "#00E676", purple: "#BB86FC",
  surface: "#0D1F35", card: "#112240", border: "#1E3A5F",
  text: "#CCD6F6", textDim: "#8892B0", pg: "#336791", pgLight: "#4A90D9",
  orange: "#FF6D00",
};

// ─── QUERY DATA WITH FULL PIPELINE ──────────────────────────────────────────

const QUERIES = [
  {
    id: "balance",
    label: "What is the account balance for A101?",
    type: "SQL", color: C.cyan, icon: "🗄️", route: "Traditional SQL",

    ingestion: {
      title: "DATA INGESTION — SQL (Standard ETL)",
      color: C.cyan,
      steps: [
        {
          phase: "1. Raw Source Data",
          icon: "📥",
          code: `-- Raw CSV / application insert
account_id | owner_name   | branch_code
A101       | Rahul Mehta  | BLR-001
A102       | Priya Sharma | MUM-002`,
          note: "Structured relational data from your application, ERP, or CSV import."
        },
        {
          phase: "2. Schema Creation",
          icon: "🏗️",
          code: `CREATE TABLE accounts (
  account_id  VARCHAR(20) PRIMARY KEY,
  owner_name  VARCHAR(100),
  branch_code VARCHAR(10),
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE TABLE transactions (
  txn_id     BIGINT PRIMARY KEY,
  account_id VARCHAR(20) REFERENCES accounts,
  amount     DECIMAL(15,2),
  txn_type   VARCHAR(20),
  txn_date   TIMESTAMP
);`,
          note: "Standard DDL. No special setup — just normal relational tables."
        },
        {
          phase: "3. Insert / Load Data",
          icon: "💾",
          code: `-- Direct INSERT or bulk load
INSERT INTO accounts VALUES
  ('A101','Rahul Mehta','BLR-001',NOW());

INSERT INTO transactions VALUES
  (1001,'A101',  5000.00,'CREDIT','2025-01-10'),
  (1002,'A101', -800.00, 'DEBIT', '2025-01-15'),
  (1003,'A101', 20150.00,'CREDIT','2025-02-28');

-- Or bulk load via SQL*Loader / COPY
COPY transactions FROM '/data/txns.csv'
  WITH (FORMAT CSV, HEADER TRUE);`,
          note: "No embedding pipeline. No graph builder. Just plain SQL inserts."
        },
        {
          phase: "4. Indexes Created",
          icon: "⚡",
          code: `-- B-Tree index for fast account lookup
CREATE INDEX idx_txn_account
  ON transactions(account_id);

-- Composite index for date range queries
CREATE INDEX idx_txn_date
  ON transactions(account_id, txn_date);`,
          note: "B-Tree indexes enable fast ACID-compliant lookups. Oracle auto-maintains these."
        },
      ]
    },

    pipeline: {
      stages: [
        { id: "input", label: "User Input", icon: "💬", color: C.cyan, detail: 'Natural language:\n"What is the balance\nfor account A101?"', side: "input" },
        { id: "router", label: "AI Router", icon: "🧠", color: C.accent, detail: "Detects: aggregation\nkeywords (balance, sum)\n→ Routes to SQL engine", side: "process" },
        { id: "sql_gen", label: "SQL Generator", icon: "⚙️", color: C.cyan, detail: "SELECT SUM(amount)\nFROM transactions\nWHERE account_id='A101'", side: "process" },
        { id: "db", label: "Oracle 26ai\nSQL Engine", icon: "🗄️", color: C.cyan, detail: "ACID transaction scan\nB-Tree index lookup\nExact aggregation", side: "backend" },
        { id: "result", label: "Result", icon: "✅", color: C.green, detail: "Balance: $24,350.00\nOwner: Rahul Mehta\nlast_txn: 2025-02-28", side: "output" },
      ]
    },

    query: `-- Oracle 26ai: SQL aggregation
SELECT
  a.account_id,
  a.owner_name,
  SUM(t.amount)   AS balance,
  MAX(t.txn_date) AS last_transaction
FROM accounts a
JOIN transactions t
  ON a.account_id = t.account_id
WHERE a.account_id = 'A101'
GROUP BY a.account_id, a.owner_name;`,
    result: "account_id:       A101\nowner_name:       Rahul Mehta\nbalance:          $24,350.00\nlast_transaction: 2025-02-28",
    explanation: "Pure SQL — ACID-compliant aggregation. 100% precision, no approximation.",
    steps: ["Parse NL query", "Detect: aggregation intent", "Generate SQL", "B-Tree index scan", "SUM aggregation", "Return exact result"],

    schema: {
      tables: [
        { name: "accounts", color: C.cyan, columns: [
          { name: "account_id", type: "VARCHAR(20)", pk: true },
          { name: "owner_name", type: "VARCHAR(100)" },
          { name: "branch_code", type: "VARCHAR(10)" },
          { name: "created_at", type: "TIMESTAMP" },
        ]},
        { name: "transactions", color: C.cyan, columns: [
          { name: "txn_id", type: "BIGINT", pk: true },
          { name: "account_id", type: "VARCHAR(20)", fk: true },
          { name: "amount", type: "DECIMAL(15,2)" },
          { name: "txn_type", type: "VARCHAR(20)" },
          { name: "txn_date", type: "TIMESTAMP" },
        ]},
      ],
      note: "Standard relational schema. No special columns. Works in PostgreSQL, Oracle, MySQL."
    },
    externalTool: null,
  },

  // ── VECTOR ──────────────────────────────────────────────────────────────────
  {
    id: "music",
    label: "Find me relaxing, calm background music",
    type: "Vector", color: C.purple, icon: "🎵", route: "Vector Search (AI Vector Search)",

    ingestion: {
      title: "DATA INGESTION — VECTOR (Embedding Pipeline)",
      color: C.purple,
      steps: [
        {
          phase: "1. Raw Source Data",
          icon: "📥",
          code: `-- Existing songs table (relational)
song_id | title                  | artist       | genre
s001    | Lo-fi Chill Beats Vol3 | ChillWave    | Lo-fi
s002    | Ambient Forest Sounds  | NatureSounds | Ambient
s003    | Heavy Metal Storm      | MetalBand    | Metal`,
          note: "You already have structured song data. The embedding column does not exist yet."
        },
        {
          phase: "2. Add VECTOR Column",
          icon: "🏗️",
          code: `-- Oracle 26ai: native VECTOR type
ALTER TABLE songs
  ADD embedding VECTOR(1536, FLOAT32);

-- PostgreSQL equivalent (pgvector):
-- ALTER TABLE songs
--   ADD COLUMN embedding vector(1536);`,
          note: "Oracle 26ai has a built-in VECTOR type — no extension install required. 1536 dimensions = OpenAI text-embedding-3-small."
        },
        {
          phase: "3. Generate Embeddings (Batch Job)",
          icon: "🤖",
          code: `-- Option A: Oracle In-DB embedding via OCI GenAI
UPDATE songs s
SET embedding = DBMS_VECTOR.UTL_TO_EMBEDDING(
  s.title || ' ' || s.genre || ' ' || s.mood,
  JSON('{"provider":"OCIGenAI",
         "model":"cohere.embed-english-v3"}')
);

-- Option B: Python batch job (OpenAI)
import openai, cx_Oracle
conn = cx_Oracle.connect(DSN)
for row in conn.execute("SELECT song_id, title, genre FROM songs"):
    vec = openai.embeddings.create(
        model="text-embedding-3-small",
        input=f"{row.title} {row.genre}"
    ).data[0].embedding
    conn.execute(
        "UPDATE songs SET embedding=:1 WHERE song_id=:2",
        [vec, row.song_id]
    )`,
          note: "Each song's title + genre + mood is sent to an embedding model. The returned 1536-dim float array is stored in the VECTOR column."
        },
        {
          phase: "4. Build HNSW Vector Index",
          icon: "⚡",
          code: `-- Oracle 26ai: Create HNSW vector index
CREATE VECTOR INDEX idx_songs_vec
  ON songs(embedding)
  ORGANIZATION NEIGHBOR PARTITIONS
  WITH DISTANCE COSINE
  PARAMETERS (type HNSW, neighbors 32,
              efConstruction 200);

-- Index is now ready for ANN search.
-- New songs need re-embedding on insert.`,
          note: "HNSW (Hierarchical Navigable Small World) builds a proximity graph over the embedding space. Enables sub-millisecond approximate nearest neighbor search at scale."
        },
      ]
    },

    pipeline: {
      stages: [
        { id: "input", label: "User Query", icon: "💬", color: C.purple, detail: '"Find relaxing,\ncalm background music"', side: "input" },
        { id: "encode", label: "Query Encoder", icon: "🤖", color: C.purple, detail: "OCI GenAI / OpenAI\nencodes query text\n→ float[1536] vector", side: "process" },
        { id: "router", label: "AI Router", icon: "🧠", color: C.accent, detail: "Detects: semantic\nsearch intent\n→ Routes to Vector engine", side: "process" },
        { id: "ann", label: "HNSW ANN\nSearch", icon: "🔮", color: C.purple, detail: "Navigate proximity\ngraph layers\nFind top-K neighbors", side: "backend" },
        { id: "db", label: "Oracle 26ai\nVector Engine", icon: "⚡", color: C.purple, detail: "VECTOR_DISTANCE()\nCOSINE similarity\nRank by score", side: "backend" },
        { id: "result", label: "Ranked Results", icon: "✅", color: C.green, detail: "Lo-fi Chill (0.041)\nAmbient Forest (0.063)\nSoft Piano (0.071)", side: "output" },
      ]
    },

    query: `-- Oracle 26ai: Semantic vector search
-- Step 1: encode the user query at runtime
:query_vec := DBMS_VECTOR.UTL_TO_EMBEDDING(
  'relaxing calm background music',
  JSON('{"provider":"OCIGenAI",
         "model":"cohere.embed-english-v3"}')
);

-- Step 2: ANN search against stored embeddings
SELECT
  s.song_id,
  s.title,
  s.artist,
  s.genre,
  VECTOR_DISTANCE(s.embedding, :query_vec,
                  COSINE) AS score
FROM songs s
WHERE s.genre != 'Heavy Metal'
ORDER BY score ASC
FETCH FIRST 5 ROWS ONLY;`,
    result: "Lo-fi Chill Beats Vol.3    score: 0.041\nAmbient Forest Sounds      score: 0.063\nSoft Piano Collection      score: 0.071\nOcean Waves Study Mix      score: 0.089\nGentle Jazz Evening        score: 0.102",
    explanation: "Query is encoded to a vector at runtime. HNSW index finds the nearest embeddings — songs that are conceptually similar, even without exact keyword matches.",
    steps: ["Parse NL query", "Encode query → vector", "Detect: semantic intent", "HNSW graph traversal", "COSINE distance ranking", "Return top-K results"],

    schema: {
      tables: [
        { name: "songs", color: C.purple, columns: [
          { name: "song_id", type: "VARCHAR(36)", pk: true },
          { name: "title", type: "VARCHAR(200)" },
          { name: "artist", type: "VARCHAR(100)" },
          { name: "genre", type: "VARCHAR(50)" },
          { name: "mood", type: "VARCHAR(50)" },
          { name: "embedding", type: "VECTOR(1536, FLOAT32)", special: "AI" },
          { name: "created_at", type: "TIMESTAMP" },
        ]},
      ],
      note: "🤖 VECTOR(1536) stores the embedding generated by OCI GenAI/OpenAI. This column is populated via batch job or in-DB DBMS_VECTOR call before any semantic search can run."
    },

    externalTool: {
      name: "pgvector (PostgreSQL)", icon: "🐘", color: C.pg,
      when: "If already on PostgreSQL, pgvector adds a vector column and HNSW/IVFFlat index. The embedding generation pipeline (Python + OpenAI) is identical. Oracle 26ai adds native DBMS_VECTOR functions so you can generate embeddings inside the DB without an external Python job.",
      equivalent: `-- pgvector: same embedding pipeline
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE songs ADD COLUMN embedding vector(1536);

-- Python batch job (same for both)
import openai, psycopg2
conn = psycopg2.connect(DSN)
cur = conn.cursor()
cur.execute("SELECT song_id, title, genre FROM songs")
for song_id, title, genre in cur.fetchall():
    vec = openai.embeddings.create(
        model="text-embedding-3-small",
        input=f"{title} {genre}"
    ).data[0].embedding
    cur.execute(
        "UPDATE songs SET embedding=%s WHERE song_id=%s",
        [vec, song_id]
    )
conn.commit()

-- Query with pgvector operator
SELECT song_id, title,
  1-(embedding <=> query_vec::vector) AS score
FROM songs
ORDER BY embedding <=> query_vec::vector
LIMIT 5;`
    },
  },

  // ── GRAPH / VECTORLESS ──────────────────────────────────────────────────────
  {
    id: "policy",
    label: "What is the notice period in our HR policy?",
    type: "Graph", color: C.green, icon: "📄", route: "Vectorless / PageIndex + GraphRAG",

    ingestion: {
      title: "DATA INGESTION — GRAPH / VECTORLESS (Document + Graph Build)",
      color: C.green,
      steps: [
        {
          phase: "1. Raw Source Data",
          icon: "📥",
          code: `-- You have structured HR data (employees, depts)
-- AND an unstructured PDF document:

employees:
  emp_id | name         | dept_id | mgr_id
  E001   | Rahul Mehta  | D01     | E010
  E002   | Priya Sharma | D01     | E010

departments:
  dept_id | name        | head_emp_id
  D01     | Engineering | E010

-- HR_Policy_2024.pdf (100 pages, unstructured)`,
          note: "You have two things: relational tables AND an unstructured document. Both need to be prepared differently."
        },
        {
          phase: "2A. Build Relational Schema + SQL Property Graph",
          icon: "🕸️",
          code: `-- Relational tables (standard)
CREATE TABLE employees (
  emp_id   VARCHAR(10) PRIMARY KEY,
  name     VARCHAR(100),
  dept_id  VARCHAR(10) REFERENCES departments,
  mgr_id   VARCHAR(10) REFERENCES employees
);

-- Oracle 26ai: Virtual Property Graph
-- (NO data duplication — graph sits on top)
CREATE OR REPLACE PROPERTY GRAPH hr_graph
  VERTEX TABLES (
    employees   LABEL Employee
      PROPERTIES (emp_id, name),
    departments LABEL Department
      PROPERTIES (dept_id, name)
  )
  EDGE TABLES (
    employees AS reports_to
      SOURCE KEY (emp_id)
        REFERENCES employees(emp_id)
      DESTINATION KEY (mgr_id)
        REFERENCES employees(emp_id)
      LABEL REPORTS_TO,
    employees AS belongs_to
      SOURCE KEY (emp_id)
        REFERENCES employees(emp_id)
      DESTINATION KEY (dept_id)
        REFERENCES departments(dept_id)
      LABEL BELONGS_TO
  );`,
          note: "SQL Property Graph is VIRTUAL — it creates a graph VIEW over your existing relational tables. No data is copied or moved."
        },
        {
          phase: "2B. PageIndex — Document Structural Parsing",
          icon: "📑",
          code: `-- Oracle 26ai: Load PDF into CLOB
INSERT INTO policy_documents
  (doc_id, title, doc_type, raw_content)
VALUES (
  'HR-POL-2024',
  'Employee Handbook v3.2',
  'HR_POLICY',
  TO_CLOB(BFILENAME('DOCS_DIR','hr_policy.pdf'))
);

-- Oracle 26ai: Build PageIndex (structural map)
-- This parses headings, sections, clauses
-- and stores them as navigable nodes —
-- NOT as fixed-size text chunks.
BEGIN
  DBMS_VECTOR_CHAIN.CREATE_PAGE_INDEX(
    doc_id     => 'HR-POL-2024',
    doc_type   => 'PDF',
    index_type => 'STRUCTURAL'
  );
END;
/
-- Result: doc_clauses table is auto-populated
-- with section_number, page_number, clause_text`,
          note: "Unlike RAG which splits documents into fixed-size chunks (causing context loss at boundaries), PageIndex parses the STRUCTURE — chapters, sections, sub-clauses — preserving hierarchy."
        },
        {
          phase: "3. Resulting Navigable Structure",
          icon: "🗂️",
          code: `-- Auto-generated by PageIndex:
SELECT section_number, page_number,
       clause_topic, LEFT(clause_text,60)
FROM doc_clauses
WHERE doc_id = 'HR-POL-2024'
ORDER BY section_number;

-- Output:
-- 1.0  | p.1  | Introduction         | This handbook...
-- 2.0  | p.4  | Code of Conduct      | All employees...
-- 3.0  | p.9  | Leave Policy         | Annual leave...
-- 4.0  | p.14 | Compensation         | Salary review...
-- 4.2  | p.18 | Notice Period        | Employees must...
-- 5.0  | p.22 | Benefits             | Health insur...`,
          note: "Every clause is a navigable node with a section number and page citation. Query by topic — get back exact text + page reference. No hallucination."
        },
      ]
    },

    pipeline: {
      stages: [
        { id: "input", label: "User Query", icon: "💬", color: C.green, detail: '"What is the notice\nperiod in HR policy?"', side: "input" },
        { id: "router", label: "AI Router", icon: "🧠", color: C.accent, detail: "Detects: document\nstructural lookup\n→ Routes to PageIndex", side: "process" },
        { id: "pageidx", label: "PageIndex\nNavigator", icon: "📑", color: C.green, detail: "Load structural map\nof HR_POLICY doc\nNavigate to clause", side: "backend" },
        { id: "graph", label: "Graph Traversal\n(optional)", icon: "🕸️", color: C.green, detail: "If query needs\nwho reports to whom\n→ SQL Property Graph", side: "backend" },
        { id: "db", label: "Oracle 26ai\nEngine", icon: "🗄️", color: C.green, detail: "Exact clause lookup\nby topic + section\nWith page reference", side: "backend" },
        { id: "result", label: "Cited Result", icon: "✅", color: C.green, detail: "Section 4.2, Page 18\n'30 days written\nnotice required'", side: "output" },
      ]
    },

    query: `-- Oracle 26ai: PageIndex structural query
-- (Vectorless — no embedding, no chunking)
SELECT
  d.doc_id,
  d.title,
  c.section_number,
  c.page_number,
  c.clause_text
FROM policy_documents d
JOIN doc_clauses c ON d.doc_id = c.doc_id
WHERE d.doc_type     = 'HR_POLICY'
  AND c.clause_topic = 'Notice Period'
ORDER BY c.section_number;

-- Optional: Graph query for org context
SELECT * FROM GRAPH_TABLE(hr_graph
  MATCH (e IS Employee)-[r IS REPORTS_TO]
       ->(m IS Employee)
  WHERE e.emp_id = 'E001'
  COLUMNS (e.name, m.name AS manager)
);`,
    result: "doc_id:  HR-POL-2024\ntitle:   Employee Handbook v3.2\nsection: 4.2  |  page: 18\nclause:  Employees must provide 30 days\n          written notice of resignation.\n\n[Graph] E001 Rahul Mehta → reports to → E010",
    explanation: "PageIndex navigates document STRUCTURE — not floating chunks. Returns exact section + page = full audit trail. Zero chunking errors.",
    steps: ["Parse NL query", "Detect: doc structural lookup", "Load PageIndex for HR_POLICY", "Navigate section hierarchy", "Optional: graph traversal", "Return clause + citation"],

    schema: {
      tables: [
        { name: "policy_documents", color: C.green, columns: [
          { name: "doc_id", type: "VARCHAR(50)", pk: true },
          { name: "title", type: "VARCHAR(200)" },
          { name: "doc_type", type: "VARCHAR(50)" },
          { name: "raw_content", type: "CLOB (PDF)" },
          { name: "page_index", type: "CLOB (JSON)", special: "AI" },
        ]},
        { name: "doc_clauses", color: C.green, columns: [
          { name: "clause_id", type: "BIGINT", pk: true },
          { name: "doc_id", type: "VARCHAR(50)", fk: true },
          { name: "section_number", type: "VARCHAR(20)" },
          { name: "page_number", type: "INT" },
          { name: "clause_topic", type: "VARCHAR(100)" },
          { name: "clause_text", type: "CLOB" },
        ]},
        { name: "hr_graph (virtual)", color: C.green, columns: [
          { name: "VERTEX: employees", type: "→ emp_id, name", special: "AI" },
          { name: "VERTEX: departments", type: "→ dept_id, name", special: "AI" },
          { name: "EDGE: REPORTS_TO", type: "→ emp→mgr", special: "AI" },
          { name: "EDGE: BELONGS_TO", type: "→ emp→dept", special: "AI" },
        ]},
      ],
      note: "📑 page_index built by DBMS_VECTOR_CHAIN.CREATE_PAGE_INDEX(). doc_clauses auto-populated. hr_graph is VIRTUAL — no data copied from employees/departments tables."
    },

    externalTool: {
      name: "Neo4j (Graph Database)", icon: "🕸️", color: "#018BFF",
      when: "For very large enterprise knowledge graphs (billions of nodes — fraud networks, global supply chains), Neo4j's native graph storage and Cypher query engine offers superior traversal performance. For most operational graph needs Oracle 26ai's SQL Property Graphs are sufficient without data movement.",
      equivalent: `// Neo4j: you must DUPLICATE data into graph
// (this is the core difference vs Oracle 26ai)

// 1. Create nodes (data copied from RDBMS)
CREATE (e:Employee {
  emp_id: 'E001',
  name: 'Rahul Mehta'
})
CREATE (d:Department {
  dept_id: 'D01',
  name: 'Engineering'
})
// 2. Create relationships
MATCH (e:Employee {emp_id:'E001'}),
      (m:Employee {emp_id:'E010'})
CREATE (e)-[:REPORTS_TO]->(m)

// 3. Query
MATCH (e:Employee)-[:REPORTS_TO]->(m)
WHERE e.emp_id = 'E001'
RETURN e.name, m.name AS manager

// Problem: data is now in TWO places.
// ETL sync required whenever RDBMS changes.`
    },
  },

  // ── HYBRID ─────────────────────────────────────────────────────────────────
  {
    id: "hybrid",
    label: "Find similar laptops in stock under $1200",
    type: "Hybrid", color: C.accent, icon: "⚡", route: "Hybrid Query — SQL + Vector + Graph",

    ingestion: {
      title: "DATA INGESTION — HYBRID (SQL + Vector + Graph combined)",
      color: C.accent,
      steps: [
        {
          phase: "1. Relational Schema + Data",
          icon: "🗄️",
          code: `CREATE TABLE suppliers (
  supplier_id   VARCHAR(36) PRIMARY KEY,
  supplier_name VARCHAR(100),
  country       VARCHAR(50),
  lead_time_days INT
);

CREATE TABLE products (
  product_id  VARCHAR(36) PRIMARY KEY,
  name        VARCHAR(200),
  price       DECIMAL(10,2),
  in_stock    BOOLEAN DEFAULT TRUE,
  supplier_id VARCHAR(36) REFERENCES suppliers,
  description CLOB,
  embedding   VECTOR(1536, FLOAT32) -- added next
);

-- Insert product data
INSERT INTO suppliers VALUES
  ('SUP1','Dell APAC','India',3),
  ('SUP2','Lenovo IN','India',5);
INSERT INTO products (product_id,name,price,
  in_stock,supplier_id,description) VALUES
  ('P1','Dell XPS 13',999,TRUE,'SUP1',
   'Thin ultrabook, 12th gen Intel, FHD display'),
  ('P2','ThinkPad X1',1149,TRUE,'SUP2',
   'Business laptop, IPS display, long battery');`,
          note: "First insert relational data normally. The embedding column exists but is NULL until the embedding pipeline runs."
        },
        {
          phase: "2. Embedding Pipeline (Vector setup)",
          icon: "🤖",
          code: `-- Oracle 26ai: batch embed all product descriptions
UPDATE products p
SET embedding = DBMS_VECTOR.UTL_TO_EMBEDDING(
  p.name || '. ' || p.description,
  JSON('{"provider":"OCIGenAI",
         "model":"cohere.embed-english-v3"}')
)
WHERE embedding IS NULL;

-- Create HNSW vector index
CREATE VECTOR INDEX idx_products_vec
  ON products(embedding)
  ORGANIZATION NEIGHBOR PARTITIONS
  WITH DISTANCE COSINE;

-- Trigger: auto re-embed on description change
CREATE OR REPLACE TRIGGER trg_reembed
AFTER UPDATE OF description ON products
FOR EACH ROW
BEGIN
  UPDATE products SET embedding =
    DBMS_VECTOR.UTL_TO_EMBEDDING(:NEW.description,...)
  WHERE product_id = :NEW.product_id;
END;`,
          note: "Product descriptions are embedded. A trigger ensures embeddings stay current when descriptions are updated — solving the stale-embedding problem."
        },
        {
          phase: "3. SQL Property Graph (Graph setup)",
          icon: "🕸️",
          code: `-- Oracle 26ai: Virtual graph over existing tables
-- Zero data duplication
CREATE OR REPLACE PROPERTY GRAPH supply_graph
  VERTEX TABLES (
    products  LABEL Product
      PROPERTIES (product_id, name, price),
    suppliers LABEL Supplier
      PROPERTIES (supplier_id, supplier_name,
                  lead_time_days)
  )
  EDGE TABLES (
    products AS supplied_by
      SOURCE KEY (product_id)
        REFERENCES products(product_id)
      DESTINATION KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
      LABEL SUPPLIED_BY
  );

-- No ETL. Graph auto-reflects FK relationships.`,
          note: "The graph is built from the existing FOREIGN KEY between products → suppliers. No data moved. Automatically stays in sync with the relational tables."
        },
        {
          phase: "4. Ready: All 3 engines active",
          icon: "✅",
          code: `-- Verify everything is ready:

-- 1. Embeddings populated?
SELECT COUNT(*) AS missing_embeddings
FROM products WHERE embedding IS NULL;
-- → 0

-- 2. Vector index healthy?
SELECT index_name, status
FROM user_indexes
WHERE index_name = 'IDX_PRODUCTS_VEC';
-- → VALID

-- 3. Graph created?
SELECT graph_name FROM user_property_graphs;
-- → SUPPLY_GRAPH

-- All 3 engines ready. Hybrid query can run.`,
          note: "All three ingestion pipelines must complete before a hybrid query can run. Oracle 26ai stores all of this in one schema — no cross-system sync."
        },
      ]
    },

    pipeline: {
      stages: [
        { id: "input", label: "User Query", icon: "💬", color: C.accent, detail: '"Similar laptops\nin stock < $1200"', side: "input" },
        { id: "router", label: "AI Router", icon: "🧠", color: C.accent, detail: "Detects: hybrid intent\n(price+similarity+supplier)\n→ Compound plan", side: "process" },
        { id: "encode", label: "Query Encoder", icon: "🤖", color: C.purple, detail: "Encode query text\n→ vector for\nANN comparison", side: "process" },
        { id: "sql", label: "SQL Filter", icon: "🗄️", color: C.cyan, detail: "WHERE price < 1200\nAND in_stock = TRUE", side: "backend" },
        { id: "vec", label: "Vector Rank", icon: "🔮", color: C.purple, detail: "HNSW ANN search\nCOSINE similarity\nRank by score", side: "backend" },
        { id: "graph", label: "Graph Join", icon: "🕸️", color: C.green, detail: "Traverse SUPPLIED_BY\nedge → get supplier\nname + lead_time", side: "backend" },
        { id: "result", label: "Merged Result", icon: "✅", color: C.green, detail: "Dell XPS $999 (0.04)\nSupplier: Dell APAC 3d", side: "output" },
      ]
    },

    query: `-- Oracle 26ai: One query, three engines
-- Runtime: encode user query to vector
:ref_vec := DBMS_VECTOR.UTL_TO_EMBEDDING(
  'thin ultrabook lightweight portable laptop',
  JSON('{"provider":"OCIGenAI",
         "model":"cohere.embed-english-v3"}')
);

SELECT
  p.product_id,
  p.name,
  p.price,
  s.supplier_name,
  s.lead_time_days,
  VECTOR_DISTANCE(p.embedding,
                  :ref_vec, COSINE) AS score
FROM products p
JOIN suppliers s ON p.supplier_id = s.supplier_id
WHERE p.price    < 1200          -- SQL filter
  AND p.in_stock = TRUE          -- SQL filter
ORDER BY score ASC               -- Vector rank
FETCH FIRST 5 ROWS ONLY;`,
    result: "Dell XPS 13   $999   Dell APAC  3d  score:0.038\nThinkPad X1  $1149  Lenovo IN  5d  score:0.061\nHP Spectre   $1099  HP Direct  2d  score:0.079",
    explanation: "One execution plan — SQL filters, Vector ranks, Graph resolves supplier. Zero data movement. The Oracle 26ai convergence advantage.",
    steps: ["Parse NL query", "Detect: hybrid intent", "Encode query → vector", "SQL filter (price+stock)", "HNSW vector ranking", "Graph join (supplier)", "Merge → single result"],

    schema: {
      tables: [
        { name: "products", color: C.accent, columns: [
          { name: "product_id", type: "VARCHAR(36)", pk: true },
          { name: "name", type: "VARCHAR(200)" },
          { name: "price", type: "DECIMAL(10,2)" },
          { name: "in_stock", type: "BOOLEAN" },
          { name: "description", type: "CLOB" },
          { name: "supplier_id", type: "VARCHAR(36)", fk: true },
          { name: "embedding", type: "VECTOR(1536)", special: "AI" },
        ]},
        { name: "suppliers", color: C.accent, columns: [
          { name: "supplier_id", type: "VARCHAR(36)", pk: true },
          { name: "supplier_name", type: "VARCHAR(100)" },
          { name: "country", type: "VARCHAR(50)" },
          { name: "lead_time_days", type: "INT" },
        ]},
      ],
      note: "SQL handles price/stock filter. VECTOR(1536) powers semantic ranking. supplier_id FK becomes a graph SUPPLIED_BY edge. All in one schema."
    },

    externalTool: {
      name: "PostgreSQL fragmented stack", icon: "🐘", color: C.pg,
      when: "In PostgreSQL you need pgvector for embeddings + Apache AGE or Neo4j for graph + PostgreSQL for SQL — three systems with ETL sync between them. Application code must merge the three result sets. Oracle 26ai does it in one query.",
      equivalent: `-- PostgreSQL: 3 separate steps, merged in code

# Step 1: pgvector ANN candidates
cur.execute("""
  SELECT product_id FROM products
  ORDER BY embedding <=> %s::vector LIMIT 20
""", [query_vec])
candidate_ids = [r[0] for r in cur.fetchall()]

# Step 2: PostgreSQL SQL filter
cur.execute("""
  SELECT * FROM products
  WHERE product_id = ANY(%s)
    AND price < 1200
    AND in_stock = TRUE
""", [candidate_ids])
filtered = cur.fetchall()

# Step 3: Neo4j graph join (separate connection!)
neo4j_session.run("""
  MATCH (p:Product)-[:SUPPLIED_BY]->(s:Supplier)
  WHERE p.id IN $ids
  RETURN p.id, s.name, s.lead_time
""", ids=[r.product_id for r in filtered])

# Step 4: Merge in Python application code
# → error-prone, extra network round trips`
    },
  },
];

// ─── PG MIGRATION DATA ───────────────────────────────────────────────────────
const PG_STEPS = [
  {
    id: "pg1", phase: "Phase 1", label: "PostgreSQL (SQL Only)",
    color: C.pg, icon: "🐘",
    desc: "Standard relational PostgreSQL. Handles transactions, aggregations, structured queries. Most teams start here.",
    stack: ["PostgreSQL 16", "Standard SQL", "B-Tree / GIN indexes", "ACID transactions"],
    limitations: ["No semantic / synonym search", "No graph traversal", "Keyword-only full-text", "No document structural nav"],
    schema: `CREATE TABLE products (
  product_id  VARCHAR(36) PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  price       DECIMAL(10,2),
  in_stock    BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_fts ON products
  USING GIN(to_tsvector('english', description));`
  },
  {
    id: "pg2", phase: "Phase 2", label: "PostgreSQL + pgvector",
    color: C.pgLight, icon: "🔮",
    desc: "Add semantic search via pgvector extension. Embeddings live in PostgreSQL — but embedding refresh is manual and there is no graph support.",
    stack: ["PostgreSQL 16", "pgvector extension", "HNSW / IVFFlat index", "External embedding API"],
    limitations: ["Manual embedding refresh job", "No native graph support", "Two query codepaths", "ETL if source data changes"],
    schema: `CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE products
  ADD COLUMN embedding vector(1536);

CREATE INDEX ON products
  USING hnsw (embedding vector_cosine_ops)
  WITH (m=16, ef_construction=64);

-- Python batch job to populate embeddings:
-- for row in products:
--   vec = openai.embed(row.description)
--   UPDATE products SET embedding=vec
--   WHERE product_id=row.id`
  },
  {
    id: "pg3", phase: "Phase 3", label: "Postgres + pgvector + AGE",
    color: C.orange, icon: "🕸️",
    desc: "Add graph via Apache AGE. Now 3 systems, 3 security surfaces, ETL sync between all — the full Vector Tax.",
    stack: ["PostgreSQL 16", "pgvector (semantic)", "Apache AGE / Neo4j (graph)", "ETL pipelines between all"],
    limitations: ["3× operational overhead", "3× security surface", "ETL drift between systems", "Hybrid queries in app code", "3× backup & monitoring"],
    schema: `CREATE EXTENSION age;
LOAD 'age';
SET search_path = ag_catalog, "$user", public;
SELECT create_graph('supply_graph');

-- Data DUPLICATED into graph:
SELECT * FROM cypher('supply_graph', $$
  CREATE (p:Product {
    id: 'P1', name: 'Dell XPS 13'
  })-[:SUPPLIED_BY]->(s:Supplier {
    name: 'Dell APAC', lead_time: 3
  })
$$) AS (r agtype);

-- Now data lives in 2 places.
-- Sync job needed on every product update.`
  },
  {
    id: "oracle", phase: "Oracle 26ai", label: "Oracle 26ai — Converged",
    color: C.oracleRed, icon: "⚡",
    desc: "One database. Native VECTOR, SQL Property Graphs, PageIndex, In-DB LLM — all under one security model. No ETL, no sync, no drift.",
    stack: ["Oracle 26ai", "Native VECTOR type", "SQL Property Graphs (virtual)", "PageIndex (Vectorless)", "In-DB LLM via OCI GenAI"],
    limitations: [],
    schema: `CREATE TABLE products (
  product_id  VARCHAR2(36) PRIMARY KEY,
  name        VARCHAR2(200),
  price       NUMBER(10,2),
  in_stock    NUMBER(1) DEFAULT 1,
  description CLOB,
  supplier_id VARCHAR2(36),
  embedding   VECTOR(1536, FLOAT32), -- native
  created_at  TIMESTAMP DEFAULT SYSTIMESTAMP,
  FOREIGN KEY (supplier_id)
    REFERENCES suppliers(supplier_id)
);

CREATE VECTOR INDEX idx_products_vec
  ON products(embedding)
  ORGANIZATION NEIGHBOR PARTITIONS
  WITH DISTANCE COSINE;

CREATE OR REPLACE PROPERTY GRAPH supply_graph
  VERTEX TABLES (products, suppliers)
  EDGE TABLES (
    products AS supplied_by
      SOURCE KEY (product_id)
        REFERENCES products(product_id)
      DESTINATION KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
  );`
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 1200 }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    let v = 0; const step = value / (duration / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= value) { setD(value); clearInterval(t); } else setD(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <span>{d}</span>;
}

function TypewriterText({ text, speed = 16 }) {
  const [d, setD] = useState("");
  useEffect(() => {
    setD(""); let i = 0;
    const t = setInterval(() => {
      if (i < text.length) { setD(text.slice(0, i + 1)); i++; } else clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return <span>{d}<span style={{ opacity: d.length < text.length ? 1 : 0 }}>▌</span></span>;
}

function SchemaPanel({ schema }) {
  return (
    <div style={{ background: "#070F1A", border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.14em", marginBottom: 10 }}>DATABASE SCHEMA</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {schema.tables.map(t => (
          <div key={t.name} style={{ flex: 1, minWidth: 170, background: C.card, border: `1px solid ${t.color}44`, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ background: `${t.color}22`, borderBottom: `1px solid ${t.color}44`, padding: "6px 10px", fontSize: 10, fontWeight: 700, color: t.color }}>📋 {t.name}</div>
            {t.columns.map(col => (
              <div key={col.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderBottom: `1px solid ${C.border}22` }}>
                <span style={{ fontSize: 9, color: col.pk ? C.accent : col.fk ? C.cyan : col.special ? C.purple : C.textDim, flexShrink: 0 }}>
                  {col.pk ? "🔑" : col.fk ? "🔗" : col.special ? "🤖" : "·"}
                </span>
                <span style={{ fontSize: 10, color: col.pk ? "#fff" : C.text, fontWeight: col.pk ? 700 : 400, flex: 1 }}>{col.name}</span>
                <span style={{ fontSize: 9, color: col.special ? C.purple : C.textDim, fontStyle: "italic" }}>{col.type}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: C.textDim, lineHeight: 1.6, padding: "5px 8px", background: `${C.border}22`, borderRadius: 5 }}>
        ℹ {schema.note}
      </div>
    </div>
  );
}

// ─── INGESTION PANEL ─────────────────────────────────────────────────────────
function IngestionPanel({ ingestion }) {
  const [activeStep, setActiveStep] = useState(0);
  const step = ingestion.steps[activeStep];
  return (
    <div style={{ background: "#070F1A", border: `1px solid ${ingestion.color}44`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 9, color: ingestion.color, letterSpacing: "0.14em", marginBottom: 12, fontWeight: 700 }}>{ingestion.title}</div>

      {/* Step selector */}
      <div style={{ display: "flex", gap: 0, marginBottom: 12, borderRadius: 7, overflow: "hidden", border: `1px solid ${C.border}` }}>
        {ingestion.steps.map((s, i) => (
          <button key={i} onClick={() => setActiveStep(i)} style={{
            flex: 1, padding: "7px 4px", textAlign: "center", cursor: "pointer",
            background: activeStep === i ? `${ingestion.color}22` : "#070F1A",
            border: "none", borderRight: i < ingestion.steps.length - 1 ? `1px solid ${C.border}` : "none",
            borderBottom: activeStep === i ? `2px solid ${ingestion.color}` : "2px solid transparent",
            fontFamily: "inherit",
          }}>
            <div style={{ fontSize: 14 }}>{s.icon}</div>
            <div style={{ fontSize: 8, color: activeStep === i ? ingestion.color : C.textDim, marginTop: 2, lineHeight: 1.3 }}>{s.phase}</div>
          </button>
        ))}
      </div>

      {/* Step content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        <pre style={{ background: C.card, border: `1px solid ${ingestion.color}33`, borderRadius: 8, padding: 12, fontSize: 11, color: ingestion.color, lineHeight: 1.75, whiteSpace: "pre-wrap", overflowX: "auto", fontFamily: "'JetBrains Mono',monospace" }}>
          {step.code}
        </pre>
        <div style={{ padding: "8px 10px", background: `${ingestion.color}12`, border: `1px solid ${ingestion.color}33`, borderRadius: 7, fontSize: 10, color: C.text, lineHeight: 1.65 }}>
          💡 {step.note}
        </div>
      </div>
    </div>
  );
}

// ─── PIPELINE FLOW ────────────────────────────────────────────────────────────
function PipelineFlow({ pipeline, color, activeStage }) {
  const sideLabel = { input: "INPUT", process: "ROUTER/AI", backend: "DATABASE", output: "OUTPUT" };
  const sideColor = { input: C.textDim, process: C.accent, backend: color, output: C.green };

  return (
    <div style={{ background: "#070F1A", border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.14em", marginBottom: 12 }}>FULL PIPELINE — INPUT → BACKEND → OUTPUT</div>

      {/* Lane labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 8 }}>
        {["input", "process", "backend", "output"].map(side => (
          <div key={side} style={{ textAlign: "center", fontSize: 8, fontWeight: 700, color: sideColor[side], letterSpacing: "0.1em", padding: "3px 0", borderBottom: `1px solid ${sideColor[side]}44` }}>
            {sideLabel[side]}
          </div>
        ))}
      </div>

      {/* Stages as horizontal flow */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {pipeline.stages.map((stage, i) => {
          const active = activeStage >= i;
          const current = activeStage === i;
          return (
            <div key={stage.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                background: active ? `${stage.color}22` : C.card,
                border: `1.5px solid ${active ? stage.color : C.border}`,
                borderRadius: 8, padding: "8px 10px", textAlign: "center", minWidth: 80,
                transition: "all .4s",
                boxShadow: current ? `0 0 10px ${stage.color}55` : "none",
                animation: current ? "pulse .8s ease infinite" : "none",
              }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{stage.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: active ? stage.color : C.textDim, lineHeight: 1.3 }}>{stage.label}</div>
                {active && (
                  <div style={{ fontSize: 8, color: C.textDim, marginTop: 4, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{stage.detail}</div>
                )}
              </div>
              {i < pipeline.stages.length - 1 && (
                <div style={{ fontSize: 14, color: active ? stage.color : C.border, transition: "color .4s", flexShrink: 0 }}>→</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExternalToolPanel({ tool }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: `${tool.color}12`, border: `1px solid ${tool.color}55`, borderRadius: 10, padding: 14, marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{tool.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: tool.color, letterSpacing: "0.08em" }}>WHEN TO USE {tool.name.toUpperCase()} EXPLICITLY</span>
        <button onClick={() => setOpen(o => !o)} style={{ marginLeft: "auto", background: `${tool.color}22`, border: `1px solid ${tool.color}55`, borderRadius: 4, padding: "2px 7px", fontSize: 9, color: tool.color, cursor: "pointer", fontFamily: "inherit" }}>
          {open ? "Hide code" : "Show equivalent"}
        </button>
      </div>
      <div style={{ fontSize: 10, color: C.text, lineHeight: 1.7, marginBottom: open ? 8 : 0 }}>{tool.when}</div>
      {open && (
        <pre style={{ background: "#070F1A", border: `1px solid ${C.border}`, borderRadius: 7, padding: 10, fontSize: 10, color: tool.color, lineHeight: 1.75, whiteSpace: "pre-wrap", overflowX: "auto", marginTop: 8 }}>
          {tool.equivalent}
        </pre>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("overview");
  const [selQ, setSelQ] = useState(null);
  const [rStep, setRStep] = useState(-1);
  const [pipeStep, setPipeStep] = useState(-1);
  const [showRes, setShowRes] = useState(false);
  const [subTab, setSubTab] = useState("ingestion");
  const [converged, setConverged] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [pgStep, setPgStep] = useState(0);
  const timer = useRef(null);

  const runQuery = (q) => {
    setSelQ(q); setRStep(-1); setPipeStep(-1); setShowRes(false); setSubTab("ingestion");
    let s = 0; clearInterval(timer.current);
    timer.current = setInterval(() => {
      if (s < q.steps.length) {
        setRStep(s);
        setPipeStep(Math.floor(s * q.pipeline.stages.length / q.steps.length));
        s++;
      } else { setShowRes(true); setPipeStep(q.pipeline.stages.length - 1); clearInterval(timer.current); }
    }, 540);
  };

  const doConverge = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setConverged(true); setAnimating(false); }, 1200);
  };

  const TABS = [
    { id: "overview", label: "OVERVIEW" },
    { id: "router", label: "ROUTER" },
    { id: "architecture", label: "ARCHITECTURE" },
    { id: "postgresql", label: "🐘 POSTGRESQL" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.darkBlue, color: C.text, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Syne:wght@400;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0A1628}::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .btn{cursor:pointer;border:none;background:transparent;font-family:inherit;transition:all .2s}.btn:hover{opacity:.85}
        .qcard{transition:all .22s;cursor:pointer}.qcard:hover{transform:translateY(-3px)}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, background: `${C.surface}ee`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: C.oracleRed, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⚡</div>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff" }}>Oracle 26ai <span style={{ color: C.oracleRed }}>POC</span></div>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.12em" }}>CONVERGED DATABASE VISUALISER</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {TABS.map(t => (
            <button key={t.id} className="btn" onClick={() => setTab(t.id)} style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
              background: tab === t.id ? C.oracleRed : "transparent",
              color: tab === t.id ? "#fff" : C.textDim,
              border: `1px solid ${tab === t.id ? C.oracleRed : C.border}`,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>

        {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div style={{ animation: "slideIn .4s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                Three Ways to Query.<br /><span style={{ color: C.oracleRed }}>One Database.</span>
              </div>
              <div style={{ color: C.textDim, marginTop: 7, fontSize: 11, maxWidth: 560 }}>
                Oracle 26ai converges SQL, Vector Search, and Graph/Vectorless into a single engine — eliminating data silos and the "Vector Tax."
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
              {[["Systems Replaced", 3, "→ 1", C.oracleRed], ["Query Modes", 4, " types", C.cyan], ["ETL Pipelines", 0, " needed", C.green]].map(([l, v, s, col]) => (
                <div key={l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: col, fontFamily: "'Syne',sans-serif" }}><AnimatedCounter value={v} />{s}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
              {[
                { icon: "🗄️", title: "SQL — Logic Layer", color: C.cyan, tag: "DETERMINISTIC", pts: ["ACID transactions", "B-Tree indexes", "Math & aggregations", "100% precision"] },
                { icon: "🔮", title: "Vector — Semantic Layer", color: C.purple, tag: "APPROXIMATE", pts: ["Embedding pipeline required", "ANN (HNSW/IVF)", "Semantic similarity", "Unstructured data"] },
                { icon: "🕸️", title: "Graph — Reasoning Layer", color: C.green, tag: "STRUCTURAL", pts: ["Property graph build required", "PageIndex for docs", "Multi-hop relationships", "No chunking errors"] },
              ].map(p => (
                <div key={p.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, borderTop: `3px solid ${p.color}` }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 9 }}>
                    <span style={{ fontSize: 17 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{p.title}</div>
                      <div style={{ fontSize: 9, color: p.color, letterSpacing: "0.1em", marginTop: 1 }}>{p.tag}</div>
                    </div>
                  </div>
                  {p.pts.map(pt => (
                    <div key={pt} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: p.color, flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: 10, color: C.textDim }}>{pt}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.accent}55`, borderRadius: 10, padding: 16, borderLeft: `4px solid ${C.accent}`, marginBottom: 14 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 10 }}>⚙ When to use specialist tools explicitly</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  { tool: "Neo4j", icon: "🕸️", color: "#018BFF", when: "Billions of graph nodes, fraud networks, global supply chains — where graph-native storage and Cypher outperform Oracle's SQL Property Graphs." },
                  { tool: "pgvector", icon: "🐘", color: C.pg, when: "Already on PostgreSQL, purely semantic search, no graph or document reasoning needed — pgvector is a pragmatic starting point before full convergence." },
                  { tool: "PageIndex / Vectorless", icon: "📄", color: C.green, when: "Legal contracts, compliance docs, technical specs — where chunking errors are unacceptable and cited, structural references are required." },
                ].map(t => (
                  <div key={t.tool} style={{ background: "#070F1A", border: `1px solid ${t.color}44`, borderRadius: 7, padding: 10 }}>
                    <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>{t.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: t.color }}>{t.tool}</span>
                    </div>
                    <div style={{ fontSize: 9, color: C.textDim, lineHeight: 1.65 }}>{t.when}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, borderLeft: `4px solid ${C.oracleRed}` }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 10 }}>⚡ Oracle 26ai — Converged Capabilities</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                {[
                  ["Native VECTOR Type", "No extension — VECTOR column built in, DBMS_VECTOR for in-DB embedding"],
                  ["Select AI (NL2SQL)", "Plain English auto-routed to SQL / Vector / Graph"],
                  ["SQL Property Graphs", "Virtual graph over existing tables — zero data duplication"],
                  ["In-Database LLM Calls", "Call OCI GenAI or OpenAI via SQL functions"],
                  ["PageIndex / Vectorless", "Structural document navigation — no chunking, full citation"],
                  ["Unified Security", "One audit trail and policy engine across all modalities"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 7 }}>
                    <div style={{ color: C.oracleRed, flexShrink: 0 }}>▸</div>
                    <div><div style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>{title}</div><div style={{ fontSize: 9, color: C.textDim, marginTop: 1 }}>{desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ ROUTER ════════════════════════════════════════════════════════ */}
        {tab === "router" && (
          <div style={{ animation: "slideIn .4s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>Agentic Query Router</div>
              <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>
                Click a query to see the <span style={{ color: C.accent }}>full pipeline</span> — from data ingestion & backend setup → routing → query execution → output.
              </div>
            </div>

            {/* Query cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
              {QUERIES.map(q => (
                <div key={q.id} className="qcard" onClick={() => runQuery(q)} style={{
                  background: selQ?.id === q.id ? `${q.color}18` : C.card,
                  border: `1px solid ${selQ?.id === q.id ? q.color : C.border}`,
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{q.icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: q.color, background: `${q.color}22`, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.08em" }}>{q.type}</span>
                    {selQ?.id === q.id && <span style={{ marginLeft: "auto", fontSize: 9, color: q.color }}>● ACTIVE</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#fff", fontStyle: "italic" }}>"{q.label}"</div>
                  <div style={{ fontSize: 9, color: C.textDim, marginTop: 3 }}>→ {q.route}</div>
                </div>
              ))}
            </div>

            {selQ && (
              <div style={{ animation: "slideIn .3s ease" }}>
                {/* Pipeline flow — always visible when a query is selected */}
                <div style={{ marginBottom: 12 }}>
                  <PipelineFlow pipeline={selQ.pipeline} color={selQ.color} activeStage={pipeStep} />
                </div>

                {/* Sub-tabs */}
                <div style={{ display: "flex", gap: 5, marginBottom: 12, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                  {[
                    ["ingestion", "⚙ Ingestion / Backend Setup"],
                    ["schema", "📋 Schema"],
                    ["query", "⚡ Query & Result"],
                    ...(selQ.externalTool ? [["external", `${selQ.externalTool.icon} When to use ${selQ.externalTool.name}`]] : []),
                  ].map(([id, label]) => (
                    <button key={id} className="btn" onClick={() => setSubTab(id)} style={{
                      padding: "5px 10px", borderRadius: 5, fontSize: 10, fontWeight: 600,
                      background: subTab === id ? selQ.color : "transparent",
                      color: subTab === id ? "#fff" : C.textDim,
                      border: `1px solid ${subTab === id ? selQ.color : C.border}`,
                    }}>{label}</button>
                  ))}
                </div>

                {subTab === "ingestion" && <IngestionPanel ingestion={selQ.ingestion} />}
                {subTab === "schema" && <SchemaPanel schema={selQ.schema} />}

                {subTab === "query" && (
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
                    {/* Steps */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 9 }}>ROUTING STEPS</div>
                      {selQ.steps.map((step, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, opacity: rStep >= i ? 1 : 0.2, transition: "opacity .3s" }}>
                          <div style={{
                            width: 19, height: 19, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700, flexShrink: 0,
                            background: rStep > i ? selQ.color : rStep === i ? `${selQ.color}44` : C.border,
                            color: rStep >= i ? "#fff" : C.textDim,
                            border: `2px solid ${rStep >= i ? selQ.color : C.border}`,
                            animation: rStep === i ? "pulse .8s infinite" : "none",
                          }}>{rStep > i ? "✓" : i + 1}</div>
                          <span style={{ fontSize: 10, color: rStep >= i ? "#fff" : C.textDim }}>{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Query + result */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ background: "#070F1A", border: `1px solid ${C.border}`, borderRadius: 9, padding: 12, flex: 1 }}>
                        <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.12em", marginBottom: 6 }}>GENERATED QUERY</div>
                        <pre style={{ fontSize: 11, color: selQ.color, lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "'JetBrains Mono',monospace" }}>{selQ.query}</pre>
                      </div>
                      {showRes && (
                        <div style={{ background: `${selQ.color}12`, border: `1px solid ${selQ.color}55`, borderRadius: 9, padding: 12, animation: "slideIn .4s ease" }}>
                          <div style={{ fontSize: 9, color: selQ.color, letterSpacing: "0.12em", marginBottom: 6 }}>RESULT</div>
                          <pre style={{ fontSize: 11, color: "#fff", lineHeight: 1.8, whiteSpace: "pre-wrap" }}><TypewriterText text={selQ.result} /></pre>
                          <div style={{ marginTop: 8, padding: "6px 9px", background: "#00000040", borderRadius: 5, fontSize: 10, color: C.textDim, lineHeight: 1.6 }}>💡 {selQ.explanation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {subTab === "external" && selQ.externalTool && <ExternalToolPanel tool={selQ.externalTool} />}
              </div>
            )}
          </div>
        )}

        {/* ══ ARCHITECTURE ══════════════════════════════════════════════════ */}
        {tab === "architecture" && (
          <div style={{ animation: "slideIn .4s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>Architecture Transformation</div>
              <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>Fragmented multi-system stack → Oracle 26ai converged. Click CONVERGE.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "start", marginBottom: 20 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 9, color: C.oracleRed, letterSpacing: "0.14em", marginBottom: 12, fontWeight: 700 }}>BEFORE — Fragmented</div>
                {[
                  { label: "PostgreSQL", icon: "🐘", color: C.pg, desc: "Relational / SQL" },
                  { label: "pgvector / Pinecone", icon: "🔮", color: C.purple, desc: "Vector Store" },
                  { label: "Neo4j / Apache AGE", icon: "🕸️", color: "#018BFF", desc: "Graph Database" },
                ].map((node, i) => (
                  <div key={node.label} style={{ background: "#070F1A", border: `1px solid ${node.color}55`, borderRadius: 7, padding: "8px 11px", marginBottom: 7, display: "flex", alignItems: "center", gap: 8, animation: "float 3s ease-in-out infinite", animationDelay: `${i * 0.5}s` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 5, background: `${node.color}22`, border: `1px solid ${node.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{node.icon}</div>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{node.label}</div><div style={{ fontSize: 9, color: C.textDim }}>{node.desc}</div></div>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: "8px 10px", background: `${C.oracleRed}12`, borderRadius: 7, border: `1px dashed ${C.oracleRed}44` }}>
                  <div style={{ fontSize: 9, color: C.oracleRed, fontWeight: 700, marginBottom: 5 }}>⚠ The Vector Tax</div>
                  {["ETL between all 3 systems", "Embedding sync & drift", "3× security overhead", "Hybrid queries in app code", "3× licensing cost"].map(t => (
                    <div key={t} style={{ fontSize: 9, color: C.textDim, marginBottom: 2 }}>✗ {t}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 60 }}>
                <button onClick={doConverge} className="btn" style={{
                  background: converged ? C.green : C.oracleRed, borderRadius: 8, padding: "10px 12px",
                  color: "#fff", fontWeight: 700, fontSize: 10, letterSpacing: "0.06em",
                  boxShadow: `0 0 16px ${converged ? C.green : C.oracleRed}55`,
                  animation: animating ? "spin .8s linear infinite" : "none", transition: "all .4s",
                }}>{animating ? "⚙" : converged ? "✓ DONE" : "CONVERGE →"}</button>
                <div style={{ fontSize: 9, color: C.textDim, textAlign: "center", maxWidth: 60 }}>Click to transform</div>
              </div>
              <div style={{ background: converged ? `${C.midBlue}44` : C.card, border: `1px solid ${converged ? C.cyan : C.border}`, borderRadius: 12, padding: 16, transition: "all .8s", boxShadow: converged ? `0 0 22px ${C.cyan}22` : "none" }}>
                <div style={{ fontSize: 9, color: converged ? C.cyan : C.textDim, letterSpacing: "0.14em", marginBottom: 12, fontWeight: 700 }}>AFTER — Oracle 26ai</div>
                <div style={{ background: converged ? `${C.oracleRed}22` : "#070F1A", border: `2px solid ${converged ? C.oracleRed : C.border}`, borderRadius: 10, padding: "14px 14px", textAlign: "center", transition: "all .8s", boxShadow: converged ? `0 0 14px ${C.oracleRed}44` : "none", marginBottom: 10 }}>
                  <div style={{ fontSize: 24, marginBottom: 3 }}>⚡</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: converged ? "#fff" : C.textDim }}>Oracle 26ai</div>
                  <div style={{ fontSize: 9, color: converged ? C.oracleRed : C.textDim, marginTop: 2, letterSpacing: "0.1em" }}>CONVERGED ENGINE</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 9, flexWrap: "wrap" }}>
                    {[["SQL", C.cyan], ["Vector", C.purple], ["Graph", C.green], ["LLM", C.accent]].map(([l, col]) => (
                      <div key={l} style={{ padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: converged ? `${col}33` : `${col}11`, border: `1px solid ${converged ? col : C.border}`, color: converged ? col : C.textDim, transition: "all .6s" }}>{l}</div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "8px 10px", background: converged ? `${C.green}15` : "#070F1A", borderRadius: 7, border: `1px solid ${converged ? C.green + "55" : C.border}`, transition: "all .8s" }}>
                  <div style={{ fontSize: 9, color: converged ? C.green : C.textDim, fontWeight: 700, marginBottom: 4 }}>{converged ? "✓ Benefits" : "Benefits (pending)"}</div>
                  {["Zero ETL pipelines", "Atomic hybrid queries", "Single security policy", "Embeddings updated atomically", "LLM inside DB boundary"].map(t => (
                    <div key={t} style={{ fontSize: 9, color: converged ? C.text : C.textDim, marginBottom: 2, transition: "all .6s" }}>{converged ? "✓" : "○"} {t}</div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 9, color: C.textDim, letterSpacing: "0.1em" }}>DECISION MATRIX</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr style={{ background: "#070F1A" }}>
                    {["Requirement", "SQL", "Vector", "Graph/Vectorless", "Specialist Tool"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.textDim, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Math / Aggregation", "✔", "✗", "✗", "—"],
                    ["Semantic Search", "✗", "✔", "✓", "pgvector if Postgres-first"],
                    ["Multi-hop Graph", "✗", "✗", "✔", "Neo4j for massive graphs"],
                    ["Doc Structural Accuracy", "✗", "△ Chunking", "✔ PageIndex", "—"],
                    ["Transactional Integrity", "✔", "✗", "✗", "—"],
                    ["Hybrid (all 3)", "—", "—", "—", "✔ Oracle 26ai only"],
                  ].map(([req, sql, vec, grph, spec], ri) => (
                    <tr key={req} style={{ background: ri % 2 === 0 ? "transparent" : "#070F1A80" }}>
                      <td style={{ padding: "7px 12px", color: "#fff", fontWeight: 600 }}>{req}</td>
                      {[sql, vec, grph].map((val, ci) => (
                        <td key={ci} style={{ padding: "7px 12px", color: val.startsWith("✔") ? C.green : val.startsWith("✗") ? C.oracleRed : C.accent }}>{val}</td>
                      ))}
                      <td style={{ padding: "7px 12px", color: spec === "—" ? C.textDim : C.accent, fontSize: 9 }}>{spec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ POSTGRESQL ════════════════════════════════════════════════════ */}
        {tab === "postgresql" && (
          <div style={{ animation: "slideIn .4s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>🐘 PostgreSQL → Oracle 26ai Journey</div>
              <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>How teams bolt on capabilities phase by phase — and ultimately converge.</div>
            </div>
            <div style={{ display: "flex", gap: 0, marginBottom: 16, borderRadius: 9, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {PG_STEPS.map((s, i) => (
                <button key={s.id} className="btn" onClick={() => setPgStep(i)} style={{
                  flex: 1, padding: "10px 5px", textAlign: "center",
                  background: pgStep === i ? `${s.color}22` : "#070F1A",
                  borderRight: i < PG_STEPS.length - 1 ? `1px solid ${C.border}` : "none",
                  borderBottom: pgStep === i ? `3px solid ${s.color}` : "3px solid transparent",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: pgStep === i ? s.color : C.textDim, letterSpacing: "0.07em" }}>{s.phase}</div>
                  <div style={{ fontSize: 9, color: pgStep === i ? "#fff" : C.textDim, marginTop: 1, lineHeight: 1.3 }}>{s.label}</div>
                </button>
              ))}
            </div>
            {(() => {
              const s = PG_STEPS[pgStep];
              return (
                <div style={{ animation: "fadeIn .3s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ background: C.card, border: `1px solid ${s.color}55`, borderRadius: 10, padding: 14, borderLeft: `4px solid ${s.color}` }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>{s.icon}</span>
                          <div>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: "#fff" }}>{s.label}</div>
                            <div style={{ fontSize: 9, color: s.color, letterSpacing: "0.1em" }}>{s.phase}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>{s.desc}</div>
                      </div>
                      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: 12 }}>
                        <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 7 }}>TECH STACK</div>
                        {s.stack.map(t => (
                          <div key={t} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                            <span style={{ color: s.color }}>▸</span>
                            <span style={{ fontSize: 10, color: C.text }}>{t}</span>
                          </div>
                        ))}
                      </div>
                      {s.limitations.length > 0 ? (
                        <div style={{ background: `${C.oracleRed}10`, border: `1px solid ${C.oracleRed}44`, borderRadius: 9, padding: 12 }}>
                          <div style={{ fontSize: 9, color: C.oracleRed, letterSpacing: "0.1em", marginBottom: 6, fontWeight: 700 }}>⚠ LIMITATIONS</div>
                          {s.limitations.map(l => (
                            <div key={l} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                              <span style={{ color: C.oracleRed }}>✗</span>
                              <span style={{ fontSize: 10, color: C.textDim }}>{l}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: `${C.green}10`, border: `1px solid ${C.green}44`, borderRadius: 9, padding: 12 }}>
                          <div style={{ fontSize: 9, color: C.green, letterSpacing: "0.1em", marginBottom: 6, fontWeight: 700 }}>✓ ALL LIMITATIONS RESOLVED</div>
                          {["No ETL sync needed", "No embedding drift", "Single security policy", "Native hybrid queries", "In-DB LLM integration"].map(l => (
                            <div key={l} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                              <span style={{ color: C.green }}>✓</span>
                              <span style={{ fontSize: 10, color: C.text }}>{l}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ background: "#070F1A", border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.12em", marginBottom: 8 }}>SCHEMA / DDL AT THIS PHASE</div>
                      <pre style={{ fontSize: 11, color: s.color, lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "'JetBrains Mono',monospace", overflowX: "auto" }}>{s.schema}</pre>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {pgStep > 0 && <button className="btn" onClick={() => setPgStep(p => p - 1)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 12px", color: C.textDim, fontSize: 10 }}>← Previous</button>}
                    {pgStep < PG_STEPS.length - 1 && (
                      <button className="btn" onClick={() => setPgStep(p => p + 1)} style={{ background: PG_STEPS[pgStep + 1].color, borderRadius: 7, padding: "6px 12px", color: "#fff", fontWeight: 700, fontSize: 10 }}>
                        Next: {PG_STEPS[pgStep + 1].phase} →
                      </button>
                    )}
                    {pgStep === PG_STEPS.length - 1 && (
                      <div style={{ padding: "6px 12px", background: `${C.green}22`, border: `1px solid ${C.green}55`, borderRadius: 7, fontSize: 10, color: C.green, fontWeight: 700 }}>🎉 Fully Converged with Oracle 26ai</div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}