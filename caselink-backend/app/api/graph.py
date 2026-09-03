"""
Knowledge Graph Query Endpoints
Returns React Flow / Cytoscape compatible JSON payloads: {"nodes": [...], "edges": [...]}
"""
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.api.auth import get_current_user
from app.services.graph_builder import graph_builder_service
from app.services.relationship_analysis import relationship_analysis_service
from app.mock_data.seed_data import get_mock_cases

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])


class ManualLinkRequest(BaseModel):
    source_entity_id: str
    target_entity_id: str
    relation_type: str
    confidence: float = 1.0
    notes: Optional[str] = None


class IndirectConnectionQuery(BaseModel):
    entity_a_id: str
    entity_b_id: str
    max_depth: int = 3


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/{case_id}", response_model=Dict[str, Any])
async def get_case_graph(
    case_id: str,
    include_cross_case: bool = Query(True, description="Include cross-case linked nodes"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    4. KNOWLEDGE GRAPH ENGINE API
    Return multi-relational nodes and edges for the given case.
    Compatible with React Flow:
    {
      "nodes": [{"id": "e-001", "type": "personNode", "position": {...}, "data": {...}}],
      "edges": [{"id": "e-e-001-e-016-OWNS", "source": "e-001", "target": "e-016", "label": "OWNS"}]
    }
    Cross-case links are animated (dashed stroke) to visually highlight hidden connections.
    """
    # Verify case exists
    cases = get_mock_cases()
    if not any(c["id"] == case_id for c in cases):
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    graph_data = graph_builder_service.get_case_subgraph(case_id)

    if not include_cross_case:
        # Filter to only this case's nodes
        case_nodes = {n["id"] for n in graph_data["nodes"] if not n["data"].get("isCrossCase")}
        graph_data["nodes"] = [n for n in graph_data["nodes"] if n["id"] in case_nodes]
        graph_data["edges"] = [
            e for e in graph_data["edges"]
            if e["source"] in case_nodes and e["target"] in case_nodes
        ]

    return {
        **graph_data,
        "case_id": case_id,
        "format": "react-flow",
        "legend": {
            "node_types": {
                "personNode": "👤 Person — Blue",
                "vehicleNode": "🚗 Vehicle — Amber",
                "locationNode": "📍 Location — Green",
                "organizationNode": "🏢 Organization — Purple",
                "eventNode": "⚡ Event — Red",
                "documentNode": "📄 Document — Gray",
            },
            "edge_styles": {
                "solid": "Same-case relationship",
                "dashed+animated": "Cross-case link — high significance",
            },
        },
    }


@router.post("/{case_id}/link", response_model=Dict[str, Any])
async def add_manual_link(
    case_id: str,
    link: ManualLinkRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Allow an investigator to manually assert an evidentiary relationship between entities.
    Manual links are confidence=1.0 and marked as investigator-asserted in audit trail.
    """
    if link.source_entity_id == link.target_entity_id:
        raise HTTPException(status_code=422, detail="Source and target entities must be different.")

    if not graph_builder_service.graph.has_node(link.source_entity_id):
        raise HTTPException(status_code=404, detail=f"Source entity '{link.source_entity_id}' not found in graph.")
    if not graph_builder_service.graph.has_node(link.target_entity_id):
        raise HTTPException(status_code=404, detail=f"Target entity '{link.target_entity_id}' not found in graph.")

    result = graph_builder_service.add_manual_link(
        source_id=link.source_entity_id,
        target_id=link.target_entity_id,
        relation_type=link.relation_type.upper(),
        case_id=case_id,
    )

    return {
        **result,
        "asserted_by": current_user.get("sub"),
        "notes": link.notes,
        "message": "Manual investigative link added to graph. This relationship requires corroborating evidence.",
    }


@router.post("/{case_id}/indirect-connections", response_model=Dict[str, Any])
async def find_indirect_connections(
    case_id: str,
    query: IndirectConnectionQuery,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Find multi-hop indirect connection paths between two seemingly unrelated entities.
    This surfaces hidden criminal network links that would not be apparent from direct analysis.
    """
    if query.max_depth > 6:
        raise HTTPException(status_code=422, detail="max_depth cannot exceed 6 to prevent excessive computation.")

    paths = relationship_analysis_service.find_indirect_connections(
        entity_a_id=query.entity_a_id,
        entity_b_id=query.entity_b_id,
        max_depth=query.max_depth,
    )

    formatted_paths = []
    for path in paths:
        formatted_paths.append({
            "path": path,
            "path_length": len(path) - 1,
            "explanation": relationship_analysis_service.format_path_explanation(path),
        })

    return {
        "entity_a_id": query.entity_a_id,
        "entity_b_id": query.entity_b_id,
        "max_depth": query.max_depth,
        "paths_found": len(formatted_paths),
        "paths": formatted_paths,
        "significance": "HIGH" if formatted_paths else "NONE",
        "summary": (
            f"Found {len(formatted_paths)} connection path(s) between entities within {query.max_depth} hops."
            if formatted_paths
            else "No connection paths found within the specified depth. Entities appear unrelated at this depth."
        ),
    }


@router.get("/{case_id}/stats", response_model=Dict[str, Any])
async def get_graph_statistics(
    case_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Return graph statistics: node/edge counts, entity type distribution, centrality scores."""
    from app.mock_data.seed_data import get_mock_entities, get_mock_relationships
    import networkx as nx

    entities = get_mock_entities(case_id)
    relationships = get_mock_relationships(case_id)

    if not entities:
        raise HTTPException(status_code=404, detail=f"No graph data for case '{case_id}'.")

    # Build sub-graph for statistics
    G = nx.DiGraph()
    for e in entities:
        G.add_node(e["id"], label=e["name"], etype=e["type"])
    for r in relationships:
        G.add_edge(r["source_entity"], r["target_entity"], rel=r["relationship_type"])

    # Centrality measures (top 5 most connected nodes)
    try:
        degree_centrality = nx.degree_centrality(G)
        top_nodes = sorted(degree_centrality.items(), key=lambda x: x[1], reverse=True)[:5]
        top_nodes_labeled = [
            {
                "entity_id": nid,
                "name": G.nodes[nid].get("label", nid) if G.has_node(nid) else nid,
                "type": G.nodes[nid].get("etype", "Unknown") if G.has_node(nid) else "Unknown",
                "centrality_score": round(score, 4),
            }
            for nid, score in top_nodes
        ]
    except Exception:
        top_nodes_labeled = []

    entity_type_counts = {}
    for e in entities:
        entity_type_counts[e["type"]] = entity_type_counts.get(e["type"], 0) + 1

    return {
        "case_id": case_id,
        "node_count": len(entities),
        "edge_count": len(relationships),
        "entity_type_distribution": entity_type_counts,
        "most_connected_entities": top_nodes_labeled,
        "graph_density": round(nx.density(G), 4),
        "is_connected": nx.is_weakly_connected(G) if G.number_of_nodes() > 0 else False,
    }
