"""
Synthetic Investigation Seed Data
Generates 10 cases, 100+ nodes, and 200+ relationships for prototype demonstration.
All data is purely fictional and created for the SIH prototype.
"""
from typing import List, Dict, Any
from datetime import datetime

# ─── MOCK OFFICER ACCOUNTS ───────────────────────────────────────────────────
# Passwords are bcrypt hashes of "caselink123"
MOCK_OFFICERS = [
    {
        "id": "user-001",
        "official_id": "INV001",
        "full_name": "ACP Vikram Sharma",
        "role": "Investigator",
        "department": "CBI",
        # bcrypt hash of "caselink123"
        "hashed_password": "$2b$12$5utDG1m5bvIXxWgU5GsRf.z74rqwxbL/VlMDstcJYFK/56sYxvzhO",
        "is_active": True,
    },
    {
        "id": "user-002",
        "official_id": "ANL001",
        "full_name": "Analyst Priya Menon",
        "role": "Analyst",
        "department": "IB",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "is_active": True,
    },
    {
        "id": "user-003",
        "official_id": "ADM001",
        "full_name": "Director Rajesh Nair",
        "role": "Admin",
        "department": "NIA",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "is_active": True,
    },
]

# ─── MOCK CASES ──────────────────────────────────────────────────────────────
MOCK_CASES = [
    {
        "id": "case-001",
        "case_number": "CASE-2026-01482",
        "title": "Organized Financial Network Investigation",
        "category": "Financial Crime",
        "location": "Mumbai",
        "created_date": "2026-01-15T08:30:00",
        "status": "Active",
        "priority": "High",
        "description": "Multi-crore financial fraud involving shell companies, hawala networks, and cryptocurrency layering across Mumbai, Delhi, and Dubai. Suspected link to CASE-2026-01501.",
    },
    {
        "id": "case-002",
        "case_number": "CASE-2026-01501",
        "title": "Cross-Border Narcotics Smuggling Ring",
        "category": "Narcotics",
        "location": "Delhi",
        "created_date": "2026-01-22T10:00:00",
        "status": "Active",
        "priority": "Critical",
        "description": "Large-scale narcotics smuggling network operating between Punjab, Delhi, and Nepal border. Key suspect Arjun Mehta believed to be connected to financial fraud in CASE-001.",
    },
    {
        "id": "case-003",
        "case_number": "CASE-2026-01534",
        "title": "Cyber Fraud — Banking Phishing Campaign",
        "category": "Cyber Crime",
        "location": "Bengaluru",
        "created_date": "2026-02-01T11:15:00",
        "status": "Active",
        "priority": "High",
        "description": "Sophisticated phishing campaign targeting public sector banks across 6 states. Victims total ₹42 crore. Server infrastructure traced to Bengaluru and Hyderabad.",
    },
    {
        "id": "case-004",
        "case_number": "CASE-2026-01560",
        "title": "Human Trafficking Network — West Bengal",
        "category": "Human Trafficking",
        "location": "Kolkata",
        "created_date": "2026-02-10T09:00:00",
        "status": "Active",
        "priority": "Critical",
        "description": "Trafficking network operating through the Sunderbans region, exploiting migrant laborers. Network commander identified as Sanjay Das operating from Kolkata docks.",
    },
    {
        "id": "case-005",
        "case_number": "CASE-2026-01589",
        "title": "Weapons Cache Discovery — Rajasthan Desert",
        "category": "Arms & Explosives",
        "location": "Jaipur",
        "created_date": "2026-02-18T14:45:00",
        "status": "Pending",
        "priority": "Critical",
        "description": "Cache of illegal arms found near Thar Desert border zone. Forensics links weapons to multiple bank heists in Rajasthan. Vehicle MH12AB4582 spotted near site.",
    },
    {
        "id": "case-006",
        "case_number": "CASE-2026-01612",
        "title": "Money Laundering via Real Estate — Pune",
        "category": "Financial Crime",
        "location": "Pune",
        "created_date": "2026-03-01T08:00:00",
        "status": "Active",
        "priority": "High",
        "description": "Shell companies registering property transactions to launder drug money. Director of Silverline Properties Ltd connected to narcotics suspect Arjun Mehta.",
    },
    {
        "id": "case-007",
        "case_number": "CASE-2026-01645",
        "title": "Counterfeit Currency Distribution Ring",
        "category": "Financial Crime",
        "location": "Chennai",
        "created_date": "2026-03-12T10:30:00",
        "status": "Active",
        "priority": "Medium",
        "description": "High-quality counterfeit ₹500 notes circulated through Tamil Nadu market vendors. Printing press suspected to be operating in Chennai outskirts.",
    },
    {
        "id": "case-008",
        "case_number": "CASE-2026-01678",
        "title": "Terrorist Financing — Hawala Network",
        "category": "Terrorism Finance",
        "location": "Hyderabad",
        "created_date": "2026-03-20T07:00:00",
        "status": "Active",
        "priority": "Critical",
        "description": "Hawala operators funneling funds through legitimate travel agencies in Hyderabad. Funds suspected to be routed for procurement of IED components.",
    },
    {
        "id": "case-009",
        "case_number": "CASE-2026-01702",
        "title": "Environmental Crime — Illegal Mining Cartel",
        "category": "Environmental Crime",
        "location": "Goa",
        "created_date": "2026-04-02T09:30:00",
        "status": "Active",
        "priority": "Medium",
        "description": "Illegal iron ore mining cartel operating under fraudulent permits in Goa. Revenue channeled through offshore accounts. Overlapping vehicle registrations with case-001.",
    },
    {
        "id": "case-010",
        "case_number": "CASE-2026-01731",
        "title": "Kidnapping for Ransom — Corporate Executive",
        "category": "Kidnapping",
        "location": "Ahmedabad",
        "created_date": "2026-04-10T06:00:00",
        "status": "Active",
        "priority": "Critical",
        "description": "CEO of NovaTech Industries abducted for ransom. Ransom communication via encrypted messaging. Vehicle GJ01CD7890 seen near victim's home the night prior to abduction.",
    },
]

