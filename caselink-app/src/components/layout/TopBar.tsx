import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, Bell, Zap, LogOut, Settings, ChevronDown, User, ExternalLink } from 'lucide-react';
import BackendStatusModal from '../common/BackendStatusModal';
import { pingBackendHealth } from '../../services/apiClient';
import userService, { type AuthUser } from '../../services/userService';

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

function getInitials(name: string): string {
  if (!name) return 'VS';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // Skip titles like ACP, Inspector, Analyst, Director if multiple words exist
  const effectiveParts = parts.filter((p) => !['ACP', 'INSP', 'ANL', 'DIR', 'OFF'].includes(p.toUpperCase()));
  const target = effectiveParts.length >= 2 ? effectiveParts : parts;
  return target.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

const TopBar: React.FC<TopBarProps> = ({ sidebarCollapsed: _sidebarCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageLabel = getPageLabel(location.pathname);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(userService.getCurrentUser());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update current user if storage changes or on mount
  useEffect(() => {
    setCurrentUser(userService.getCurrentUser());
  }, [location.pathname]);

  // Check health on load and periodically with fast ping
  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const res = await pingBackendHealth({ timeoutMs: 1600 });
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

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    userService.logout();
    navigate('/login');
  };

  const officerName = currentUser?.name || 'ACP Vikram Sharma';
  const officerRole = `${currentUser?.department || 'CBI'} · ${currentUser?.role || 'Investigator'}`;
  const initials = getInitials(officerName);

  return (
    <>
      <header className="flex items-center justify-between h-14 px-4 sm:px-5 bg-[#0B1F3A] border-b border-[#1E3A5F] shrink-0 z-20 relative gap-3">
        {/* Left: Active Investigation Badge + Backend Status */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <span className="text-slate-400 text-xs font-medium uppercase tracking-widest whitespace-nowrap hidden sm:block">
            Active Investigation
          </span>
          <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded whitespace-nowrap">
            CASE-2026-01482
          </span>

          {/* Backend Status & Fast Wake-Up Button */}
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

        {/* Right: Status + Officer Profile + Logout */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Authorized Session */}
          <div className="items-center gap-2 hidden lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-xs font-semibold tracking-wide whitespace-nowrap">
              AUTHORIZED
            </span>
          </div>

          <div className="h-6 w-px bg-[#1E3A5F] hidden md:block" />

          {/* Officer Profile Interactive Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#152A46] transition-colors duration-150 text-left group"
              aria-label="User profile menu"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold select-none shrink-0 transition-colors shadow-sm">
                {initials}
              </div>

              <div className="flex-col leading-tight hidden md:flex">
                <span className="text-slate-200 text-xs font-semibold whitespace-nowrap group-hover:text-white transition-colors">
                  {officerName}
                </span>
                <span className="text-slate-500 text-[10px] whitespace-nowrap">
                  {officerRole}
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180 text-blue-400' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#0B1F3A] border border-[#1E3A5F] shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                {/* Officer Meta Header */}
                <div className="px-4 py-2.5 border-b border-[#1E3A5F] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{officerName}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      {currentUser?.badgeNumber || 'CBI-42109'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{officerRole}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono pt-0.5">
                    <Shield size={11} />
                    <span>Clearance: TOP SECRET // L4</span>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-[#152A46] transition-colors"
                  >
                    <Settings size={14} className="text-blue-400" />
                    <span>System & Profile Settings</span>
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-[#152A46] transition-colors"
                  >
                    <Shield size={14} className="text-slate-400" />
                    <span>Audit Registry & Roles</span>
                  </Link>
                </div>

                <div className="border-t border-[#1E3A5F] my-1" />

                {/* Direct Logout Action */}
                <div className="px-2 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white transition-all duration-150 font-semibold group"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                      <span>Log Out Session</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-400 group-hover:text-red-100">Exit</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#1E3A5F]" />

          {/* Quick Direct Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all duration-150"
            title="Log Out Session and return to Login"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
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
