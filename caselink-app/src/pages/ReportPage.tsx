import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Printer,
  Download,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Calendar,
  Layers,
  MapPin,
  Car,
  DollarSign,
  Edit3,
} from 'lucide-react';
import {
  MOCK_CASES,
  MOCK_ENTITIES,
  MOCK_HYPOTHESES,
  type Case,
} from '../data/mockData';

export const ReportPage: React.FC = () => {
  const currentCase: Case = MOCK_CASES[0];
  const [classification, setClassification] = useState<'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET'>('RESTRICTED');
  const [reportType, setReportType] = useState<string>('Investigation Summary Dossier');
  const [notes, setNotes] = useState<string>(
    'Primary suspect R. Kumar remains under technical surveillance. Recommended immediate subpoena for offshore correspondent banking records linked to ShellCo Finance Corp. Next inter-agency review scheduled for 15 Sep 2026.'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header (Hidden when printing) ───────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Investigation Report & Dossier Generator
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              OFFICIAL GOVERNMENT DISCLOSURE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized evidentiary summary formatted for supervisory review, legal prosecution, and inter-agency coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-600/25"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF Dossier
          </button>
        </div>
      </div>

      {/* ── Two-Column Layout: Controls vs Report Preview ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Configuration & Parameters (Hidden in print) */}
        <div className="lg:col-span-4 bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4 print:hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-[#1E3A5F] pb-3">
            Dossier Specifications
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block font-semibold mb-1">
                Classification Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['RESTRICTED', 'CONFIDENTIAL', 'SECRET'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setClassification(level)}
                    className={`py-1.5 px-2 rounded text-[10px] font-bold border transition-all ${
                      classification === level
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : 'bg-[#152A46] text-slate-400 border-[#1E3A5F]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block font-semibold mb-1">
                Report Template
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-[#152A46] border border-[#1E3A5F] text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option>Investigation Summary Dossier</option>
                <option>Court Evidentiary Excerpt (Section 65B)</option>
                <option>Inter-Agency Intelligence Brief</option>
                <option>Asset Tracing & Hawala Flow Analysis</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block font-semibold mb-1">
                Investigator Final Assessment & Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full bg-[#152A46] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* RIGHT / MAIN: Printable Government Grade Dossier */}
        <div className="lg:col-span-8 bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-8 shadow-2xl space-y-6 text-slate-200 font-sans print:border-0 print:p-0 print:bg-white print:text-black">
          {/* Header Banner & Classification Stamp */}
          <div className="flex items-start justify-between border-b-2 border-[#1E3A5F] pb-4 print:border-black">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  CL
                </div>
                <h2 className="text-lg font-extrabold tracking-widest text-white print:text-black uppercase">
                  CASELINK INTELLIGENCE
                </h2>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-700">
                Department of Investigation · Intelligence Analysis Wing
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 rounded border-2 border-red-500 text-red-500 font-bold text-xs uppercase tracking-widest print:border-red-700 print:text-red-700">
                {classification}
              </div>
              <p className="text-[10px] font-mono text-slate-400 print:text-slate-600 mt-1">
                REF: {currentCase.caseNumber}-DOSSIER-V1
              </p>
            </div>
          </div>

          {/* Section 1: Case Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 print:text-blue-900 uppercase tracking-wider border-b border-[#1E3A5F] pb-1">
              1. Case Overview & Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#152A46]/60 print:bg-slate-100 p-3 rounded-lg border border-[#1E3A5F] print:border-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase">
                  Case Number
                </span>
                <span className="font-mono font-bold text-white print:text-black">
                  {currentCase.caseNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase">
                  Classification
                </span>
                <span className="font-semibold text-slate-200 print:text-black">
                  {currentCase.type}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase">
                  Lead Officer
                </span>
                <span className="font-semibold text-slate-200 print:text-black">
                  {currentCase.investigator}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block uppercase">
                  Jurisdiction
                </span>
                <span className="font-semibold text-slate-200 print:text-black">
                  {currentCase.location}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Key Connected Entities */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 print:text-blue-900 uppercase tracking-wider border-b border-[#1E3A5F] pb-1">
              2. Verified Connected Entities & Confidence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {MOCK_ENTITIES.slice(0, 3).map((entity) => (
                <div
                  key={entity.id}
                  className="bg-[#152A46] print:bg-slate-50 border border-[#1E3A5F] print:border-slate-300 p-3 rounded-lg space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-orange-400 print:text-orange-800">
                      {entity.type}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-green-400 print:text-green-800">
                      {entity.confidence}% Match
                    </span>
                  </div>
                  <h4 className="font-bold text-white print:text-black text-xs truncate">
                    {entity.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 truncate">
                    {entity.roleOrDesignation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Hypothesis Ranking */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 print:text-blue-900 uppercase tracking-wider border-b border-[#1E3A5F] pb-1">
              3. Competing Investigation Hypotheses Matrix
            </h3>
            <div className="space-y-2 text-xs">
              {MOCK_HYPOTHESES.slice(0, 2).map((hyp) => (
                <div
                  key={hyp.id}
                  className="bg-[#152A46] print:bg-slate-50 border border-[#1E3A5F] print:border-slate-300 p-3 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white print:text-black text-xs">{hyp.title}</h4>
                    <span className="font-mono text-xs font-bold text-green-400 print:text-green-800">
                      {hyp.confidence}% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 print:text-slate-700 leading-relaxed">
                    {hyp.description}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-semibold">
                    <span className="text-green-400 print:text-green-700">
                      ✓ Supporting: {hyp.supportingEvidence} factors
                    </span>
                    <span className="text-red-400 print:text-red-700">
                      ✕ Contradictory: {hyp.contradictoryEvidence} factors
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Supporting vs Contradictory Evidence */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 print:text-blue-900 uppercase tracking-wider border-b border-[#1E3A5F] pb-1">
              4. Corroborating Forensic Evidence
            </h3>
            <ul className="text-[11px] text-slate-300 print:text-slate-800 space-y-1.5 pl-4 list-disc leading-relaxed">
              <li>
                <span className="font-bold text-white print:text-black">Document-102:</span> Wire remittance record matching ₹1.85 Cr cash allocation.
              </li>
              <li>
                <span className="font-bold text-white print:text-black">FIR-2026-55:</span> Sighting of transit vehicle MH12AB4582 at Bhiwandi complex.
              </li>
              <li>
                <span className="font-bold text-white print:text-black">Vehicle Registry-889:</span> Official ownership registered to Horizon Exports Pvt Ltd.
              </li>
              <li>
                <span className="font-bold text-white print:text-black">Telecommunications Cell Dump:</span> Simultaneous handset presence at handover locus.
              </li>
            </ul>
          </div>

          {/* Section 5: Investigator Assessment Notes */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 print:text-blue-900 uppercase tracking-wider border-b border-[#1E3A5F] pb-1">
              5. Officer Concluding Notes & Instructions
            </h3>
            <p className="text-xs text-slate-300 print:text-slate-900 italic leading-relaxed bg-[#152A46]/60 print:bg-slate-50 p-3 rounded border border-[#1E3A5F] print:border-slate-300">
              &ldquo;{notes}&rdquo;
            </p>
          </div>

          {/* Signoff / Seal Block */}
          <div className="pt-6 border-t border-[#1E3A5F] print:border-black flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white print:text-black">Inspector Rahul Sharma</p>
              <p className="text-[10px] text-slate-400 print:text-slate-600">Lead Investigator, Unit A</p>
              <p className="text-[9px] font-mono text-slate-500">DIGITAL SIGNATURE VERIFIED: 0x8F91B24</p>
            </div>

            <div className="text-right">
              <div className="w-24 h-12 border border-dashed border-slate-600 print:border-black flex items-center justify-center text-[9px] text-slate-500 uppercase">
                Official Seal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