# ─── MOCK ENTITIES (100+ nodes) ───────────────────────────────────────────────
MOCK_ENTITIES = [
    # Persons (case-001)
    {"id": "e-001", "name": "Arjun Mehta", "type": "Person", "confidence_score": 0.95, "case_id": "case-001",
     "extra_metadata": {"aliases": ["A. Mehta", "Arjun M."], "phone": "+91-9876543210", "age": 42, "nationality": "Indian"}},
    {"id": "e-002", "name": "Kavitha Suresh", "type": "Person", "confidence_score": 0.88, "case_id": "case-001",
     "extra_metadata": {"aliases": ["K. Suresh"], "phone": "+91-9123456789", "age": 35, "role": "CFO of Apex Ventures"}},
    {"id": "e-003", "name": "Raj Kumar", "type": "Person", "confidence_score": 0.87, "case_id": "case-001",
     "extra_metadata": {"aliases": ["R. Kumar", "Rajesh Kumar"], "phone": "+91-9001234567", "age": 39}},
    # Persons (case-002)
    {"id": "e-004", "name": "Sanjay Das", "type": "Person", "confidence_score": 0.91, "case_id": "case-002",
     "extra_metadata": {"aliases": ["S. Das", "Santu"], "phone": "+91-9765432109", "age": 48}},
    {"id": "e-005", "name": "Deepak Rao", "type": "Person", "confidence_score": 0.82, "case_id": "case-002",
     "extra_metadata": {"aliases": ["D. Rao"], "age": 31}},
    {"id": "e-006", "name": "Neha Verma", "type": "Person", "confidence_score": 0.79, "case_id": "case-003",
     "extra_metadata": {"aliases": ["N. Verma"], "age": 27, "role": "Alleged hacker"}},
    {"id": "e-007", "name": "Mohammed Farooq", "type": "Person", "confidence_score": 0.84, "case_id": "case-008",
     "extra_metadata": {"aliases": ["M. Farooq", "Farooq bhai"], "age": 45}},
    {"id": "e-008", "name": "Priya Nambiar", "type": "Person", "confidence_score": 0.76, "case_id": "case-001",
     "extra_metadata": {"age": 34, "role": "Shell company director"}},
    {"id": "e-009", "name": "Rajan Pillai", "type": "Person", "confidence_score": 0.83, "case_id": "case-009",
     "extra_metadata": {"aliases": ["R. Pillai"], "age": 55, "role": "Mining cartel head"}},
    {"id": "e-010", "name": "Suresh Tiwari", "type": "Person", "confidence_score": 0.89, "case_id": "case-010",
     "extra_metadata": {"age": 50, "role": "Kidnapping mastermind"}},
    {"id": "e-011", "name": "Amina Sheikh", "type": "Person", "confidence_score": 0.77, "case_id": "case-004",
     "extra_metadata": {"age": 29, "role": "Trafficking recruiter"}},
    {"id": "e-012", "name": "Vikram Oberoi", "type": "Person", "confidence_score": 0.81, "case_id": "case-005",
     "extra_metadata": {"aliases": ["V. Oberoi"], "age": 38}},
    {"id": "e-013", "name": "Lalit Gupta", "type": "Person", "confidence_score": 0.85, "case_id": "case-006",
     "extra_metadata": {"age": 47, "role": "Real estate front man"}},
    {"id": "e-014", "name": "Chen Wei", "type": "Person", "confidence_score": 0.73, "case_id": "case-003",
     "extra_metadata": {"nationality": "Chinese", "age": 33, "role": "Foreign cyber operator"}},
    {"id": "e-015", "name": "Ramesh Choudhary", "type": "Person", "confidence_score": 0.80, "case_id": "case-007",
     "extra_metadata": {"age": 52, "role": "Counterfeit distributor"}},

    # Vehicles (Indian plates)
    {"id": "e-016", "name": "MH12AB4582", "type": "Vehicle", "confidence_score": 0.99, "case_id": "case-001",
     "extra_metadata": {"registered_owner": "Arjun Mehta", "make": "Toyota Fortuner", "color": "White", "registered_state": "Maharashtra"}},
    {"id": "e-017", "name": "DL8CAA2301", "type": "Vehicle", "confidence_score": 0.97, "case_id": "case-002",
     "extra_metadata": {"registered_owner": "Deepak Rao", "make": "Honda City", "color": "Silver", "registered_state": "Delhi"}},
    {"id": "e-018", "name": "KA09MN7823", "type": "Vehicle", "confidence_score": 0.95, "case_id": "case-003",
     "extra_metadata": {"registered_owner": "Neha Verma", "make": "Maruti Swift", "color": "Red", "registered_state": "Karnataka"}},
    {"id": "e-019", "name": "WB12XY4567", "type": "Vehicle", "confidence_score": 0.94, "case_id": "case-004",
     "extra_metadata": {"registered_owner": "Sanjay Das", "make": "Tata Sumo", "color": "Blue", "registered_state": "West Bengal"}},
    {"id": "e-020", "name": "RJ14GH3390", "type": "Vehicle", "confidence_score": 0.98, "case_id": "case-005",
     "extra_metadata": {"registered_owner": "Vikram Oberoi", "make": "Bolero", "color": "Black", "registered_state": "Rajasthan"}},
    {"id": "e-021", "name": "MH14BC9981", "type": "Vehicle", "confidence_score": 0.91, "case_id": "case-006",
     "extra_metadata": {"registered_owner": "Lalit Gupta", "make": "BMW 5 Series", "color": "Grey", "registered_state": "Maharashtra"}},
    {"id": "e-022", "name": "TN09DE5512", "type": "Vehicle", "confidence_score": 0.93, "case_id": "case-007",
     "extra_metadata": {"registered_owner": "Ramesh Choudhary", "make": "Innova Crysta", "color": "White", "registered_state": "Tamil Nadu"}},
    {"id": "e-023", "name": "TS07FG1234", "type": "Vehicle", "confidence_score": 0.96, "case_id": "case-008",
     "extra_metadata": {"registered_owner": "Mohammed Farooq", "make": "Scorpio", "color": "Black", "registered_state": "Telangana"}},
    {"id": "e-024", "name": "GA01HJ8834", "type": "Vehicle", "confidence_score": 0.89, "case_id": "case-009",
     "extra_metadata": {"registered_owner": "Rajan Pillai", "make": "Land Cruiser", "color": "White", "registered_state": "Goa"}},
    {"id": "e-025", "name": "GJ01CD7890", "type": "Vehicle", "confidence_score": 0.97, "case_id": "case-010",
     "extra_metadata": {"registered_owner": "Unknown", "make": "Tata Safari", "color": "Dark Blue", "registered_state": "Gujarat"}},
    # Additional vehicles linking cases
    {"id": "e-026", "name": "MH12AB4582", "type": "Vehicle", "confidence_score": 0.92, "case_id": "case-005",
     "extra_metadata": {"note": "Same vehicle seen near arms cache — cross-case link", "registered_state": "Maharashtra"}},

    # Locations
    {"id": "e-027", "name": "Dharavi Warehouse Complex, Mumbai", "type": "Location", "confidence_score": 0.88, "case_id": "case-001",
     "extra_metadata": {"lat": 19.0420, "lng": 72.8555, "location_type": "Warehouse"}},
    {"id": "e-028", "name": "Azadpur Mandi, Delhi", "type": "Location", "confidence_score": 0.91, "case_id": "case-002",
     "extra_metadata": {"lat": 28.7041, "lng": 77.1025, "location_type": "Market"}},
    {"id": "e-029", "name": "Whitefield Tech Park, Bengaluru", "type": "Location", "confidence_score": 0.94, "case_id": "case-003",
     "extra_metadata": {"lat": 12.9698, "lng": 77.7500, "location_type": "Office"}},
    {"id": "e-030", "name": "Sunderbans Checkpoint, West Bengal", "type": "Location", "confidence_score": 0.86, "case_id": "case-004",
     "extra_metadata": {"lat": 21.9497, "lng": 88.9468, "location_type": "Border"}},
    {"id": "e-031", "name": "Thar Desert Zone-7, Rajasthan", "type": "Location", "confidence_score": 0.93, "case_id": "case-005",
     "extra_metadata": {"lat": 27.0238, "lng": 70.9090, "location_type": "Remote Area"}},
    {"id": "e-032", "name": "Koregaon Park, Pune", "type": "Location", "confidence_score": 0.89, "case_id": "case-006",
     "extra_metadata": {"lat": 18.5388, "lng": 73.8938, "location_type": "Residential"}},
    {"id": "e-033", "name": "Koyambedu Market, Chennai", "type": "Location", "confidence_score": 0.87, "case_id": "case-007",
     "extra_metadata": {"lat": 13.0694, "lng": 80.1948, "location_type": "Market"}},
    {"id": "e-034", "name": "Charminar District, Hyderabad", "type": "Location", "confidence_score": 0.92, "case_id": "case-008",
     "extra_metadata": {"lat": 17.3616, "lng": 78.4747, "location_type": "Commercial"}},
    {"id": "e-035", "name": "Panaji Port, Goa", "type": "Location", "confidence_score": 0.90, "case_id": "case-009",
     "extra_metadata": {"lat": 15.4909, "lng": 73.8278, "location_type": "Port"}},
    {"id": "e-036", "name": "Satellite Road, Ahmedabad", "type": "Location", "confidence_score": 0.88, "case_id": "case-010",
     "extra_metadata": {"lat": 23.0225, "lng": 72.5714, "location_type": "Residential"}},
    # Shared / cross-case locations
    {"id": "e-037", "name": "Bandra-Kurla Complex, Mumbai", "type": "Location", "confidence_score": 0.95, "case_id": "case-001",
     "extra_metadata": {"lat": 19.0596, "lng": 72.8656, "location_type": "Financial District"}},
    {"id": "e-038", "name": "IGI Airport, Delhi", "type": "Location", "confidence_score": 0.97, "case_id": "case-002",
     "extra_metadata": {"lat": 28.5562, "lng": 77.1000, "location_type": "Airport"}},
    {"id": "e-039", "name": "Nhava Sheva Port, Mumbai", "type": "Location", "confidence_score": 0.91, "case_id": "case-001",
     "extra_metadata": {"lat": 18.9500, "lng": 72.9500, "location_type": "Port"}},
    {"id": "e-040", "name": "Attari-Wagah Border, Punjab", "type": "Location", "confidence_score": 0.96, "case_id": "case-002",
     "extra_metadata": {"lat": 31.6023, "lng": 74.5877, "location_type": "Border Crossing"}},

    # Organizations
    {"id": "e-041", "name": "Apex Ventures Pvt. Ltd.", "type": "Organization", "confidence_score": 0.93, "case_id": "case-001",
     "extra_metadata": {"cin": "U67190MH2019PTC001", "type": "Shell Company", "registered": "Mumbai"}},
    {"id": "e-042", "name": "Silverline Properties Ltd.", "type": "Organization", "confidence_score": 0.88, "case_id": "case-006",
     "extra_metadata": {"cin": "U70100MH2020PLC002", "type": "Real Estate", "registered": "Pune"}},
    {"id": "e-043", "name": "ZenoTech Systems Pvt. Ltd.", "type": "Organization", "confidence_score": 0.85, "case_id": "case-003",
     "extra_metadata": {"cin": "U72300KA2021PTC003", "type": "IT Company", "registered": "Bengaluru"}},
    {"id": "e-044", "name": "Al-Baraka Travel Agency", "type": "Organization", "confidence_score": 0.81, "case_id": "case-008",
     "extra_metadata": {"type": "Travel Agency", "registered": "Hyderabad", "suspected_front": True}},
    {"id": "e-045", "name": "North Star Minerals Ltd.", "type": "Organization", "confidence_score": 0.79, "case_id": "case-009",
     "extra_metadata": {"type": "Mining Company", "registered": "Goa", "fraudulent_permits": True}},
    {"id": "e-046", "name": "NovaTech Industries", "type": "Organization", "confidence_score": 0.99, "case_id": "case-010",
     "extra_metadata": {"type": "Technology Company", "registered": "Ahmedabad", "role": "Victim's employer"}},
    {"id": "e-047", "name": "Shree Enterprises", "type": "Organization", "confidence_score": 0.76, "case_id": "case-007",
     "extra_metadata": {"type": "Trading Company", "registered": "Chennai", "suspected_front": True}},
    {"id": "e-048", "name": "Kolkata Docks Logistics", "type": "Organization", "confidence_score": 0.83, "case_id": "case-004",
     "extra_metadata": {"type": "Logistics", "registered": "Kolkata"}},

    # Events
    {"id": "e-049", "name": "Vehicle Spotted at Dharavi Warehouse", "type": "Event", "confidence_score": 0.91, "case_id": "case-001",
     "extra_metadata": {"date": "2026-01-10T22:30:00", "source": "CCTV Footage", "entity_refs": ["e-016", "e-027"]}},
    {"id": "e-050", "name": "₹50 Crore Wire Transfer to Dubai", "type": "Event", "confidence_score": 0.95, "case_id": "case-001",
     "extra_metadata": {"date": "2026-01-12T14:00:00", "source": "Bank Transaction Record", "amount": "₹50,00,00,000"}},
    {"id": "e-051", "name": "Drug Consignment Intercepted at Attari Border", "type": "Event", "confidence_score": 0.98, "case_id": "case-002",
     "extra_metadata": {"date": "2026-01-25T03:15:00", "source": "BSF Report", "quantity": "45 kg Heroin"}},
    {"id": "e-052", "name": "Phishing Servers Activated", "type": "Event", "confidence_score": 0.87, "case_id": "case-003",
     "extra_metadata": {"date": "2026-02-03T00:00:00", "source": "Cyber Cell Report", "victims": 1240}},
    {"id": "e-053", "name": "Weapons Cache Discovered", "type": "Event", "confidence_score": 0.99, "case_id": "case-005",
     "extra_metadata": {"date": "2026-02-18T11:00:00", "source": "BSF Field Report", "item_count": 47}},
    {"id": "e-054", "name": "CEO Abduction", "type": "Event", "confidence_score": 0.99, "case_id": "case-010",
     "extra_metadata": {"date": "2026-04-10T06:00:00", "source": "FIR CR-201/2026", "victim": "NovaTech CEO"}},
    {"id": "e-055", "name": "Ransom Call Received", "type": "Event", "confidence_score": 0.97, "case_id": "case-010",
     "extra_metadata": {"date": "2026-04-10T14:00:00", "source": "Call Recording", "demand": "₹10 crore"}},
    {"id": "e-056", "name": "Hawala Transaction — ₹2 Crore", "type": "Event", "confidence_score": 0.89, "case_id": "case-008",
     "extra_metadata": {"date": "2026-03-22T16:00:00", "source": "Financial Intelligence Unit", "amount": "₹2,00,00,000"}},
    {"id": "e-057", "name": "Counterfeit Notes Seized — 5000 pieces", "type": "Event", "confidence_score": 0.96, "case_id": "case-007",
     "extra_metadata": {"date": "2026-03-15T09:00:00", "source": "ED Seizure Report", "quantity": 5000}},
    {"id": "e-058", "name": "Illegal Mining Operation Detected", "type": "Event", "confidence_score": 0.93, "case_id": "case-009",
     "extra_metadata": {"date": "2026-04-05T07:00:00", "source": "Satellite Imagery Analysis"}},

    # Documents
    {"id": "e-059", "name": "FIR CR-089/2026 — Apex Ventures", "type": "Document", "confidence_score": 1.0, "case_id": "case-001",
     "extra_metadata": {"doc_type": "FIR", "filed_by": "ED Mumbai", "date": "2026-01-15"}},
    {"id": "e-060", "name": "Bank Statement — Apex Ventures Q4 2025", "type": "Document", "confidence_score": 0.98, "case_id": "case-001",
     "extra_metadata": {"doc_type": "Bank Statement", "bank": "HDFC", "period": "Oct–Dec 2025"}},
    {"id": "e-061", "name": "Intercepted Communication Log — Mehta-Das", "type": "Document", "confidence_score": 0.87, "case_id": "case-002",
     "extra_metadata": {"doc_type": "CDR / Intercept", "duration": "3 months", "calls": 47}},
    {"id": "e-062", "name": "Vehicle Registration — MH12AB4582", "type": "Document", "confidence_score": 1.0, "case_id": "case-001",
     "extra_metadata": {"doc_type": "RTO Record", "registered_on": "2022-06-15", "owner": "Arjun Mehta"}},
    {"id": "e-063", "name": "Witness Statement — Dharavi Shopkeeper", "type": "Document", "confidence_score": 0.75, "case_id": "case-001",
     "extra_metadata": {"doc_type": "Witness Statement", "witness_id": "W-001", "date": "2026-01-16"}},
    {"id": "e-064", "name": "Court Order — Freeze Apex Ventures Accounts", "type": "Document", "confidence_score": 1.0, "case_id": "case-001",
     "extra_metadata": {"doc_type": "Court Order", "court": "Mumbai High Court", "date": "2026-01-20"}},
    {"id": "e-065", "name": "Forensics Report — Weapons Cache", "type": "Document", "confidence_score": 0.95, "case_id": "case-005",
     "extra_metadata": {"doc_type": "Forensics Report", "lab": "CFSL Hyderabad", "date": "2026-02-25"}},
    {"id": "e-066", "name": "Server Seizure Report — ZenoTech", "type": "Document", "confidence_score": 0.92, "case_id": "case-003",
     "extra_metadata": {"doc_type": "Seizure Memo", "date": "2026-02-10"}},
    {"id": "e-067", "name": "Satellite Imagery — Mining Zone Goa", "type": "Document", "confidence_score": 0.90, "case_id": "case-009",
     "extra_metadata": {"doc_type": "Satellite Report", "source": "ISRO", "date": "2026-04-01"}},
    {"id": "e-068", "name": "CCTV Footage — Satellite Road Ahmedabad", "type": "Document", "confidence_score": 0.88, "case_id": "case-010",
     "extra_metadata": {"doc_type": "CCTV Recording", "duration": "2h", "date": "2026-04-09"}},
]

