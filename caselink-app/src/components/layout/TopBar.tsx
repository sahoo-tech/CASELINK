import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Bell, Zap, Server } from 'lucide-react';
import BackendStatusModal from '../common/BackendStatusModal';
import { pingBackendHealth } from '../../services/apiClient';

interface TopBarProps {
  sidebarCollapsed: boolean;
}

const PATH_LABELS: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/cases':      'Cases',
  '/workspace':  'Evidence Graph',
  '/entities':   'Entities',
  '/timeline':   'Timeline Analysis',
  '/geospatial': 'Geospatial View',
  '/hypothesis': 'Hypothesis Engine',
  '/reports':    'Reports',
  '/admin':      'Audit Logs',
  '/settings':   'Settings',
};

function getPageLabel(pathname: string): string {
  if (PATH_LABELS[pathname]) return PATH_LABELS[pathname];
  const match = Object.keys(PATH_LABELS).find((key) =>
    pathname.startsWith(key + '/')
  );
  return match ? PATH_LABELS[match] : 'CASELINK';
}

const TopBar: React.FC<TopBarProps> = ({ sidebarCollapsed: _sidebarCollapsed }) => {
  const location = useLocation();
  const pageLabel = getPageLabel(location.pathname);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // Check health on load and periodically
  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const res = await pingBackendHealth();
      if (isMounted) {
        setBackendHealthy(res.healthy);
      }
    };
    check();
    const interval = setInterval(check, 25000); // Check every 25s

    // Listen for custom URL change
    const onUrlChanged = () => check();
    window.addEventListener('caselink_api_url_changed', onUrlChanged);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('caselink_api_url_changed', onUrlChanged);
    };
  }, []);

  return (
    <>
      <header className="flex items-center justify-between h-14 px-4 sm:px-5 bg-[#0B1F3A] border-b border-[#1E3A5F] shrink-0 z-10 relative gap-3">
        {/* Left: Active Investigation Badge + Backend Status */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-widest whitespace-nowrap hidden sm:block">
            Active Investigation
          </span>
          <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded whitespace-nowrap">
            CASE-2026-01482
          </span>

          {/* Backend Status & Render Wake-Up Button (Cleanly integrated on left to avoid any collision) */}
          <button
            onClick={() => setIsBackendModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all shadow-sm shrink-0 ${
              backendHealthy === true
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                : backendHealthy === false
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25 animate-pulse'
                : 'bg-blue-500/15 text-blue-400 border-blue-500/40 hover:bg-blue-500/25'
            }`}
            title="Click to check backend status or send wake-up signal to Render"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy === true
                  ? 'bg-emerald-400'
                  : backendHealthy === false
                  ? 'bg-amber-400'
                  : 'bg-blue-400'
              }`}
            />
            <span className="whitespace-nowrap">
              {backendHealthy === true
                ? 'Backend: Ready'
                : backendHealthy === false
                ? 'Wake Up Backend'
                : 'Checking Server...'}
            </span>
            <Zap size={11} className={backendHealthy === false ? 'text-amber-400 animate-bounce' : 'text-slate-400'} />
          </button>
        </div>

        {/* Center: Breadcrumb (Clean flex flow, never overlaps) */}
        <div className="hidden xl:flex items-center justify-center flex-1 gap-1.5 text-xs text-slate-400 font-medium select-none pointer-events-none">
          <span className="text-slate-600">CASELINK</span>
          <span className="text-slate-700">/</span>
          <span className="text-slate-200">{pageLabel}</span>
        </div>

        {/* Right: Status + Officer + Notifications */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Authorized Session */}
          <div className="items-center gap-2 hidden lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-xs font-semibold tracking-wide whitespace-nowrap">
              AUTHORIZED SESSION
            </span>
          </div>

          <div className="h-6 w-px bg-[#1E3A5F] hidden md:block" />

          {/* Officer Info */}
          <div className="items-center gap-2 hidden md:flex">
            <Shield size={14} className="text-blue-400 shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-slate-200 text-xs font-semibold whitespace-nowrap">
                ACP Vikram Sharma
              </span>
              <span className="text-slate-500 text-[10px] whitespace-nowrap">
                CBI · Investigator
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-[#1E3A5F]" />

          {/* Notification Bell */}
          <button
            className="relative p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-[#152A46] transition-colors duration-150"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
              3
            </span>
          </button>

          {/* Avatar */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold select-none shrink-0">
            VS
          </div>
        </div>
      </header>

      {/* Backend Status & Render Wake-Up Modal */}
      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
    </>
  );
};

export default TopBar;
