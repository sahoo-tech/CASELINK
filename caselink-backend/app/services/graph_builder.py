"""
Knowledge Graph Construction Engine
Builds graph structures using NetworkX and formats output for React Flow / Cytoscape.
"""
import math
import random
from typing import Dict, Any, List, Optional, Tuple

import networkx as nx


# ─── Node visual style mapping ────────────────────────────────────────────────
NODE_STYLES = {
    "Person":       {"color": "#3b82f6", "shape": "circle",    "icon": "user"},
    "Vehicle":      {"color": "#f59e0b", "shape": "rectangle", "icon": "car"},
    "Location":     {"color": "#10b981", "shape": "diamond",   "icon": "map-pin"},
    "Organization": {"color": "#8b5cf6", "shape": "rectangle", "icon": "building"},
    "Event":        {"color": "#ef4444", "shape": "hexagon",   "icon": "zap"},
    "Document":     {"color": "#6b7280", "shape": "rectangle", "icon": "file"},
    "Contact":      {"color": "#06b6d4", "shape": "circle",    "icon": "phone"},
    "FinancialAmount": {"color": "#84cc16", "shape": "circle", "icon": "dollar"},
}

# ─── Edge color mapping ───────────────────────────────────────────────────────
EDGE_COLORS = {
    "OWNS":               "#f59e0b",
    "CONTROLS":           "#ef4444",
    "SEEN_AT":            "#10b981",
    "TRAVELLED_TO":       "#3b82f6",
    "COMMUNICATED_WITH":  "#8b5cf6",
    "TRANSACTION_LINK":   "#84cc16",
    "HAWALA_LINK":        "#f97316",
    "ARMS_LINK":          "#dc2626",
    "ASSOCIATE_OF":       "#6b7280",
    "WORKS_FOR":          "#06b6d4",
    "RELATED_CASE":       "#ec4899",
    "SAME_VEHICLE":       "#f59e0b",
    "FINANCIAL_LINK":     "#84cc16",
    "DIRECTOR_OF":        "#8b5cf6",
    "CROSS_CASE":         "#ec4899",
}
DEFAULT_EDGE_COLOR = "#94a3b8"


def _spring_positions(graph: nx.MultiDiGraph, nodes: List[str]) -> Dict[str, Tuple[float, float]]:
    """Generate spring-layout positions for React Flow (scaled to viewport)."""
    if len(nodes) == 0:
        return {}
    subgraph = graph.subgraph(nodes)
    try:
        pos = nx.spring_layout(subgraph, seed=42, k=200 / max(len(nodes), 1))
    except Exception:
        # Fallback: circle layout
        pos = nx.circular_layout(subgraph)

    # Scale to React Flow canvas (~1200 x 800 viewport)
    scaled = {}
    for node_id, (x, y) in pos.items():
        scaled[node_id] = (float(x) * 500 + 600, float(y) * 300 + 400)
    return scaled