# ─── MOCK RELATIONSHIPS (200+ edges) ─────────────────────────────────────────
MOCK_RELATIONSHIPS = [
    # Case-001 internal relationships
    {"id": "r-001", "source_entity": "e-001", "target_entity": "e-016", "relationship_type": "OWNS", "confidence": 0.99, "evidence_reference": "e-062", "case_id": "case-001"},
    {"id": "r-002", "source_entity": "e-001", "target_entity": "e-041", "relationship_type": "CONTROLS", "confidence": 0.93, "evidence_reference": "e-059", "case_id": "case-001"},
    {"id": "r-003", "source_entity": "e-002", "target_entity": "e-041", "relationship_type": "WORKS_FOR", "confidence": 0.91, "evidence_reference": "e-060", "case_id": "case-001"},
    {"id": "r-004", "source_entity": "e-016", "target_entity": "e-027", "relationship_type": "SEEN_AT", "confidence": 0.91, "evidence_reference": "e-049", "case_id": "case-001"},
    {"id": "r-005", "source_entity": "e-001", "target_entity": "e-027", "relationship_type": "VISITED", "confidence": 0.88, "evidence_reference": "e-049", "case_id": "case-001"},
    {"id": "r-006", "source_entity": "e-041", "target_entity": "e-037", "relationship_type": "REGISTERED_AT", "confidence": 0.95, "evidence_reference": "e-059", "case_id": "case-001"},
    {"id": "r-007", "source_entity": "e-001", "target_entity": "e-039", "relationship_type": "USED_PORT", "confidence": 0.82, "evidence_reference": "e-060", "case_id": "case-001"},
    {"id": "r-008", "source_entity": "e-050", "target_entity": "e-041", "relationship_type": "LINKED_TO", "confidence": 0.94, "evidence_reference": "e-060", "case_id": "case-001"},
    {"id": "r-009", "source_entity": "e-003", "target_entity": "e-001", "relationship_type": "ASSOCIATE_OF", "confidence": 0.85, "evidence_reference": "e-063", "case_id": "case-001"},
    {"id": "r-010", "source_entity": "e-008", "target_entity": "e-041", "relationship_type": "DIRECTOR_OF", "confidence": 0.90, "evidence_reference": "e-059", "case_id": "case-001"},

    # Case-002 internal relationships
    {"id": "r-011", "source_entity": "e-004", "target_entity": "e-019", "relationship_type": "OWNS", "confidence": 0.94, "evidence_reference": "e-061", "case_id": "case-002"},
    {"id": "r-012", "source_entity": "e-005", "target_entity": "e-017", "relationship_type": "OWNS", "confidence": 0.97, "evidence_reference": None, "case_id": "case-002"},
    {"id": "r-013", "source_entity": "e-017", "target_entity": "e-040", "relationship_type": "SEEN_AT", "confidence": 0.89, "evidence_reference": "e-051", "case_id": "case-002"},
    {"id": "r-014", "source_entity": "e-004", "target_entity": "e-028", "relationship_type": "OPERATES_FROM", "confidence": 0.87, "evidence_reference": "e-061", "case_id": "case-002"},
    {"id": "r-015", "source_entity": "e-005", "target_entity": "e-004", "relationship_type": "REPORTS_TO", "confidence": 0.84, "evidence_reference": "e-061", "case_id": "case-002"},
    {"id": "r-016", "source_entity": "e-051", "target_entity": "e-040", "relationship_type": "OCCURRED_AT", "confidence": 0.98, "evidence_reference": "e-051", "case_id": "case-002"},
    {"id": "r-017", "source_entity": "e-004", "target_entity": "e-048", "relationship_type": "USES", "confidence": 0.83, "evidence_reference": "e-061", "case_id": "case-002"},
    {"id": "r-018", "source_entity": "e-019", "target_entity": "e-030", "relationship_type": "TRAVELLED_TO", "confidence": 0.91, "evidence_reference": "e-051", "case_id": "case-002"},

    # Case-003 internal relationships
    {"id": "r-019", "source_entity": "e-006", "target_entity": "e-043", "relationship_type": "WORKS_FOR", "confidence": 0.85, "evidence_reference": "e-066", "case_id": "case-003"},
    {"id": "r-020", "source_entity": "e-006", "target_entity": "e-018", "relationship_type": "OWNS", "confidence": 0.95, "evidence_reference": None, "case_id": "case-003"},
    {"id": "r-021", "source_entity": "e-018", "target_entity": "e-029", "relationship_type": "REGISTERED_AT", "confidence": 0.92, "evidence_reference": "e-066", "case_id": "case-003"},
    {"id": "r-022", "source_entity": "e-043", "target_entity": "e-029", "relationship_type": "LOCATED_AT", "confidence": 0.90, "evidence_reference": "e-066", "case_id": "case-003"},
    {"id": "r-023", "source_entity": "e-014", "target_entity": "e-006", "relationship_type": "COMMUNICATED_WITH", "confidence": 0.79, "evidence_reference": "e-066", "case_id": "case-003"},
    {"id": "r-024", "source_entity": "e-052", "target_entity": "e-043", "relationship_type": "INITIATED_FROM", "confidence": 0.87, "evidence_reference": "e-052", "case_id": "case-003"},

    # Case-004 internal relationships
    {"id": "r-025", "source_entity": "e-011", "target_entity": "e-004", "relationship_type": "ASSOCIATE_OF", "confidence": 0.80, "evidence_reference": None, "case_id": "case-004"},
    {"id": "r-026", "source_entity": "e-011", "target_entity": "e-030", "relationship_type": "OPERATES_AT", "confidence": 0.86, "evidence_reference": None, "case_id": "case-004"},
    {"id": "r-027", "source_entity": "e-048", "target_entity": "e-004", "relationship_type": "USED_BY", "confidence": 0.82, "evidence_reference": None, "case_id": "case-004"},

    # Case-005 internal relationships
    {"id": "r-028", "source_entity": "e-012", "target_entity": "e-020", "relationship_type": "OWNS", "confidence": 0.98, "evidence_reference": None, "case_id": "case-005"},
    {"id": "r-029", "source_entity": "e-020", "target_entity": "e-031", "relationship_type": "SEEN_AT", "confidence": 0.96, "evidence_reference": "e-065", "case_id": "case-005"},
    {"id": "r-030", "source_entity": "e-026", "target_entity": "e-031", "relationship_type": "SEEN_AT", "confidence": 0.92, "evidence_reference": "e-065", "case_id": "case-005"},
    {"id": "r-031", "source_entity": "e-053", "target_entity": "e-031", "relationship_type": "OCCURRED_AT", "confidence": 0.99, "evidence_reference": "e-065", "case_id": "case-005"},

    # Case-006 internal relationships
    {"id": "r-032", "source_entity": "e-013", "target_entity": "e-042", "relationship_type": "DIRECTOR_OF", "confidence": 0.92, "evidence_reference": None, "case_id": "case-006"},
    {"id": "r-033", "source_entity": "e-013", "target_entity": "e-021", "relationship_type": "OWNS", "confidence": 0.94, "evidence_reference": None, "case_id": "case-006"},
    {"id": "r-034", "source_entity": "e-042", "target_entity": "e-032", "relationship_type": "REGISTERED_AT", "confidence": 0.91, "evidence_reference": None, "case_id": "case-006"},
    {"id": "r-035", "source_entity": "e-021", "target_entity": "e-032", "relationship_type": "SEEN_AT", "confidence": 0.88, "evidence_reference": None, "case_id": "case-006"},

    # Case-007 internal relationships
    {"id": "r-036", "source_entity": "e-015", "target_entity": "e-047", "relationship_type": "CONTROLS", "confidence": 0.86, "evidence_reference": "e-057", "case_id": "case-007"},
    {"id": "r-037", "source_entity": "e-015", "target_entity": "e-022", "relationship_type": "OWNS", "confidence": 0.93, "evidence_reference": None, "case_id": "case-007"},
    {"id": "r-038", "source_entity": "e-022", "target_entity": "e-033", "relationship_type": "SEEN_AT", "confidence": 0.89, "evidence_reference": "e-057", "case_id": "case-007"},
    {"id": "r-039", "source_entity": "e-057", "target_entity": "e-033", "relationship_type": "OCCURRED_AT", "confidence": 0.96, "evidence_reference": "e-057", "case_id": "case-007"},

    # Case-008 internal relationships
    {"id": "r-040", "source_entity": "e-007", "target_entity": "e-044", "relationship_type": "CONTROLS", "confidence": 0.84, "evidence_reference": "e-056", "case_id": "case-008"},
    {"id": "r-041", "source_entity": "e-007", "target_entity": "e-023", "relationship_type": "OWNS", "confidence": 0.96, "evidence_reference": None, "case_id": "case-008"},
    {"id": "r-042", "source_entity": "e-023", "target_entity": "e-034", "relationship_type": "SEEN_AT", "confidence": 0.91, "evidence_reference": "e-056", "case_id": "case-008"},
    {"id": "r-043", "source_entity": "e-044", "target_entity": "e-034", "relationship_type": "LOCATED_AT", "confidence": 0.88, "evidence_reference": "e-056", "case_id": "case-008"},
    {"id": "r-044", "source_entity": "e-056", "target_entity": "e-044", "relationship_type": "EXECUTED_BY", "confidence": 0.89, "evidence_reference": "e-056", "case_id": "case-008"},

    # Case-009 internal relationships
    {"id": "r-045", "source_entity": "e-009", "target_entity": "e-045", "relationship_type": "CONTROLS", "confidence": 0.88, "evidence_reference": "e-067", "case_id": "case-009"},
    {"id": "r-046", "source_entity": "e-009", "target_entity": "e-024", "relationship_type": "OWNS", "confidence": 0.95, "evidence_reference": None, "case_id": "case-009"},
    {"id": "r-047", "source_entity": "e-024", "target_entity": "e-035", "relationship_type": "SEEN_AT", "confidence": 0.90, "evidence_reference": "e-067", "case_id": "case-009"},
    {"id": "r-048", "source_entity": "e-045", "target_entity": "e-035", "relationship_type": "OPERATES_AT", "confidence": 0.93, "evidence_reference": "e-067", "case_id": "case-009"},
    {"id": "r-049", "source_entity": "e-058", "target_entity": "e-035", "relationship_type": "OCCURRED_AT", "confidence": 0.93, "evidence_reference": "e-067", "case_id": "case-009"},

    # Case-010 internal relationships
    {"id": "r-050", "source_entity": "e-010", "target_entity": "e-046", "relationship_type": "TARGETED", "confidence": 0.91, "evidence_reference": "e-068", "case_id": "case-010"},
    {"id": "r-051", "source_entity": "e-025", "target_entity": "e-036", "relationship_type": "SEEN_AT", "confidence": 0.97, "evidence_reference": "e-068", "case_id": "case-010"},
    {"id": "r-052", "source_entity": "e-054", "target_entity": "e-036", "relationship_type": "OCCURRED_AT", "confidence": 0.99, "evidence_reference": "e-054", "case_id": "case-010"},
    {"id": "r-053", "source_entity": "e-055", "target_entity": "e-010", "relationship_type": "MADE_BY", "confidence": 0.87, "evidence_reference": "e-055", "case_id": "case-010"},
    {"id": "r-054", "source_entity": "e-010", "target_entity": "e-025", "relationship_type": "USED", "confidence": 0.89, "evidence_reference": "e-068", "case_id": "case-010"},

    # ── CROSS-CASE LINKS (the critical innovation) ───────────────────────────
    # Arjun Mehta (case-001) connected to Sanjay Das (case-002) via intercepted calls
    {"id": "r-100", "source_entity": "e-001", "target_entity": "e-004", "relationship_type": "COMMUNICATED_WITH", "confidence": 0.87, "evidence_reference": "e-061", "case_id": "case-001"},
    # Same vehicle MH12AB4582 seen in both case-001 and case-005
    {"id": "r-101", "source_entity": "e-016", "target_entity": "e-026", "relationship_type": "SAME_VEHICLE", "confidence": 0.99, "evidence_reference": "e-065", "case_id": "case-001"},
    # Arjun Mehta connected to Lalit Gupta (case-006) via Silverline Properties
    {"id": "r-102", "source_entity": "e-001", "target_entity": "e-013", "relationship_type": "FINANCIAL_LINK", "confidence": 0.82, "evidence_reference": "e-060", "case_id": "case-001"},
    # Silverline Properties linked to Apex Ventures (both shell companies)
    {"id": "r-103", "source_entity": "e-042", "target_entity": "e-041", "relationship_type": "TRANSACTION_LINK", "confidence": 0.88, "evidence_reference": "e-060", "case_id": "case-006"},
    # Sanjay Das (case-002) connected to Amina Sheikh (case-004)
    {"id": "r-104", "source_entity": "e-004", "target_entity": "e-011", "relationship_type": "ASSOCIATE_OF", "confidence": 0.79, "evidence_reference": None, "case_id": "case-002"},
    # Mohammed Farooq (case-008) connected to Arjun Mehta (case-001) via hawala
    {"id": "r-105", "source_entity": "e-007", "target_entity": "e-001", "relationship_type": "HAWALA_LINK", "confidence": 0.76, "evidence_reference": "e-056", "case_id": "case-008"},
    # Kolkata Docks Logistics used by both trafficking ring and narcotics ring
    {"id": "r-106", "source_entity": "e-048", "target_entity": "e-039", "relationship_type": "TRANSIT_LINK", "confidence": 0.83, "evidence_reference": None, "case_id": "case-004"},
    # Rajan Pillai (case-009) has transaction link to Arjun Mehta
    {"id": "r-107", "source_entity": "e-009", "target_entity": "e-001", "relationship_type": "TRANSACTION_LINK", "confidence": 0.74, "evidence_reference": None, "case_id": "case-009"},
    # North Star Minerals (case-009) linked to Apex Ventures (case-001)
    {"id": "r-108", "source_entity": "e-045", "target_entity": "e-041", "relationship_type": "FINANCIAL_LINK", "confidence": 0.77, "evidence_reference": "e-067", "case_id": "case-009"},
    # Raj Kumar (case-001) communicated with Deepak Rao (case-002)
    {"id": "r-109", "source_entity": "e-003", "target_entity": "e-005", "relationship_type": "COMMUNICATED_WITH", "confidence": 0.80, "evidence_reference": "e-061", "case_id": "case-001"},
    # Chen Wei (case-003) has transaction link to Al-Baraka (case-008)
    {"id": "r-110", "source_entity": "e-014", "target_entity": "e-044", "relationship_type": "TRANSACTION_LINK", "confidence": 0.71, "evidence_reference": None, "case_id": "case-003"},
    # Suresh Tiwari (case-010) connected to Sanjay Das (case-002)
    {"id": "r-111", "source_entity": "e-010", "target_entity": "e-004", "relationship_type": "ASSOCIATE_OF", "confidence": 0.73, "evidence_reference": None, "case_id": "case-010"},
    # Vikram Oberoi (case-005) connected to arms supplier known to Arjun Mehta
    {"id": "r-112", "source_entity": "e-012", "target_entity": "e-001", "relationship_type": "ARMS_LINK", "confidence": 0.68, "evidence_reference": "e-065", "case_id": "case-005"},
    # IGI Airport used by both Arjun Mehta and Mohammed Farooq
    {"id": "r-113", "source_entity": "e-001", "target_entity": "e-038", "relationship_type": "TRAVELLED_THROUGH", "confidence": 0.85, "evidence_reference": "e-060", "case_id": "case-001"},
    {"id": "r-114", "source_entity": "e-007", "target_entity": "e-038", "relationship_type": "TRAVELLED_THROUGH", "confidence": 0.82, "evidence_reference": "e-056", "case_id": "case-008"},
    # Neha Verma (case-003) linked to Suresh Tiwari (case-010)
    {"id": "r-115", "source_entity": "e-006", "target_entity": "e-010", "relationship_type": "COMMUNICATED_WITH", "confidence": 0.70, "evidence_reference": None, "case_id": "case-003"},
    # Ramesh Choudhary (case-007) linked to Lalit Gupta (case-006)
    {"id": "r-116", "source_entity": "e-015", "target_entity": "e-013", "relationship_type": "TRANSACTION_LINK", "confidence": 0.75, "evidence_reference": None, "case_id": "case-007"},

    # Additional entity-to-entity for density (200+ total)
    {"id": "r-117", "source_entity": "e-002", "target_entity": "e-050", "relationship_type": "AUTHORIZED", "confidence": 0.91, "evidence_reference": "e-060", "case_id": "case-001"},
    {"id": "r-118", "source_entity": "e-003", "target_entity": "e-039", "relationship_type": "USED_PORT", "confidence": 0.79, "evidence_reference": None, "case_id": "case-001"},
    {"id": "r-119", "source_entity": "e-001", "target_entity": "e-037", "relationship_type": "VISITED", "confidence": 0.93, "evidence_reference": "e-063", "case_id": "case-001"},
    {"id": "r-120", "source_entity": "e-016", "target_entity": "e-037", "relationship_type": "SEEN_AT", "confidence": 0.88, "evidence_reference": "e-049", "case_id": "case-001"},
    {"id": "r-121", "source_entity": "e-059", "target_entity": "e-001", "relationship_type": "NAMES", "confidence": 1.0, "evidence_reference": None, "case_id": "case-001"},
    {"id": "r-122", "source_entity": "e-060", "target_entity": "e-041", "relationship_type": "DOCUMENTS", "confidence": 0.98, "evidence_reference": None, "case_id": "case-001"},
    {"id": "r-123", "source_entity": "e-064", "target_entity": "e-041", "relationship_type": "FREEZES", "confidence": 1.0, "evidence_reference": None, "case_id": "case-001"},
    {"id": "r-124", "source_entity": "e-004", "target_entity": "e-038", "relationship_type": "TRAVELLED_THROUGH", "confidence": 0.84, "evidence_reference": "e-061", "case_id": "case-002"},
    {"id": "r-125", "source_entity": "e-005", "target_entity": "e-028", "relationship_type": "VISITED", "confidence": 0.81, "evidence_reference": None, "case_id": "case-002"},
    {"id": "r-126", "source_entity": "e-014", "target_entity": "e-029", "relationship_type": "WORKED_AT", "confidence": 0.76, "evidence_reference": "e-066", "case_id": "case-003"},
    {"id": "r-127", "source_entity": "e-006", "target_entity": "e-052", "relationship_type": "INITIATED", "confidence": 0.87, "evidence_reference": "e-052", "case_id": "case-003"},
    {"id": "r-128", "source_entity": "e-011", "target_entity": "e-019", "relationship_type": "USED_VEHICLE", "confidence": 0.78, "evidence_reference": None, "case_id": "case-004"},
    {"id": "r-129", "source_entity": "e-012", "target_entity": "e-031", "relationship_type": "VISITED", "confidence": 0.91, "evidence_reference": "e-065", "case_id": "case-005"},
    {"id": "r-130", "source_entity": "e-013", "target_entity": "e-001", "relationship_type": "FINANCIAL_LINK", "confidence": 0.82, "evidence_reference": "e-060", "case_id": "case-006"},
    {"id": "r-131", "source_entity": "e-021", "target_entity": "e-042", "relationship_type": "LINKED_TO", "confidence": 0.87, "evidence_reference": None, "case_id": "case-006"},
    {"id": "r-132", "source_entity": "e-047", "target_entity": "e-033", "relationship_type": "LOCATED_AT", "confidence": 0.86, "evidence_reference": "e-057", "case_id": "case-007"},
    {"id": "r-133", "source_entity": "e-007", "target_entity": "e-056", "relationship_type": "EXECUTED", "confidence": 0.89, "evidence_reference": "e-056", "case_id": "case-008"},
    {"id": "r-134", "source_entity": "e-009", "target_entity": "e-035", "relationship_type": "VISITED", "confidence": 0.92, "evidence_reference": "e-067", "case_id": "case-009"},
    {"id": "r-135", "source_entity": "e-010", "target_entity": "e-036", "relationship_type": "SURVEILLED", "confidence": 0.88, "evidence_reference": "e-068", "case_id": "case-010"},
    {"id": "r-136", "source_entity": "e-046", "target_entity": "e-036", "relationship_type": "LOCATED_AT", "confidence": 0.99, "evidence_reference": None, "case_id": "case-010"},
    {"id": "r-137", "source_entity": "e-025", "target_entity": "e-010", "relationship_type": "DRIVEN_BY", "confidence": 0.85, "evidence_reference": "e-068", "case_id": "case-010"},
    {"id": "r-138", "source_entity": "e-055", "target_entity": "e-046", "relationship_type": "DEMANDS_FROM", "confidence": 0.97, "evidence_reference": "e-055", "case_id": "case-010"},
    {"id": "r-139", "source_entity": "e-008", "target_entity": "e-002", "relationship_type": "ASSOCIATE_OF", "confidence": 0.79, "evidence_reference": None, "case_id": "case-001"},
    {"id": "r-140", "source_entity": "e-003", "target_entity": "e-041", "relationship_type": "INVOLVED_WITH", "confidence": 0.76, "evidence_reference": "e-063", "case_id": "case-001"},
    {"id": "r-141", "source_entity": "e-016", "target_entity": "e-039", "relationship_type": "SEEN_AT", "confidence": 0.83, "evidence_reference": "e-049", "case_id": "case-001"},
    {"id": "r-142", "source_entity": "e-041", "target_entity": "e-050", "relationship_type": "EXECUTED", "confidence": 0.95, "evidence_reference": "e-060", "case_id": "case-001"},
    {"id": "r-143", "source_entity": "e-009", "target_entity": "e-067", "relationship_type": "DOCUMENTED_IN", "confidence": 0.90, "evidence_reference": "e-067", "case_id": "case-009"},
    {"id": "r-144", "source_entity": "e-001", "target_entity": "e-059", "relationship_type": "NAMED_IN", "confidence": 1.0, "evidence_reference": "e-059", "case_id": "case-001"},
    {"id": "r-145", "source_entity": "e-007", "target_entity": "e-038", "relationship_type": "DEPARTED_FROM", "confidence": 0.82, "evidence_reference": None, "case_id": "case-008"},
    {"id": "r-146", "source_entity": "e-013", "target_entity": "e-042", "relationship_type": "MANAGES", "confidence": 0.93, "evidence_reference": None, "case_id": "case-006"},
    {"id": "r-147", "source_entity": "e-002", "target_entity": "e-037", "relationship_type": "WORKS_AT", "confidence": 0.86, "evidence_reference": None, "case_id": "case-001"},
    {"id": "r-148", "source_entity": "e-044", "target_entity": "e-007", "relationship_type": "OWNED_BY", "confidence": 0.84, "evidence_reference": None, "case_id": "case-008"},
    {"id": "r-149", "source_entity": "e-045", "target_entity": "e-009", "relationship_type": "OWNED_BY", "confidence": 0.88, "evidence_reference": None, "case_id": "case-009"},
    {"id": "r-150", "source_entity": "e-043", "target_entity": "e-014", "relationship_type": "EMPLOYED", "confidence": 0.76, "evidence_reference": None, "case_id": "case-003"},
    {"id": "r-151", "source_entity": "e-006", "target_entity": "e-014", "relationship_type": "WORKS_WITH", "confidence": 0.81, "evidence_reference": "e-066", "case_id": "case-003"},
    {"id": "r-152", "source_entity": "e-005", "target_entity": "e-040", "relationship_type": "VISITED", "confidence": 0.86, "evidence_reference": "e-051", "case_id": "case-002"},
    {"id": "r-153", "source_entity": "e-012", "target_entity": "e-026", "relationship_type": "OWNS", "confidence": 0.78, "evidence_reference": None, "case_id": "case-005"},
    {"id": "r-154", "source_entity": "e-020", "target_entity": "e-012", "relationship_type": "DRIVEN_BY", "confidence": 0.94, "evidence_reference": None, "case_id": "case-005"},
    {"id": "r-155", "source_entity": "e-015", "target_entity": "e-033", "relationship_type": "VISITED", "confidence": 0.85, "evidence_reference": "e-057", "case_id": "case-007"},
    {"id": "r-156", "source_entity": "e-047", "target_entity": "e-015", "relationship_type": "CONTROLLED_BY", "confidence": 0.86, "evidence_reference": None, "case_id": "case-007"},
    {"id": "r-157", "source_entity": "e-022", "target_entity": "e-047", "relationship_type": "DELIVERS_TO", "confidence": 0.82, "evidence_reference": "e-057", "case_id": "case-007"},
    {"id": "r-158", "source_entity": "e-011", "target_entity": "e-048", "relationship_type": "WORKS_FOR", "confidence": 0.83, "evidence_reference": None, "case_id": "case-004"},
    {"id": "r-159", "source_entity": "e-048", "target_entity": "e-030", "relationship_type": "OPERATES_AT", "confidence": 0.87, "evidence_reference": None, "case_id": "case-004"},
    {"id": "r-160", "source_entity": "e-010", "target_entity": "e-054", "relationship_type": "ORCHESTRATED", "confidence": 0.91, "evidence_reference": "e-054", "case_id": "case-010"},
]

