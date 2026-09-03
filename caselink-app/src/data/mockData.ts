export type CaseStatus = 'Active' | 'Pending' | 'Closed' | 'Archived';
export type CasePriority = 'High' | 'Medium' | 'Low' | 'Critical';
export type CaseType =
  | 'Organized Financial Crime'
  | 'Financial Fraud'
  | 'Cybercrime'
  | 'Smuggling Network'
  | 'Money Laundering'
  | 'Document Forgery'
  | 'Organized Crime';

export interface EvidenceCounts {
  documents: number;
  persons: number;
  vehicles: number;
  locations: number;
  transactions: number;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  type: CaseType;
  location: string;
  status: CaseStatus;
  priority: CasePriority;
  investigator: string;
  assignedUnit: string;
  created: string;
  lastUpdated: string;
  description: string;
  evidenceCounts: EvidenceCounts;
  entityCount: number;
}

export type EntityType = 'Person' | 'Vehicle' | 'Location' | 'Organization' | 'Event' | 'Case';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  confidence: number;
  aliases: string[];
  relatedCases: number;
  locations: number;
  evidenceLinks: number;
  details: Record<string, string | number>;
  roleOrDesignation?: string;
  riskScore?: number;
  riskReasons?: string[];
}

export interface Lead {
  id: string;
  title: string;
  caseId: string;
  confidence: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'New' | 'Under Review' | 'Verified' | 'Dismissed';
  description: string;
  generatedAt: string;
  reasoningSteps: {
    title: string;
    description: string;
    badge: string;
    type: 'signal' | 'vehicle' | 'location' | 'case' | 'communication';
  }[];
  sourceRecords: {
    id: string;
    type: string;
    title: string;
    detail: string;
    date: string;
  }[];
  aiScores: {
    entityMatching: number;
    temporalCompatibility: number;
    geographicCompatibility: number;
    evidenceConsistency: number;
  };
}

export interface Hypothesis {
  id: string;
  title: string;
  description: string;
  confidence: number;
  supportingEvidence: number;
  contradictoryEvidence: number;
  status: 'HIGH PRIORITY' | 'MEDIUM' | 'LOW';
  createdDate: string;
  supportingItems: string[];
  contradictoryItems: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  dateLabel: string;
  eventType: 'Person' | 'Vehicle' | 'Financial' | 'Location' | 'Incident';
  title: string;
  description: string;
  caseId: string;
  location: string;
  relatedEntities: string[];
  significance: 'High' | 'Medium' | 'Low';
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'AUTHORIZED' | 'DENIED';
  ipAddress: string;
}

export interface ActivityData {
  date: string;
  leads: number;
  evidence: number;
  entities: number;
}