class GraphBuilderService:
    """Constructs multi-relational investigation graphs from cases, entities, and evidence."""

    def __init__(self):
        # One global in-memory graph; keyed nodes carry case_id metadata
        self.graph = nx.MultiDiGraph()

    def add_entity_node(
        self,
        entity_id: str,
        name: str,
        entity_type: str,
        case_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Add a typed node to the knowledge graph with visual metadata."""
        style = NODE_STYLES.get(entity_type, {"color": "#94a3b8", "shape": "circle", "icon": "help-circle"})
        self.graph.add_node(
            entity_id,
            label=name,
            entity_type=entity_type,
            case_id=case_id,
            color=style["color"],
            shape=style["shape"],
            icon=style["icon"],
            metadata=metadata or {},
        )

    def add_relationship_edge(
        self,
        source_id: str,
        target_id: str,
        relation_type: str,
        confidence: float = 1.0,
        evidence_ref: Optional[str] = None,
        case_id: Optional[str] = None,
    ) -> None:
        """Add a directional relationship edge between entities."""
        color = EDGE_COLORS.get(relation_type, DEFAULT_EDGE_COLOR)
        self.graph.add_edge(
            source_id,
            target_id,
            relation_type=relation_type,
            confidence=confidence,
            evidence_ref=evidence_ref,
            case_id=case_id,
            color=color,
        )

    def load_mock_data(self) -> None:
        """Populate the graph from mock seed data on application startup."""
        from app.mock_data.seed_data import get_mock_entities, get_mock_relationships

        entities = get_mock_entities()
        relationships = get_mock_relationships()

        for entity in entities:
            self.add_entity_node(
                entity_id=entity["id"],
                name=entity["name"],
                entity_type=entity["type"],
                case_id=entity.get("case_id"),
                metadata=entity.get("extra_metadata"),
            )

        for rel in relationships:
            self.add_relationship_edge(
                source_id=rel["source_entity"],
                target_id=rel["target_entity"],
                relation_type=rel["relationship_type"],
                confidence=rel.get("confidence", 1.0),
                evidence_ref=rel.get("evidence_reference"),
                case_id=rel.get("case_id"),
            )

    def get_case_subgraph(self, case_id: str) -> Dict[str, Any]:
        """
        Export subgraph for a specific case in React Flow format.
        Returns: {"nodes": [...], "edges": [...]}
        """
        # Gather node IDs for this case (include cross-case linked nodes)
        case_node_ids = {
            n for n, data in self.graph.nodes(data=True)
            if data.get("case_id") == case_id
        }

        # Also include nodes reachable within 1 hop from case nodes (cross-case expansion)
        expanded_ids = set(case_node_ids)
        for n in case_node_ids:
            expanded_ids.update(self.graph.predecessors(n))
            expanded_ids.update(self.graph.successors(n))

        # Compute layout positions
        node_list = list(expanded_ids)
        positions = _spring_positions(self.graph, node_list)

        # Build React Flow nodes
        rf_nodes = []
        for node_id in node_list:
            if not self.graph.has_node(node_id):
                continue
            data = self.graph.nodes[node_id]
            pos = positions.get(node_id, (random.uniform(100, 900), random.uniform(100, 600)))
            rf_nodes.append({
                "id": node_id,
                "type": f"{data.get('entity_type', 'Unknown').lower()}Node",
                "position": {"x": round(pos[0], 1), "y": round(pos[1], 1)},
                "data": {
                    "label": data.get("label", node_id),
                    "entityType": data.get("entity_type", "Unknown"),
                    "caseId": data.get("case_id"),
                    "color": data.get("color", "#94a3b8"),
                    "icon": data.get("icon", "help-circle"),
                    "metadata": data.get("metadata", {}),
                    "isCrossCase": data.get("case_id") != case_id,
                },
            })

        # Build React Flow edges (only edges where both endpoints are in subgraph)
        rf_edges = []
        edge_ids_seen = set()
        for source, target, edge_data in self.graph.edges(data=True):
            if source not in expanded_ids or target not in expanded_ids:
                continue
            edge_key = f"{source}-{edge_data.get('relation_type', 'RELATED')}-{target}"
            if edge_key in edge_ids_seen:
                continue
            edge_ids_seen.add(edge_key)
            is_cross = (
                self.graph.nodes[source].get("case_id") != case_id
                or self.graph.nodes[target].get("case_id") != case_id
            )
            rf_edges.append({
                "id": f"e-{source}-{target}-{edge_data.get('relation_type', 'RELATED')}",
                "source": source,
                "target": target,
                "label": edge_data.get("relation_type", "RELATED"),
                "type": "smoothstep",
                "animated": is_cross,   # Animate cross-case edges to highlight them
                "style": {
                    "stroke": edge_data.get("color", DEFAULT_EDGE_COLOR),
                    "strokeWidth": 2 if not is_cross else 3,
                    "strokeDasharray": "5,5" if is_cross else None,
                },
                "data": {
                    "confidence": edge_data.get("confidence", 1.0),
                    "evidenceRef": edge_data.get("evidence_ref"),
                    "isCrossCase": is_cross,
                    "caseId": edge_data.get("case_id"),
                },
            })

        # Graph statistics
        stats = {
            "total_nodes": len(rf_nodes),
            "total_edges": len(rf_edges),
            "cross_case_nodes": sum(1 for n in rf_nodes if n["data"].get("isCrossCase")),
            "cross_case_edges": sum(1 for e in rf_edges if e["data"].get("isCrossCase")),
            "entity_type_counts": {},
        }
        for n in rf_nodes:
            et = n["data"]["entityType"]
            stats["entity_type_counts"][et] = stats["entity_type_counts"].get(et, 0) + 1

        return {"nodes": rf_nodes, "edges": rf_edges, "stats": stats}

    def add_manual_link(
        self,
        source_id: str,
        target_id: str,
        relation_type: str,
        case_id: str,
    ) -> Dict[str, Any]:
        """Allow investigator to manually assert an evidentiary relationship."""
        self.add_relationship_edge(
            source_id=source_id,
            target_id=target_id,
            relation_type=relation_type,
            confidence=1.0,  # Manual links are full confidence (investigator-asserted)
            case_id=case_id,
        )
        return {
            "status": "added",
            "edge": {
                "source": source_id,
                "target": target_id,
                "relation_type": relation_type,
                "manually_asserted": True,
            },
        }

    def find_shortest_paths(self, source_id: str, target_id: str, max_depth: int = 4) -> List[List[str]]:
        """Find multi-hop paths between two entities (indirect connection discovery)."""
        try:
            paths = list(nx.all_simple_paths(
                self.graph.to_undirected(),
                source=source_id,
                target=target_id,
                cutoff=max_depth,
            ))
            return paths[:10]  # Return up to 10 paths
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []


# Singleton instance — loaded with mock data at startup
graph_builder_service = GraphBuilderService()