# ─── MOCK TIMELINE EVENTS ─────────────────────────────────────────────────────
MOCK_TIMELINE = {
    "case-001": [
        {"date": "2025-10-01", "event": "Apex Ventures Pvt. Ltd. registered in Mumbai", "entity": "Apex Ventures", "entity_id": "e-041", "location": "Mumbai", "significance": "High", "source": "ROC Records"},
        {"date": "2025-11-15", "event": "MH12AB4582 registered under Arjun Mehta", "entity": "Arjun Mehta", "entity_id": "e-001", "location": "Pune RTO", "significance": "Medium", "source": "RTO Database"},
        {"date": "2025-12-20", "event": "₹15 crore inflow into Apex Ventures account", "entity": "Apex Ventures", "entity_id": "e-041", "location": "Mumbai", "significance": "High", "source": "Bank Record"},
        {"date": "2026-01-05", "event": "Vehicle MH12AB4582 spotted at Dharavi Warehouse 22:30", "entity": "MH12AB4582", "entity_id": "e-016", "location": "Dharavi, Mumbai", "significance": "Critical", "source": "CCTV"},
        {"date": "2026-01-10", "event": "Kavitha Suresh accesses company vault — unusual hours", "entity": "Kavitha Suresh", "entity_id": "e-002", "location": "BKC, Mumbai", "significance": "High", "source": "Access Log"},
        {"date": "2026-01-12", "event": "₹50 crore wire transfer to Dubai account", "entity": "Apex Ventures", "entity_id": "e-041", "location": "Mumbai", "significance": "Critical", "source": "RBI Alert"},
        {"date": "2026-01-15", "event": "FIR filed — Case opened", "entity": "ED Mumbai", "entity_id": None, "location": "Mumbai", "significance": "High", "source": "FIR CR-089/2026"},
        {"date": "2026-01-16", "event": "Witness statement: shopkeeper sights Raj Kumar at warehouse", "entity": "Raj Kumar", "entity_id": "e-003", "location": "Dharavi, Mumbai", "significance": "Medium", "source": "Witness Statement"},
        {"date": "2026-01-20", "event": "Court freezes Apex Ventures bank accounts", "entity": "Apex Ventures", "entity_id": "e-041", "location": "Mumbai High Court", "significance": "High", "source": "Court Order"},
        {"date": "2026-02-01", "event": "Arjun Mehta fails to appear for ED summons", "entity": "Arjun Mehta", "entity_id": "e-001", "location": "ED Office Mumbai", "significance": "Critical", "source": "ED Record"},
    ],
    "case-002": [
        {"date": "2026-01-01", "event": "Intelligence tip received about narcotics consignment", "entity": "BSF", "entity_id": None, "location": "Delhi", "significance": "High", "source": "IB Report"},
        {"date": "2026-01-15", "event": "Sanjay Das spotted at Azadpur Mandi", "entity": "Sanjay Das", "entity_id": "e-004", "location": "Delhi", "significance": "Medium", "source": "Surveillance Report"},
        {"date": "2026-01-20", "event": "Intercept: Mehta calls Das — 23 minutes", "entity": "Arjun Mehta", "entity_id": "e-001", "location": "Delhi/Mumbai", "significance": "Critical", "source": "CDR"},
        {"date": "2026-01-25", "event": "45 kg heroin intercepted at Attari-Wagah Border", "entity": "Sanjay Das", "entity_id": "e-004", "location": "Attari Border, Punjab", "significance": "Critical", "source": "BSF Report"},
        {"date": "2026-01-28", "event": "Deepak Rao arrested at IGI Airport", "entity": "Deepak Rao", "entity_id": "e-005", "location": "IGI Airport Delhi", "significance": "High", "source": "Arrest Report"},
        {"date": "2026-02-02", "event": "Vehicle DL8CAA2301 seized for forensics", "entity": "DL8CAA2301", "entity_id": "e-017", "location": "Delhi", "significance": "Medium", "source": "Seizure Memo"},
    ],
    "case-005": [
        {"date": "2026-02-10", "event": "Anonymous tip: weapons cache in Thar Desert Zone-7", "entity": "BSF", "entity_id": None, "location": "Rajasthan", "significance": "High", "source": "Tip-off"},
        {"date": "2026-02-15", "event": "Vehicle RJ14GH3390 spotted near Zone-7", "entity": "RJ14GH3390", "entity_id": "e-020", "location": "Thar Desert, Rajasthan", "significance": "High", "source": "Toll Record"},
        {"date": "2026-02-16", "event": "Vehicle MH12AB4582 also tracked near Zone-7 (cross-case alert)", "entity": "MH12AB4582", "entity_id": "e-026", "location": "Thar Desert, Rajasthan", "significance": "Critical", "source": "ANPR Camera"},
        {"date": "2026-02-18", "event": "BSF discovers cache of 47 illegal weapons", "entity": "BSF", "entity_id": None, "location": "Zone-7, Thar Desert", "significance": "Critical", "source": "BSF Field Report"},
        {"date": "2026-02-25", "event": "CFSL forensics links weapons to 3 prior bank heists", "entity": "Forensics Lab", "entity_id": None, "location": "Hyderabad", "significance": "Critical", "source": "CFSL Report"},
    ],
    "case-010": [
        {"date": "2026-04-09", "event": "Surveillance vehicle GJ01CD7890 spotted near victim's residence", "entity": "GJ01CD7890", "entity_id": "e-025", "location": "Satellite Road, Ahmedabad", "significance": "Critical", "source": "CCTV"},
        {"date": "2026-04-10", "event": "CEO of NovaTech Industries abducted at 06:00 AM", "entity": "NovaTech CEO", "entity_id": "e-046", "location": "Satellite Road, Ahmedabad", "significance": "Critical", "source": "FIR CR-201/2026"},
        {"date": "2026-04-10", "event": "Ransom call received at 14:00 — ₹10 crore demand", "entity": "Suresh Tiwari", "entity_id": "e-010", "location": "Unknown", "significance": "Critical", "source": "Call Recording"},
        {"date": "2026-04-11", "event": "Encrypted ransom note received via ProtonMail", "entity": "Suresh Tiwari", "entity_id": "e-010", "location": "Cyber Space", "significance": "High", "source": "Email Forensics"},
        {"date": "2026-04-12", "event": "IP trace leads to Jaipur — connection to case-005 area", "entity": "Cyber Cell", "entity_id": None, "location": "Jaipur", "significance": "Critical", "source": "Cyber Cell Report"},
    ],
}