export const MOCK_CASES: Case[] = [
  {
    id: 'CASE-2026-01482',
    caseNumber: 'CASE-2026-01482',
    title: 'Financial Network Investigation & Hawala Pipeline',
    type: 'Organized Financial Crime',
    location: 'Mumbai, MH',
    status: 'Active',
    priority: 'High',
    investigator: 'Inspector Rahul Sharma',
    assignedUnit: 'Investigation Unit A',
    created: '12 March 2026',
    lastUpdated: '02 Sep 2026',
    description: 'Cross-border shell entity structuring using Hawala layers and front logistics companies.',
    evidenceCounts: { documents: 24, persons: 17, vehicles: 5, locations: 9, transactions: 32 },
    entityCount: 42,
  },
  {
    id: 'CASE-2026-00891',
    caseNumber: 'CASE-2026-00891',
    title: 'Cross-Border Smuggling & Contraband Network',
    type: 'Smuggling Network',
    location: 'Delhi, DL',
    status: 'Active',
    priority: 'High',
    investigator: 'ACP Vikramaditya Roy',
    assignedUnit: 'Special Task Force 2',
    created: '18 Jan 2026',
    lastUpdated: '28 Aug 2026',
    description: 'Interception of customs evasion syndicate operating across container freight stations.',
    evidenceCounts: { documents: 41, persons: 12, vehicles: 8, locations: 6, transactions: 19 },
    entityCount: 31,
  },
  {
    id: 'CASE-2026-01103',
    caseNumber: 'CASE-2026-01103',
    title: 'Crypto Mule Ring & Infrastructure Compromise',
    type: 'Cybercrime',
    location: 'Bangalore, KA',
    status: 'Pending',
    priority: 'Medium',
    investigator: 'Cyber Analyst Priya Verma',
    assignedUnit: 'Cyber Investigation Cell',
    created: '04 Feb 2026',
    lastUpdated: '30 Aug 2026',
    description: 'Autonomous botnet laundering proceeds through decentralized liquidity pools.',
    evidenceCounts: { documents: 19, persons: 8, vehicles: 2, locations: 4, transactions: 84 },
    entityCount: 22,
  },
  {
    id: 'CASE-2026-00654',
    caseNumber: 'CASE-2026-00654',
    title: 'Real Estate Layering & Forged Bank Guarantees',
    type: 'Money Laundering',
    location: 'Chennai, TN',
    status: 'Active',
    priority: 'High',
    investigator: 'DySP K. Senthil',
    assignedUnit: 'Economic Offences Wing',
    created: '14 Dec 2025',
    lastUpdated: '01 Sep 2026',
    description: 'Forged bank letters used to procure prime commercial assets without verified source of funds.',
    evidenceCounts: { documents: 56, persons: 14, vehicles: 4, locations: 11, transactions: 47 },
    entityCount: 38,
  },
  {
    id: 'CASE-2026-01201',
    caseNumber: 'CASE-2026-01201',
    title: 'Customs Seals & Manifest Forgery Scheme',
    type: 'Document Forgery',
    location: 'Hyderabad, TS',
    status: 'Closed',
    priority: 'Low',
    investigator: 'Inspector Ananya Reddy',
    assignedUnit: 'Commercial Crimes Div',
    created: '10 Nov 2025',
    lastUpdated: '15 Jul 2026',
    description: 'Counterfeit digital export certificates produced using cloned authorized signatory tokens.',
    evidenceCounts: { documents: 33, persons: 6, vehicles: 1, locations: 3, transactions: 12 },
    entityCount: 14,
  },
  {
    id: 'CASE-2026-01399',
    caseNumber: 'CASE-2026-01399',
    title: 'Inland Transit Extortion & Port Syndicate',
    type: 'Organized Crime',
    location: 'Kolkata, WB',
    status: 'Active',
    priority: 'Medium',
    investigator: 'Inspector Sourav Das',
    assignedUnit: 'Anti-Gang Cell',
    created: '22 Feb 2026',
    lastUpdated: '25 Aug 2026',
    description: 'Systematic protection payments demanded from inter-state truck transit operators.',
    evidenceCounts: { documents: 28, persons: 21, vehicles: 9, locations: 7, transactions: 26 },
    entityCount: 45,
  },
];

