"""
Relationship & Geospatial Analysis Service
Calculates spatial compatibility, trajectory overlap, and hidden network link discovery.
"""
import math
from typing import Dict, Any, Tuple, List, Optional


class RelationshipAnalysisService:
    """Performs spatial, temporal, and pathfinding analytics across the investigation graph."""

    EARTH_RADIUS_KM = 6371.0  # Mean radius of Earth

    # ─── Haversine Distance ────────────────────────────────────────────────────

    def calculate_distance(
        self, coord_a: Tuple[float, float], coord_b: Tuple[float, float]
    ) -> float:
        """
        Calculate Haversine geodesic distance in kilometers between two GPS coordinates.
        Args:
            coord_a: (latitude, longitude) in decimal degrees
            coord_b: (latitude, longitude) in decimal degrees
        Returns:
            Distance in kilometers (float).
        """
        lat1, lon1 = math.radians(coord_a[0]), math.radians(coord_a[1])
        lat2, lon2 = math.radians(coord_b[0]), math.radians(coord_b[1])

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return round(self.EARTH_RADIUS_KM * c, 2)

    # ─── Movement Feasibility ─────────────────────────────────────────────────

    def evaluate_movement_compatibility(
        self,
        origin_coord: Tuple[float, float],
        dest_coord: Tuple[float, float],
        time_delta_hours: float,
        speed_threshold_kmh: float = 120.0,
        mode: str = "road",
    ) -> Dict[str, Any]:
        """
        Evaluate whether travel between two locations within the given time is physically feasible.

        Args:
            origin_coord: (lat, lng) of departure
            dest_coord:   (lat, lng) of arrival
            time_delta_hours: Time available for travel
            speed_threshold_kmh: Max sustained road speed (default 120 km/h)
            mode: 'road' | 'air' — adjusts speed ceiling

        Returns:
            dict with distance_km, required_speed_kmh, compatibility_score, is_plausible, assessment
        """
        if mode == "air":
            speed_threshold_kmh = 900.0  # Commercial aircraft

        distance_km = self.calculate_distance(origin_coord, dest_coord)

        if time_delta_hours <= 0:
            return {
                "distance_km": distance_km,
                "required_speed_kmh": None,
                "compatibility_score": 0.0,
                "is_plausible": False,
                "assessment": "Zero or negative time window — movement impossible.",
            }

        required_speed = distance_km / time_delta_hours

        if required_speed <= speed_threshold_kmh * 0.50:
            score = 0.95
            assessment = f"Easily feasible — {distance_km:.1f} km in {time_delta_hours:.1f}h requires only {required_speed:.0f} km/h."
            plausible = True
        elif required_speed <= speed_threshold_kmh * 0.80:
            score = 0.80
            assessment = f"Feasible — {distance_km:.1f} km in {time_delta_hours:.1f}h ({required_speed:.0f} km/h), within normal driving range."
            plausible = True
        elif required_speed <= speed_threshold_kmh:
            score = 0.60
            assessment = f"Marginally feasible — {required_speed:.0f} km/h required; near speed limit. Unlikely with traffic."
            plausible = True
        elif required_speed <= speed_threshold_kmh * 1.5:
            score = 0.25
            assessment = f"Unlikely — {required_speed:.0f} km/h needed exceeds road speed limits. Only possible by air."
            plausible = False
        else:
            score = 0.05
            assessment = f"Implausible — {required_speed:.0f} km/h is physically impossible. Alibi appears credible."
            plausible = False

        return {
            "distance_km": distance_km,
            "required_speed_kmh": round(required_speed, 1),
            "speed_threshold_kmh": speed_threshold_kmh,
            "compatibility_score": score,
            "is_plausible": plausible,
            "assessment": assessment,
            "mode": mode,
        }

    # ─── Location Overlap ─────────────────────────────────────────────────────

    def calculate_location_overlap(
        self,
        locations_a: List[Tuple[float, float]],
        locations_b: List[Tuple[float, float]],
        radius_km: float = 5.0,
    ) -> Dict[str, Any]:
        """
        Evaluate whether two entities' location sets overlap within a proximity radius.
        Returns overlap count, representative pairs, and an overlap score.
        """
        overlapping_pairs = []
        for i, la in enumerate(locations_a):
            for j, lb in enumerate(locations_b):
                dist = self.calculate_distance(la, lb)
                if dist <= radius_km:
                    overlapping_pairs.append({
                        "location_a_index": i,
                        "location_b_index": j,
                        "distance_km": dist,
                    })

        total_pairs = len(locations_a) * len(locations_b)
        overlap_score = len(overlapping_pairs) / total_pairs if total_pairs > 0 else 0.0

        return {
            "overlap_count": len(overlapping_pairs),
            "total_pairs_checked": total_pairs,
            "overlap_score": round(overlap_score, 4),
            "radius_km": radius_km,
            "overlapping_pairs": overlapping_pairs[:5],  # Return first 5 for brevity
        }

    # ─── Indirect Connections ─────────────────────────────────────────────────

    def find_indirect_connections(
        self,
        entity_a_id: str,
        entity_b_id: str,
        max_depth: int = 3,
    ) -> List[List[str]]:
        """
        Find multi-hop link paths connecting two seemingly unrelated entities.
        Delegates to GraphBuilderService's NetworkX graph.
        """
        from app.services.graph_builder import graph_builder_service
        return graph_builder_service.find_shortest_paths(entity_a_id, entity_b_id, max_depth)

    def format_path_explanation(self, path: List[str]) -> str:
        """Convert a raw entity ID path to a human-readable connection explanation."""
        from app.services.graph_builder import graph_builder_service
        labels = []
        for node_id in path:
            if graph_builder_service.graph.has_node(node_id):
                label = graph_builder_service.graph.nodes[node_id].get("label", node_id)
            else:
                label = node_id
            labels.append(label)
        return " → ".join(labels)


relationship_analysis_service = RelationshipAnalysisService()