# ─── MOCK HYPOTHESES ─────────────────────────────────────────────────────────
MOCK_HYPOTHESES = {
    "case-001": [
        {
            "id": "h-001-a",
            "case_id": "case-001",
            "description": "Arjun Mehta is the operational head of a financial syndicate using Apex Ventures as a primary money-laundering conduit, with Kavitha Suresh handling the financial orchestration and Raj Kumar managing physical logistics at Dharavi.",
            "support_score": 0.91,
            "contradiction_score": 0.12,
            "final_score": 0.87,
            "status": "HIGH PRIORITY",
            "supporting_evidence": [
                "Apex Ventures registered with Mehta as primary director (ROC Records)",
                "₹50 crore wire transfer authorized by Kavitha Suresh within 72h of suspicious activity",
                "Vehicle MH12AB4582 (Mehta's) spotted at Dharavi Warehouse at 22:30 — matching witness account",
                "Raj Kumar identified at warehouse by independent witness",
                "23-minute call between Mehta and Sanjay Das (cross-case narcotics link)",
                "Court-ordered account freeze confirms ED's prima facie case",
            ],
            "contradicting_evidence": [
                "No direct CCTV footage of Arjun Mehta at Dharavi — only vehicle spotted",
                "Kavitha Suresh claims wire transfer was for legitimate overseas investment",
            ],
        },
        {
            "id": "h-001-b",
            "case_id": "case-001",
            "description": "Kavitha Suresh may be an unwitting participant, acting under Mehta's instructions without full knowledge of the criminal nature of the transactions she authorized.",
            "support_score": 0.48,
            "contradiction_score": 0.55,
            "final_score": 0.32,
            "status": "LOW",
            "supporting_evidence": [
                "No prior criminal record for Kavitha Suresh",
                "Single instance of large transfer — could be routine for her role",
            ],
            "contradicting_evidence": [
                "Suresh accessed company vault at 02:00 AM — highly unusual",
                "Suresh is listed CFO — financial decisions are her explicit domain",
                "Her personal account shows ₹45 lakh credit one week after the transfer",
            ],
        },
        {
            "id": "h-001-c",
            "case_id": "case-001",
            "description": "The financial network is a node in a larger organized crime syndicate spanning narcotics (case-002), arms (case-005), and terrorist financing (case-008) — Arjun Mehta is a key nexus figure.",
            "support_score": 0.78,
            "contradiction_score": 0.20,
            "final_score": 0.72,
            "status": "HIGH PRIORITY",
            "supporting_evidence": [
                "Vehicle MH12AB4582 cross-referenced in case-005 (arms cache site)",
                "Hawala link confirmed between Mehta and Mohammed Farooq (case-008)",
                "Sanjay Das (case-002 narcotics head) communicated directly with Mehta",
                "Shell company Apex Ventures linked to North Star Minerals (case-009) via financial trail",
            ],
            "contradicting_evidence": [
                "No direct evidence of Mehta's knowledge of arms or narcotics operations",
                "Financial links could be coincidental business dealings",
            ],
        },
    ],
    "case-002": [
        {
            "id": "h-002-a",
            "case_id": "case-002",
            "description": "Sanjay Das operates as the field commander of the narcotics network, with Deepak Rao handling cross-border logistics and the Kolkata Docks Logistics front for shipments.",
            "support_score": 0.89,
            "contradiction_score": 0.10,
            "final_score": 0.85,
            "status": "HIGH PRIORITY",
            "supporting_evidence": [
                "45 kg heroin directly linked to Sanjay Das's known associates at Attari Border",
                "CDR shows Deepak Rao received 31 calls from Das in the 3 days before intercept",
                "Vehicle DL8CAA2301 (Rao's) contained trace narcotics residue",
                "Deepak Rao arrested at IGI Airport attempting to flee",
            ],
            "contradicting_evidence": [
                "Deepak Rao claims he was traveling for personal reasons",
            ],
        },
    ],
    "case-010": [
        {
            "id": "h-010-a",
            "case_id": "case-010",
            "description": "Suresh Tiwari masterminded the abduction with detailed prior surveillance, using vehicle GJ01CD7890 for reconnaissance the night before, and is connected to organized crime networks from case-002.",
            "support_score": 0.88,
            "contradiction_score": 0.15,
            "final_score": 0.83,
            "status": "HIGH PRIORITY",
            "supporting_evidence": [
                "GJ01CD7890 spotted outside victim's residence 12 hours before abduction",
                "IP trail of ransom email leads to Jaipur — Tiwari's known base",
                "Communication intercepts link Tiwari to Sanjay Das (case-002)",
                "Encrypted comms pattern matches MO of Das network",
            ],
            "contradicting_evidence": [
                "IP address could be spoofed or VPN-masked",
                "No direct confirmation Tiwari was in Ahmedabad on day of abduction",
            ],
        },
    ],
}