export const MOCK_ENTITIES: Entity[] = [
  {
    id: 'entity-1',
    name: 'R. Kumar (Raj Kumar)',
    type: 'Person',
    confidence: 87,
    aliases: ['R Kumar', 'Raj Kumar', 'RK Courier'],
    relatedCases: 4,
    locations: 6,
    evidenceLinks: 12,
    roleOrDesignation: 'Key Operative / Transport Coordinator',
    riskScore: 87,
    riskReasons: [
      'Same vehicle MH12AB4582 appeared in 3 related cases',
      'Movement pattern overlaps within 45 min of transaction',
      'Entity similarity detected with historical fugitive profile',
      'Previous location association with Warehouse Zone A',
    ],
    details: {
      phone: '+91 98201 44821',
      identification: 'Aadhaar (verified match)',
      lastSeen: '15 Feb 2026, 03:40 AM',
      passportNo: 'Z9182341 (Alerted)',
    },
  },
  {
    id: 'entity-2',
    name: 'Arjun Mehta',
    type: 'Person',
    confidence: 94,
    aliases: ['A. M. Mehta', 'Arjun Merchant'],
    relatedCases: 3,
    locations: 5,
    evidenceLinks: 18,
    roleOrDesignation: 'Managing Director, Horizon Exports',
    riskScore: 91,
    riskReasons: [
      'Beneficial owner of 4 identified offshore accounts',
      'Direct call logs with suspect transport operators',
      'Repeated travel to free-trade transshipment ports',
    ],
    details: {
      phone: '+91 99100 87654',
      identification: 'PAN: ABCPM4912K',
      lastSeen: '02 Mar 2026, Nariman Point',
    },
  },
  {
    id: 'entity-3',
    name: 'MH12AB4582',
    type: 'Vehicle',
    confidence: 96,
    aliases: ['White Toyota Fortuner', 'MH-12-AB-4582'],
    relatedCases: 3,
    locations: 8,
    evidenceLinks: 9,
    roleOrDesignation: 'Primary Transit Vehicle',
    details: {
      makeModel: 'Toyota Fortuner (White, 2023)',
      registeredTo: 'Horizon Exports Pvt Ltd',
      fastagDetections: '47 tolls in 60 days',
      status: 'Impound order issued',
    },
  },
  {
    id: 'entity-4',
    name: 'Warehouse Zone A',
    type: 'Location',
    confidence: 92,
    aliases: ['Gala 14-B Bhiwandi Logistics Complex'],
    relatedCases: 2,
    locations: 1,
    evidenceLinks: 14,
    roleOrDesignation: 'Suspected Staging & Repacking Hub',
    details: {
      city: 'Bhiwandi / Mumbai Outskirts',
      coordinates: '19.296, 73.063',
      leaseholder: 'ShellCo Finance Nominee',
      cctvCoverage: 'Subpoenaed 90 days',
    },
  },
  {
    id: 'entity-5',
    name: 'Horizon Exports Pvt Ltd',
    type: 'Organization',
    confidence: 89,
    aliases: ['Horizon Trading India', 'HEPL Mumbai'],
    relatedCases: 4,
    locations: 4,
    evidenceLinks: 24,
    roleOrDesignation: 'Registered Import-Export Shell Firm',
    details: {
      registrationNo: 'U51909MH2021PTC368291',
      directors: 'Arjun Mehta, Priya Sharma',
      bankAccounts: '6 active in State Bank & HDFC',
      declaredTurnover: '₹48 Cr (Mismatch with filings)',
    },
  },
  {
    id: 'entity-6',
    name: 'ShellCo Finance Corp',
    type: 'Organization',
    confidence: 83,
    aliases: ['ShellCo Investment Advisors'],
    relatedCases: 2,
    locations: 3,
    evidenceLinks: 16,
    roleOrDesignation: 'Hawala Layering Vehicle',
    details: {
      registeredJurisdiction: 'Port Louis, Mauritius / Mumbai liaison',
      intermediaryBank: 'Standard Chartered Dubai',
      suspiciousFiling: 'STR-2026-0419 by FIU-IND',
    },
  },
  {
    id: 'entity-7',
    name: 'Dharavi Industrial Unit B',
    type: 'Location',
    confidence: 81,
    aliases: ['Tannery Compound 3rd Lane'],
    relatedCases: 2,
    locations: 1,
    evidenceLinks: 7,
    roleOrDesignation: 'Cash Handover Point',
    details: {
      city: 'Mumbai Central',
      coordinates: '19.041, 72.865',
      informantTip: 'Nightly courier drops between 02:00-04:00',
    },
  },
  {
    id: 'entity-8',
    name: 'Cash Handover Incident (Feb 15)',
    type: 'Event',
    confidence: 90,
    aliases: ['Event-2026-0215-01'],
    relatedCases: 1,
    locations: 2,
    evidenceLinks: 11,
    roleOrDesignation: 'Documented Hawala Cash Exchange',
    details: {
      dateTime: '15 Feb 2026, 03:15 AM',
      amountEstimated: '₹1.85 Cr physical currency',
      interceptMethod: 'Technical Surveillance & Visual Spotters',
    },
  },
  {
    id: 'entity-9',
    name: 'DL8CAF2023',
    type: 'Vehicle',
    confidence: 88,
    aliases: ['Silver Honda City', 'DL-8C-AF-2023'],
    relatedCases: 2,
    locations: 5,
    evidenceLinks: 6,
    roleOrDesignation: 'Courier Secondary Vehicle',
    details: {
      makeModel: 'Honda City (Silver, 2022)',
      registeredTo: 'Private Lease Nominee',
      lastSpotted: 'Mumbai-Pune Expressway Toll',
    },
  },
];

