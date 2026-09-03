# CASELINK Backend — Architecture Skeleton

This is the backend architecture skeleton for **CASELINK**, an AI-assisted investigation intelligence platform prototype built with Python and FastAPI, designed according to `Backend Instructions.txt`.

---

## 🏛️ Directory Structure

```
caselink-backend/
├── requirements.txt         # Core dependencies (FastAPI, SQLAlchemy, NetworkX, spaCy, etc.)
├── .env.example             # Environment configuration variables template
├── app/
│   ├── main.py              # Application entrypoint & FastAPI router configuration
│   ├── core/
│   │   ├── config.py        # Pydantic BaseSettings configuration
│   │   └── security.py      # JWT authentication and password hashing skeleton
│   ├── database/
│   │   ├── base.py          # SQLAlchemy Declarative Base & model imports
│   │   └── session.py       # Engine and SessionLocal factory
│   ├── models/
│   │   ├── case.py          # Case database model & Pydantic schemas
│   │   ├── entity.py        # Multimodal Entity model & schemas (Person, Vehicle, Location, etc.)
│   │   ├── evidence.py      # Investigation Evidence model & schemas
│   │   ├── relationship.py  # Graph Relationship model & schemas
│   │   └── hypothesis.py    # Competing Hypotheses & scoring models
│   ├── services/
│   │   ├── entity_extraction.py    # NLP extraction pipeline skeleton (spaCy / transformers)
│   │   ├── entity_resolution.py    # Deduplication & similarity matching skeleton
│   │   ├── graph_builder.py        # NetworkX / Neo4j knowledge graph constructor
│   │   ├── relationship_analysis.py# Geospatial & hidden connection discovery
│   │   ├── hypothesis_engine.py    # Analysis of Competing Hypotheses (ACH) generator
│   │   └── evidence_ranker.py      # Explainable lead ranking algorithm
│   ├── api/
│   │   ├── auth.py          # /auth endpoints (login, token verification)
│   │   ├── cases.py         # /cases endpoints (case ingestion, listing, inspection)
│   │   ├── entities.py      # /entities endpoints (extraction, resolution)
│   │   ├── graph.py         # /graph endpoints (React Flow compatible graph payload)
│   │   ├── timeline.py      # /timeline endpoints (temporal reconstruction)
│   │   ├── hypotheses.py    # /hypotheses endpoints (competing hypothesis matrix)
│   │   └── reports.py       # /reports endpoints (dossier export)
│   └── mock_data/
│       └── seed_data.py     # Synthetic investigation test cases & graph nodes
```

---

## 🚀 Setup & Execution (When Coding is Initiated)

```bash
# 1. Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start development server
uvicorn app.main:app --reload --port 8000
```

Interactive API documentation will be available at:
* Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`