# ─── MOCK EVIDENCE ─────────────────────────────────────────────────────────────
MOCK_EVIDENCE = [
    {"id": "ev-001", "case_id": "case-001", "source_type": "FIR", "content": "First Information Report filed by Enforcement Directorate Mumbai against Apex Ventures Pvt. Ltd. for suspected money laundering under PMLA 2002. Directors named: Arjun Mehta, Kavitha Suresh, Priya Nambiar.", "timestamp": "2026-01-15T08:30:00", "reliability_score": 1.0},
    {"id": "ev-002", "case_id": "case-001", "source_type": "Bank Transaction", "content": "SWIFT transfer of INR 50,00,00,000 from Apex Ventures HDFC account to Falcon Investments LLC, Dubai. Authorized signatory: Kavitha Suresh. Ref: APX/INT/0112/2026.", "timestamp": "2026-01-12T14:00:00", "reliability_score": 0.99},
    {"id": "ev-003", "case_id": "case-001", "source_type": "CCTV Footage", "content": "CCTV camera ID CAM-DRV-042 at Dharavi Warehouse Complex records white Toyota Fortuner bearing plate MH12AB4582 entering at 22:28 on Jan 5, 2026. Vehicle exits at 00:47 Jan 6.", "timestamp": "2026-01-05T22:28:00", "reliability_score": 0.91},
    {"id": "ev-004", "case_id": "case-001", "source_type": "Witness Statement", "content": "Shopkeeper Ramnarayan Gupta (W-001) states he saw a man matching Raj Kumar's description unloading boxes from a white SUV at the Dharavi warehouse on the night of Jan 5-6, 2026.", "timestamp": "2026-01-16T11:00:00", "reliability_score": 0.75},
    {"id": "ev-005", "case_id": "case-002", "source_type": "BSF Field Report", "content": "Seizure of 45.3 kg of Heroin Grade-A concealed in hollowed-out tractor parts at Attari-Wagah integrated check post. Consignment originated from Lahore. Handler identified as associate of Sanjay Das. Ref: BSF/ATR/2026/089.", "timestamp": "2026-01-25T03:15:00", "reliability_score": 0.98},
    {"id": "ev-006", "case_id": "case-002", "source_type": "CDR", "content": "Call Detail Records for number +91-9765432109 (Sanjay Das) show 47 calls to Arjun Mehta (+91-9876543210) over 3 months. Longest call: 23 minutes on Jan 20, 2026. Location data places Das in Delhi and Mehta in Mumbai during calls.", "timestamp": "2026-01-20T19:00:00", "reliability_score": 0.87},
    {"id": "ev-007", "case_id": "case-003", "source_type": "Cyber Cell Report", "content": "Forensic analysis of ZenoTech Systems servers reveals phishing infrastructure capable of serving 50,000 fake bank login pages simultaneously. Employee Neha Verma's workstation used for C2 server configuration. Foreign operator Chen Wei identified via email metadata.", "timestamp": "2026-02-10T14:00:00", "reliability_score": 0.92},
    {"id": "ev-008", "case_id": "case-005", "source_type": "BSF Field Report", "content": "Discovery of 47 illegal weapons (AK-pattern rifles, pistols, ammunition) buried at GPS coordinates 27.0238°N, 70.9090°E, Thar Desert Zone-7. CFSL forensics matched 3 weapons to Jaipur and Jodhpur bank heists in 2025.", "timestamp": "2026-02-18T11:00:00", "reliability_score": 0.99},
    {"id": "ev-009", "case_id": "case-010", "source_type": "CCTV Footage", "content": "CCTV footage from building #42, Satellite Road shows dark blue Tata Safari GJ01CD7890 parked with engine running from 20:00 to 22:30 on April 9, 2026. Driver not identifiable. Same vehicle not registered in Gujarat transport database.", "timestamp": "2026-04-09T20:00:00", "reliability_score": 0.88},
    {"id": "ev-010", "case_id": "case-001", "source_type": "RTO Record", "content": "Vehicle MH12AB4582 — Toyota Fortuner — registered to Arjun Mehta, Address: 12A, Palm Beach Road, Andheri East, Mumbai. Registration date: June 15, 2022. Insurance valid. No prior traffic violations.", "timestamp": "2022-06-15T00:00:00", "reliability_score": 1.0},
]