export const MOCK_GRAPH_NODES = [
  { id: 'node-person-1', type: 'personNode', position: { x: 260, y: 80 }, data: { label: 'R. Kumar', entityType: 'Person', confidence: 87, subtitle: 'Key Operative' } },
  { id: 'node-person-2', type: 'personNode', position: { x: 620, y: 70 }, data: { label: 'Arjun Mehta', entityType: 'Person', confidence: 94, subtitle: 'Director HEPL' } },
  { id: 'node-vehicle-1', type: 'vehicleNode', position: { x: 240, y: 260 }, data: { label: 'MH12AB4582', entityType: 'Vehicle', confidence: 96, subtitle: 'Toyota Fortuner' } },
  { id: 'node-vehicle-2', type: 'vehicleNode', position: { x: 640, y: 260 }, data: { label: 'DL8CAF2023', entityType: 'Vehicle', confidence: 88, subtitle: 'Honda City' } },
  { id: 'node-loc-1', type: 'locationNode', position: { x: 120, y: 440 }, data: { label: 'Warehouse Zone A', entityType: 'Location', confidence: 92, subtitle: 'Staging Hub' } },
  { id: 'node-loc-2', type: 'locationNode', position: { x: 380, y: 450 }, data: { label: 'Dharavi Unit B', entityType: 'Location', confidence: 81, subtitle: 'Cash Drop' } },
  { id: 'node-org-1', type: 'orgNode', position: { x: 760, y: 440 }, data: { label: 'Horizon Exports', entityType: 'Organization', confidence: 89, subtitle: 'Front Entity' } },
  { id: 'node-org-2', type: 'orgNode', position: { x: 520, y: 560 }, data: { label: 'ShellCo Finance', entityType: 'Organization', confidence: 83, subtitle: 'Layering Co' } },
  { id: 'node-event-1', type: 'eventNode', position: { x: 240, y: 620 }, data: { label: 'Cash Handover', entityType: 'Event', confidence: 90, subtitle: '15 Feb 2026' } },
  { id: 'node-case-1', type: 'caseNode', position: { x: -30, y: 260 }, data: { label: 'CASE-2025-00334', entityType: 'Case', confidence: 95, subtitle: 'Prior Linked Case' } },
];

export const MOCK_GRAPH_EDGES = [
  { id: 'e1', source: 'node-person-1', target: 'node-vehicle-1', label: 'OWNS', animated: true },
  { id: 'e2', source: 'node-person-2', target: 'node-org-1', label: 'DIRECTOR_OF', animated: false },
  { id: 'e3', source: 'node-person-1', target: 'node-person-2', label: 'COMMUNICATED_WITH', animated: true },
  { id: 'e4', source: 'node-vehicle-1', target: 'node-loc-1', label: 'SEEN_AT', animated: true },
  { id: 'e5', source: 'node-vehicle-1', target: 'node-loc-2', label: 'TRAVELLED_TO', animated: false },
  { id: 'e6', source: 'node-loc-1', target: 'node-case-1', label: 'RELATED_CASE', animated: false },
  { id: 'e7', source: 'node-org-1', target: 'node-org-2', label: 'TRANSACTION_LINK', animated: true },
  { id: 'e8', source: 'node-org-2', target: 'node-event-1', label: 'FINANCED', animated: false },
  { id: 'e9', source: 'node-loc-2', target: 'node-event-1', label: 'OCCURRED_AT', animated: false },
  { id: 'e10', source: 'node-vehicle-2', target: 'node-org-1', label: 'REGISTERED_TO', animated: false },
  { id: 'e11', source: 'node-person-1', target: 'node-event-1', label: 'PRESENT_AT', animated: true },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'LEAD-2026-089',
    title: 'Person A (Arjun Mehta) linked to Case B via Financial Network',
    caseId: 'CASE-2026-01482',
    confidence: 87,
    priority: 'HIGH',
    status: 'New',
    description: 'Vehicle match and transaction correlation tie suspect to previous contraband FIR.',
    generatedAt: '12 Mar 2026, 11:24 AM',
    reasoningSteps: [
      {
        title: 'Signal Detected',
        description: 'Automatic plate scan matched vehicle MH12AB4582 at Bhiwandi checkpoint.',
        badge: 'Automated ANPR',
        type: 'signal',
      },
      {
        title: 'Vehicle Match',
        description: 'Same vehicle registered under Horizon Exports appeared in 3 distinct FIR records.',
        badge: 'Cross-Case Match',
        type: 'vehicle',
      },
      {
        title: 'Location Compatibility',
        description: 'Vehicle GPS and cell tower pings placed suspect within 400m of Warehouse Zone A.',
        badge: 'Spatial Coincidence: 96%',
        type: 'location',
      },
      {
        title: 'Historical Case Similarity',
        description: 'Laundering pattern and invoicing structure shares 89% structural similarity with CASE-2025-00334.',
        badge: 'Pattern AI Match',
        type: 'case',
      },
      {
        title: 'Communication Link',
        description: 'CDR analysis revealed 14 calls between R. Kumar and Arjun Mehta prior to cash transit.',
        badge: 'CDR Intercept Verified',
        type: 'communication',
      },
    ],
    sourceRecords: [
      { id: 'DOC-102', type: 'Document', title: 'Financial Statement Q4 2025', detail: 'ShellCo wire transfer remittance memo of ₹1.85 Cr', date: '10 Jan 2026' },
      { id: 'FIR-2026-55', type: 'Official Report', title: 'Bhiwandi Station General Diary', detail: 'Sighting and complaint on unauthorized night logistics', date: '14 Feb 2026' },
      { id: 'REG-889', type: 'Registry', title: 'State Transport RTO Database', detail: 'Registration of MH12AB4582 to Horizon Exports Pvt Ltd', date: '12 Sep 2023' },
      { id: 'CDR-445', type: 'Telecommunications', title: 'Telecom Tower Cell Dump Analysis', detail: 'Handset IMEI correlation at Dharavi and Bhiwandi towers', date: '15 Feb 2026' },
    ],
    aiScores: {
      entityMatching: 87,
      temporalCompatibility: 92,
      geographicCompatibility: 81,
      evidenceConsistency: 76,
    },
  },
  {
    id: 'LEAD-2026-092',
    title: 'ShellCo Inward Wire Transfer Structuring Pattern',
    caseId: 'CASE-2026-01482',
    confidence: 84,
    priority: 'HIGH',
    status: 'Under Review',
    description: '17 consecutive transactions below reporting threshold of ₹10 Lakhs within 48 hours.',
    generatedAt: '12 Mar 2026, 09:15 AM',
    reasoningSteps: [
      { title: 'Threshold Detection', description: 'Repeated deposits of ₹9.85 Lakhs across 4 branch locations.', badge: 'FIU Filter Trigger', type: 'signal' },
      { title: 'Account Clustering', description: 'All accounts linked to single common authorized mobile number.', badge: 'Entity Graph Match', type: 'communication' },
    ],
    sourceRecords: [
      { id: 'STR-2026-0419', type: 'Intelligence', title: 'FIU-IND Suspicious Transaction Alert', detail: 'Rapid structuring across private banks', date: '01 Mar 2026' },
    ],
    aiScores: {
      entityMatching: 89,
      temporalCompatibility: 95,
      geographicCompatibility: 79,
      evidenceConsistency: 82,
    },
  },
  {
    id: 'LEAD-2026-095',
    title: 'Secondary Courier Route Deviation Identified',
    caseId: 'CASE-2026-01482',
    confidence: 68,
    priority: 'MEDIUM',
    status: 'New',
    description: 'Vehicle DL8CAF2023 avoided regular toll cameras taking rural bypass road.',
    generatedAt: '11 Mar 2026, 04:50 PM',
    reasoningSteps: [
      { title: 'Route Anomaly', description: 'FASTag gap of 4.5 hours between adjoining toll plazas.', badge: 'Trajectory Anomaly', type: 'vehicle' },
    ],
    sourceRecords: [
      { id: 'TOLL-LOG-119', type: 'Sensor', title: 'National Highways Toll Transit Log', detail: 'Plaza 14 skipped via Old State Highway 8', date: '14 Feb 2026' },
    ],
    aiScores: {
      entityMatching: 72,
      temporalCompatibility: 64,
      geographicCompatibility: 88,
      evidenceConsistency: 70,
    },
  },
];