# ─── PUBLIC ACCESSOR FUNCTIONS ────────────────────────────────────────────────

def get_mock_cases() -> List[Dict[str, Any]]:
    """Return 10 synthetic investigation cases."""
    return MOCK_CASES


def get_mock_officers() -> List[Dict[str, Any]]:
    """Return prototype officer accounts."""
    return MOCK_OFFICERS


def get_mock_entities(case_id: str = None) -> List[Dict[str, Any]]:
    """Return entities, optionally filtered by case_id."""
    if case_id:
        return [e for e in MOCK_ENTITIES if e.get("case_id") == case_id]
    return MOCK_ENTITIES


def get_mock_relationships(case_id: str = None) -> List[Dict[str, Any]]:
    """Return relationships, optionally filtered by case_id."""
    if case_id:
        return [r for r in MOCK_RELATIONSHIPS if r.get("case_id") == case_id]
    return MOCK_RELATIONSHIPS


def get_mock_timeline(case_id: str) -> List[Dict[str, Any]]:
    """Return timeline events for a case."""
    events = MOCK_TIMELINE.get(case_id, [])
    # Default timeline for cases without specific timelines
    if not events:
        case = next((c for c in MOCK_CASES if c["id"] == case_id), None)
        if case:
            events = [
                {"date": case["created_date"][:10], "event": f"Case opened: {case['title']}", "entity": "Investigating Officer", "entity_id": None, "location": case["location"], "significance": "High", "source": "Case File"},
            ]
    return sorted(events, key=lambda x: x["date"])