export const MOCK_HYPOTHESES: Hypothesis[] = [
  {
    id: 'hyp-1',
    title: 'Coordinated Hawala Syndicate Under Horizon Exports',
    description: 'Arjun Mehta orchestrated illicit cash transshipment via R. Kumar using front export consignments and Mauritius shell accounts.',
    confidence: 86,
    supportingEvidence: 8,
    contradictoryEvidence: 2,
    status: 'HIGH PRIORITY',
    createdDate: '12 Mar 2026',
    supportingItems: [
      'Vehicle MH12AB4582 registered to Horizon Exports present at both cash handover and warehouse staging',
      '14 direct telecommunication exchanges between Mehta and Kumar prior to midnight cash run',
      'Transaction sequence of ₹1.85 Cr matches offshore remittance memo Document-102',
      'Bhiwandi warehouse lease directly indemnified by shell company nominee',
      'Cellular tower triangulation places both handsets at scene simultaneously',
      'Historical modus operandi matches convictions in CASE-2025-00334',
      'FASTag transits align with cash deposit timestamps',
      'Witness statement from customs forwarder confirms non-standard sealed cargo',
    ],
    contradictoryItems: [
      'Mehta claims to have been on international flight during first transaction date',
      'Vehicle GPS device shows 2-hour telemetry signal loss between 01:00-03:00',
    ],
  },
  {
    id: 'hyp-2',
    title: 'Independent Parallel Rogue Logistics Theft',
    description: 'Driver/courier R. Kumar operated independently without knowledge or direction of company directorship.',
    confidence: 42,
    supportingEvidence: 3,
    contradictoryEvidence: 5,
    status: 'LOW',
    createdDate: '11 Mar 2026',
    supportingItems: [
      'Vehicle was taken outside of standard operating dispatch hours',
      'Kumar used secondary personal SIM card for local coordination',
      'No formal cargo declaration manifest was registered for that specific night',
    ],
    contradictoryItems: [
      'Mehta authorized emergency fuel card transactions at 02:45 AM during the run',
      'Funds were wired directly to Mehta family offshore trust 72 hours later',
      'Kumar had no personal financial capacity to structure ₹1.85 Cr consignment',
      'Mehta hired defense counsel for Kumar immediately following detention',
      'Encrypted chat logs show direct dispatch instructions from Mehta device',
    ],
  },
  {
    id: 'hyp-3',
    title: 'Intermediary Hawala Token Brokered by Third-Party Syndicate',
    description: 'A Mumbai-based bullion broker served as escrow intermediary between ShellCo and physical couriers.',
    confidence: 71,
    supportingEvidence: 6,
    contradictoryEvidence: 3,
    status: 'MEDIUM',
    createdDate: '10 Mar 2026',
    supportingItems: [
      'Serial numbers on physical currency recovered match known bullion market markers',
      'Call intercepts reference "half-note" exchange token convention',
      'Three brief stops at Zaveri Bazaar jewelry shop recorded in vehicle log',
      'Bank withdrawals align with gold rate fluctuation adjustments',
      'Prior association between Kumar and bullion courier in 2024 records',
      'WhatsApp audio snippet recovered mentioning token delivery confirmation',
    ],
    contradictoryItems: [
      'No physical bullion recovered during initial raid on Bhiwandi gala',
      'Shop owner claims transactions were retail consumer gold purchases',
      'Surveillance tape outside bullion shop was overwritten during routine cycle',
    ],
  },
  {
    id: 'hyp-4',
    title: 'Legitimate Transit Disrupted by Unrelated Opportunistic Extortion',
    description: 'Cash transit was regular legal trade settlement ambushed by unauthorized criminal elements.',
    confidence: 28,
    supportingEvidence: 2,
    contradictoryEvidence: 7,
    status: 'LOW',
    createdDate: '09 Mar 2026',
    supportingItems: [
      'Unidentified vehicle DL8CAF2023 trailed the transit Fortuner for 12 kilometers',
      '911/112 emergency call placed from nearby toll reporting reckless driving',
    ],
    contradictoryItems: [
      'Cash was not taken; exchange completed without violence or robbery indicators',
      'Drivers exchanged handshakes and documentation packets on CCTV footage',
      'No commercial invoices exist justifying cash transit in excess of legal statutory limits',
      'Pre-negotiated encrypted passcodes verified on suspect phones',
      'Both parties departed together toward Bhiwandi staging facility',
      'No police complaint filed by either party regarding alleged extortion',
      'Bank accounts were pre-cleared for inward remittance prior to interception',
    ],
  },
];

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-1',
    date: '2026-01-10',
    dateLabel: 'Jan 10, 2026',
    eventType: 'Vehicle',
    title: 'Vehicle MH12AB4582 Registered & Fitted with GPS',
    description: 'Commercial registration completed under Horizon Exports Pvt Ltd with transponder tracker.',
    caseId: 'CASE-2026-01482',
    location: 'RTO Pune / Mumbai Expressway Corridor',
    relatedEntities: ['MH12AB4582', 'Horizon Exports Pvt Ltd'],
    significance: 'Medium',
  },
  {
    id: 'evt-2',
    date: '2026-01-18',
    dateLabel: 'Jan 18, 2026',
    eventType: 'Person',
    title: 'Person A (R. Kumar) Movement Detected at Port Perimeter',
    description: 'Automated ANPR and checkpoint face-match flagged Kumar entering JNPT Port Container Gate 3.',
    caseId: 'CASE-2026-01482',
    location: 'JNPT Port Area, Navi Mumbai',
    relatedEntities: ['R. Kumar', 'MH12AB4582'],
    significance: 'High',
  },
  {
    id: 'evt-3',
    date: '2026-01-24',
    dateLabel: 'Jan 24, 2026',
    eventType: 'Financial',
    title: 'First Offshore Wire of ₹65 Lakhs Executed',
    description: 'ShellCo Finance Mauritius credited Horizon Exports account at State Bank Commercial branch.',
    caseId: 'CASE-2026-01482',
    location: 'Nariman Point Financial District, Mumbai',
    relatedEntities: ['ShellCo Finance Corp', 'Horizon Exports Pvt Ltd', 'Arjun Mehta'],
    significance: 'High',
  },
  {
    id: 'evt-4',
    date: '2026-02-02',
    dateLabel: 'Feb 02, 2026',
    eventType: 'Financial',
    title: 'Rapid Structuring: 6 Cash Withdrawals at Multiple ATMs',
    description: 'Withdrawals of ₹1.95 Lakhs spaced 18 minutes apart executed across South Mumbai branches.',
    caseId: 'CASE-2026-01482',
    location: 'Fort & Colaba Branch Hub, Mumbai',
    relatedEntities: ['ShellCo Finance Corp', 'R. Kumar'],
    significance: 'High',
  },
  {
    id: 'evt-5',
    date: '2026-02-08',
    dateLabel: 'Feb 08, 2026',
    eventType: 'Location',
    title: 'Lease Executed on Bhiwandi Warehouse Zone A',
    description: 'Commercial agreement executed under forged authorization certificate by front entity.',
    caseId: 'CASE-2026-01482',
    location: 'Warehouse Zone A, Bhiwandi',
    relatedEntities: ['Warehouse Zone A', 'Horizon Exports Pvt Ltd'],
    significance: 'Medium',
  },
  {
    id: 'evt-6',
    date: '2026-02-15',
    dateLabel: 'Feb 15, 2026',
    eventType: 'Incident',
    title: 'Documented Cash Handover Incident at Dharavi Compound',
    description: 'Physical exchange of ₹1.85 Cr cash cartons between vehicle MH12AB4582 and secondary couriers.',
    caseId: 'CASE-2026-01482',
    location: 'Dharavi Industrial Unit B, Mumbai',
    relatedEntities: ['R. Kumar', 'MH12AB4582', 'Dharavi Industrial Unit B'],
    significance: 'High',
  },
  {
    id: 'evt-7',
    date: '2026-02-21',
    dateLabel: 'Feb 21, 2026',
    eventType: 'Person',
    title: 'Arjun Mehta Departs for Dubai Trade Conference',
    description: 'Immigration clearance at Mumbai T2 International Departure logged on business visa.',
    caseId: 'CASE-2026-01482',
    location: 'CSMIA Terminal 2, Mumbai',
    relatedEntities: ['Arjun Mehta'],
    significance: 'Medium',
  },
  {
    id: 'evt-8',
    date: '2026-02-28',
    dateLabel: 'Feb 28, 2026',
    eventType: 'Vehicle',
    title: 'Secondary Vehicle DL8CAF2023 Intercepted at Expressway Toll',
    description: 'Vehicle searched under warrant; concealed ledger documents and encrypted thumb drives seized.',
    caseId: 'CASE-2026-01482',
    location: 'Khalapur Toll Plaza, Mumbai-Pune Expressway',
    relatedEntities: ['DL8CAF2023', 'Horizon Exports Pvt Ltd'],
    significance: 'High',
  },
  {
    id: 'evt-9',
    date: '2026-03-02',
    dateLabel: 'Mar 02, 2026',
    eventType: 'Incident',
    title: 'Formal FIR-2026-55 Registered by Special Cell',
    description: 'Official case initiation following forensic review of seized digital media and transaction links.',
    caseId: 'CASE-2026-01482',
    location: 'Special Crime Branch Headquarters, Mumbai',
    relatedEntities: ['CASE-2026-01482', 'Arjun Mehta', 'R. Kumar'],
    significance: 'High',
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-001', user: 'Inspector Rahul Sharma', role: 'Lead Investigator', action: 'Accessed Case Workspace & Graph', resource: 'CASE-2026-01482', timestamp: '12:45 PM, 02 Sep 2026', status: 'AUTHORIZED', ipAddress: '10.24.18.91' },
  { id: 'log-002', user: 'Inspector Rahul Sharma', role: 'Lead Investigator', action: 'Viewed Evidence File Document-102', resource: 'DOC-102 (Financial Q4)', timestamp: '12:48 PM, 02 Sep 2026', status: 'AUTHORIZED', ipAddress: '10.24.18.91' },
  { id: 'log-003', user: 'Priya Sharma', role: 'Analyst', action: 'Queried ANPR Trajectory Database', resource: 'Vehicle MH12AB4582', timestamp: '11:32 AM, 02 Sep 2026', status: 'AUTHORIZED', ipAddress: '10.24.18.104' },
  { id: 'log-004', user: 'Guest_Analyst_External', role: 'Analyst', action: 'Attempted Raw CDR Decryption Export', resource: 'CDR-445 Intercepts', timestamp: '10:14 AM, 02 Sep 2026', status: 'DENIED', ipAddress: '192.168.1.182' },
  { id: 'log-005', user: 'ACP Vikram Nair', role: 'Supervisor', action: 'Approved Warrant Application Lead-089', resource: 'LEAD-2026-089', timestamp: '09:20 AM, 02 Sep 2026', status: 'AUTHORIZED', ipAddress: '10.24.12.05' },
  { id: 'log-006', user: 'Sneha Kulkarni', role: 'Administrator', action: 'Updated Investigator Access Role Bindings', resource: 'Role Matrix Unit A', timestamp: '08:45 AM, 02 Sep 2026', status: 'AUTHORIZED', ipAddress: '10.24.10.02' },
  { id: 'log-007', user: 'Inspector Rahul Sharma', role: 'Lead Investigator', action: 'Generated Hypothesis Engine Score Matrix', resource: 'HYP-1 Coordinated Hawala', timestamp: '08:12 AM, 02 Sep 2026', status: 'AUTHORIZED', ipAddress: '10.24.18.91' },
  { id: 'log-008', user: 'Priya Sharma', role: 'Analyst', action: 'Exported Geospatial Incident Hotspot Map', resource: 'Map Layer Bhiwandi-Dharavi', timestamp: '07:30 PM, 01 Sep 2026', status: 'AUTHORIZED', ipAddress: '10.24.18.104' },
  { id: 'log-009', user: 'Terminated_ID_0099', role: 'Analyst', action: 'Unauthorized Login Attempt with Revoked Cert', resource: 'Auth Gateway', timestamp: '03:18 AM, 01 Sep 2026', status: 'DENIED', ipAddress: '49.36.112.44' },
  { id: 'log-010', user: 'Inspector Rahul Sharma', role: 'Lead Investigator', action: 'Generated Investigation Summary Report', resource: 'REPORT-CASE-01482-V1', timestamp: '05:22 PM, 31 Aug 2026', status: 'AUTHORIZED', ipAddress: '10.24.18.91' },
  { id: 'log-011', user: 'Rahul Joshi', role: 'Analyst', action: 'Linked Entity R. Kumar to Previous Conviction', resource: 'CASE-2025-00334', timestamp: '02:15 PM, 31 Aug 2026', status: 'AUTHORIZED', ipAddress: '10.24.18.118' },
  { id: 'log-012', user: 'ACP Vikram Nair', role: 'Supervisor', action: 'Reviewed Audit Trail Integrity Hash', resource: 'Ledger Block #88219', timestamp: '09:00 AM, 31 Aug 2026', status: 'AUTHORIZED', ipAddress: '10.24.12.05' },
];

function generateActivityData(): ActivityData[] {
  const data: ActivityData[] = [];
  const now = new Date(2026, 8, 2);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    data.push({
      date: label,
      leads: Math.floor(Math.random() * 8) + 1,
      evidence: Math.floor(Math.random() * 25) + 5,
      entities: Math.floor(Math.random() * 15) + 3,
    });
  }
  return data;
}

export const MOCK_ACTIVITY_DATA: ActivityData[] = generateActivityData();

export const ENTITY_BREAKDOWN = [
  { name: 'Persons', value: 6420, color: '#f97316' },
  { name: 'Vehicles', value: 3210, color: '#3b82f6' },
  { name: 'Locations', value: 4882, color: '#22c55e' },
  { name: 'Organizations', value: 2890, color: '#a855f7' },
  { name: 'Events', value: 1140, color: '#f59e0b' },
];