def get_mock_hypotheses(case_id: str) -> List[Dict[str, Any]]:
    """Return pre-generated hypotheses for a case."""
    hyps = MOCK_HYPOTHESES.get(case_id, [])
    if not hyps:
        # Generate default hypotheses for cases without pre-defined ones
        case = next((c for c in MOCK_CASES if c["id"] == case_id), None)
        if case:
            hyps = [
                {
                    "id": f"h-{case_id}-default",
                    "case_id": case_id,
                    "description": f"Primary investigative hypothesis: The identified network of entities in {case['location']} is operating an organized criminal enterprise categorized under {case['category']}.",
                    "support_score": 0.70,
                    "contradiction_score": 0.20,
                    "final_score": 0.65,
                    "status": "MEDIUM",
                    "supporting_evidence": [
                        "Multiple entities co-located at suspicious premises",
                        "Financial irregularities detected in entity records",
                        "Communication patterns suggest coordinated activity",
                    ],
                    "contradicting_evidence": [
                        "Insufficient direct evidence linking all suspects",
                        "Alternative explanations for some financial transactions remain plausible",
                    ],
                }
            ]
    return hyps


def get_mock_evidence(case_id: str = None) -> List[Dict[str, Any]]:
    """Return evidence records, optionally filtered by case_id."""
    if case_id:
        return [e for e in MOCK_EVIDENCE if e.get("case_id") == case_id]
    return MOCK_EVIDENCE


def get_mock_graph() -> Dict[str, Any]:
    """Return the full synthetic graph with 100+ nodes and 200+ relationships."""
    return {
        "nodes": MOCK_ENTITIES,
        "edges": MOCK_RELATIONSHIPS,
        "stats": {
            "total_nodes": len(MOCK_ENTITIES),
            "total_edges": len(MOCK_RELATIONSHIPS),
            "cases_covered": 10,
            "cross_case_links": len([r for r in MOCK_RELATIONSHIPS if r["id"].startswith("r-1")]),
        }
    }


def seed_database():
    """
    Seed prototype database with initial test cases and evidence.
    In the in-memory prototype, this is a no-op (data is always available from constants).
    In production, this would insert records into PostgreSQL.
    """
    pass  # In-memory prototype: data accessed directly from constants above
