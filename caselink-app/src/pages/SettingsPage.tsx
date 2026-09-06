import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Server,
  Zap,
  Sliders,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  RotateCcw,
  Wifi,
  WifiOff,
  Activity,
  KeyRound,
  FileText,
  BadgeCheck,
  Smartphone,
  Mail,
  Building,
} from 'lucide-react';
import userService, { type AuthUser } from '../services/userService';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  pingBackendHealth,
  wakeUpBackend,
  testBackendInteraction,
  isOfflineModeEnabled,
  setOfflineModeEnabled,
  DEFAULT_DEV_URL,
  DEFAULT_RENDER_URL,
  type HealthPingResult,
} from '../services/apiClient';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(userService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'profile' | 'backend' | 'workspace' | 'security'>('profile');

  // Profile Form States
  const [displayName, setDisplayName] = useState(currentUser?.name || 'ACP Vikram Sharma');
  const [department, setDepartment] = useState(currentUser?.department || 'CBI');
  const [officialEmail, setOfficialEmail] = useState('v.sharma@cbi.gov.in');
  const [securePhone, setSecurePhone] = useState('+91 11 2436 0000');
  const [deskUnit, setDeskUnit] = useState('Special Crime Division - Unit IV');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Backend Connectivity States
  const [currentUrl, setCurrentUrl] = useState<string>(getApiBaseUrl());
  const [customInputUrl, setCustomInputUrl] = useState<string>(getApiBaseUrl());
  const [pingResult, setPingResult] = useState<HealthPingResult | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [wakeAttempt, setWakeAttempt] = useState<number>(0);
  const [maxWakeAttempts, setMaxWakeAttempts] = useState<number>(20);
  const [wakeMessage, setWakeMessage] = useState<string>('');
  const [saveUrlMessage, setSaveUrlMessage] = useState<string>('');
  const [offlineMode, setOfflineMode] = useState<boolean>(isOfflineModeEnabled());
  const [interactionResult, setInteractionResult] = useState<{
    tested: boolean;
    success?: boolean;
    caseCount?: number;
    latencyMs?: number;
    error?: string;
  }>({ tested: false });
  const [isTestingInteraction, setIsTestingInteraction] = useState<boolean>(false);

  // Workspace Preferences States
  const [defaultLanding, setDefaultLanding] = useState<string>(
    localStorage.getItem('caselink_pref_landing') || '/dashboard'
  );
  const [enablePhysics, setEnablePhysics] = useState<boolean>(
    localStorage.getItem('caselink_pref_physics') !== 'false'
  );
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(
    parseFloat(localStorage.getItem('caselink_pref_threshold') || '0.70')
  );
  const [mapStyle, setMapStyle] = useState<string>(
    localStorage.getItem('caselink_pref_mapstyle') || 'dark-tactical'
  );
  const [autoSaveGraph, setAutoSaveGraph] = useState<boolean>(
    localStorage.getItem('caselink_pref_autosave') !== 'false'
  );
  const [workspaceSuccess, setWorkspaceSuccess] = useState('');

  // Security Policy States
  const [sessionTimeout, setSessionTimeout] = useState<string>(
    localStorage.getItem('caselink_pref_timeout') || '30m'
  );
  const [cacheClearedMessage, setCacheClearedMessage] = useState('');

  // Probe Backend Health
  const checkHealth = useCallback(async (targetUrl?: string, force = false) => {
    setIsPinging(true);
    const res = await pingBackendHealth({
      targetBaseUrl: targetUrl,
      forceFresh: force,
      timeoutMs: 2000,
    });
    setPingResult(res);
    setIsPinging(false);
    return res;
  }, []);

  useEffect(() => {
    setCurrentUser(userService.getCurrentUser());
    checkHealth(undefined, true);
  }, [checkHealth]);

  // Handle Logout
  const handleLogout = () => {
    userService.logout();
    navigate('/login');
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        name: displayName,
        department: department,
      };
      localStorage.setItem('caselink_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }
    setProfileSuccess('Officer profile preferences updated successfully.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  // Password Update
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess('Cryptographic password hash refreshed successfully.');
    setTimeout(() => setPasswordSuccess(''), 3500);
  };

  // Backend URL Save
  const handleSaveUrl = (urlToSave: string) => {
    setApiBaseUrl(urlToSave);
    const updated = getApiBaseUrl();
    setCurrentUrl(updated);
    setCustomInputUrl(updated);
    setSaveUrlMessage('Target API endpoint updated.');
    setTimeout(() => setSaveUrlMessage(''), 3000);
    checkHealth(updated, true);
    setInteractionResult({ tested: false });
  };

  // Wake Up Backend Container
  const handleWakeUp = async () => {
    setIsWakingUp(true);
    setWakeAttempt(1);
    setWakeMessage('Sending high-frequency wake probes to server container...');

    const success = await wakeUpBackend((attempt, max, msg) => {
      setWakeAttempt(attempt);
      setMaxWakeAttempts(max);
      setWakeMessage(msg);
    }, 20);

    setIsWakingUp(false);
    if (success) {
      checkHealth(undefined, true);
      setWakeMessage('Backend is active and responsive!');
    } else {
      setWakeMessage('Server is still initiating cold-start. Please re-check in a few seconds.');
    }
    setTimeout(() => setWakeMessage(''), 5000);
  };

  // Test API Cases Interaction
  const handleTestInteraction = async () => {
    setIsTestingInteraction(true);
    const res = await testBackendInteraction();
    setInteractionResult({ tested: true, ...res });
    setIsTestingInteraction(false);
  };

  // Toggle Offline Mode
  const handleToggleOffline = (val: boolean) => {
    setOfflineMode(val);
    setOfflineModeEnabled(val);
    checkHealth(undefined, true);
  };

  // Workspace Settings Save
  const handleSaveWorkspace = () => {
    localStorage.setItem('caselink_pref_landing', defaultLanding);
    localStorage.setItem('caselink_pref_physics', String(enablePhysics));
    localStorage.setItem('caselink_pref_threshold', String(confidenceThreshold));
    localStorage.setItem('caselink_pref_mapstyle', mapStyle);
    localStorage.setItem('caselink_pref_autosave', String(autoSaveGraph));
    setWorkspaceSuccess('Investigation workspace preferences saved.');
    setTimeout(() => setWorkspaceSuccess(''), 3000);
  };

  // Clear Local Cache
  const handleClearCache = () => {
    localStorage.removeItem('caselink_api_url');
    localStorage.removeItem('caselink_offline_mode');
    localStorage.removeItem('caselink_pref_landing');
    localStorage.removeItem('caselink_pref_physics');
    localStorage.removeItem('caselink_pref_threshold');
    localStorage.removeItem('caselink_pref_mapstyle');
    localStorage.removeItem('caselink_pref_autosave');
    setCacheClearedMessage('Local client cache cleared. System returned to default values.');
    setTimeout(() => setCacheClearedMessage(''), 3500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-wide">
              System Settings & Configuration
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              OPERATIONAL CONFIG
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage investigator profile, live backend connectivity, workspace analytics defaults, and security policies.
          </p>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1F3A] border border-[#1E3A5F] text-xs font-mono text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>SESSION: AUTHORIZED</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600/15 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            title="End session and return to Login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-2 border-b border-[#1E3A5F] text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Investigator Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('backend')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'backend'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Backend & Network ({pingResult?.healthy ? `${pingResult.latencyMs}ms` : 'Offline'})</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'workspace'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Workspace & Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Session</span>
        </button>
      </div>

      {/* ── TAB 1: INVESTIGATOR PROFILE ── */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Active Officer Identity Card */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[#0B1F3A] via-[#102A4E] to-[#0B1F3A] border border-[#1E3A5F] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'VS'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{currentUser?.name || 'ACP Vikram Sharma'}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentUser?.role || 'Lead Investigator'} · {currentUser?.department || 'CBI'}
                </p>
                <p className="text-[11px] font-mono text-blue-400 mt-1">
                  Badge: {currentUser?.badgeNumber || 'CBI-42109'} · ID: {currentUser?.officialId || 'INV001'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-2 rounded-lg bg-[#071426] border border-[#1E3A5F] text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Clearance</span>
                <span className="text-xs font-bold text-amber-400 font-mono">TOP SECRET // L4</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-[#071426] border border-[#1E3A5F] text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Auth Channel</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">FIDO2 / CAC</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-[#071426] border border-[#1E3A5F] text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Session</span>
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {currentUser?.lastLogin || 'Active Session'}
                </span>
              </div>
            </div>
          </div>

          {/* Officer Details & Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-blue-400" />
                Officer Contact & Station Information
              </h3>

              {profileSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Display / Official Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Department / Agency</label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Assigned Division</label>
                    <input
                      type="text"
                      value={deskUnit}
                      onChange={(e) => setDeskUnit(e.target.value)}
                      className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Official Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={officialEmail}
                        onChange={(e) => setOfficialEmail(e.target.value)}
                        className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Secure Line</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={securePhone}
                        onChange={(e) => setSecurePhone(e.target.value)}
                        className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Officer Details
                  </button>
                </div>
              </form>
            </div>

            {/* Cryptographic Credentials Update */}
            <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Security Credentials & Master Passkey
              </h3>

              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Password changes are committed to the immutable security log and require re-authentication on companion terminals.
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Update Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: BACKEND & NETWORK INTELLIGENCE ── */}
      {activeTab === 'backend' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Live Ping & Latency Status Banner */}
          <div
            className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
              pingResult?.healthy
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-amber-950/20 border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <span
                  className={`flex h-4 w-4 rounded-full ${
                    pingResult?.healthy ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                {pingResult?.healthy && (
                  <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">
                    {pingResult?.healthy
                      ? '🟢 Backend Operational & High-Speed'
                      : '🟡 Backend Standby / Unreachable'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      pingResult?.healthy
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {pingResult?.healthy ? `${pingResult.latencyMs} ms Latency` : 'Check Required'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Target Endpoint: <code className="font-mono text-blue-300">{currentUrl}</code>
                  {pingResult?.error && <span className="text-amber-400 block mt-0.5">Note: {pingResult.error}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => checkHealth(undefined, true)}
                disabled={isPinging}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-200 text-xs font-semibold border border-[#1E3A5F] transition-all"
                title="Perform instant latency check"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-blue-400' : ''}`} />
                <span>{isPinging ? 'Pinging...' : 'Quick Ping'}</span>
              </button>
              <button
                onClick={handleWakeUp}
                disabled={isWakingUp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isWakingUp ? `Probing (${wakeAttempt}/${maxWakeAttempts})...` : 'Send Wake-Up Signal'}</span>
              </button>
            </div>
          </div>

          {wakeMessage && (
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs font-mono text-blue-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>{wakeMessage}</span>
            </div>
          )}

          {/* Tactical Offline Mode Box */}
          <div className="p-4 rounded-xl bg-[#0B1F3A] border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg border ${
                  offlineMode
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {offlineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Tactical Offline Intelligence Mode</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When enabled, all intelligence queries immediately utilize local offline data without waiting for network pings or server spins.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={offlineMode}
                onChange={(e) => handleToggleOffline(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* API Endpoint Configuration */}
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Target API Endpoint Configuration
              </h3>
              {saveUrlMessage && (
                <span className="text-xs font-mono text-emerald-400 font-semibold">{saveUrlMessage}</span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Select or specify the intelligence backend service URL. Changes take effect instantly across all platform tabs.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                placeholder="https://your-service.onrender.com/api/v1"
                className="flex-1 bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleSaveUrl(customInputUrl)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm whitespace-nowrap"
              >
                Save Endpoint
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-slate-500 font-medium">Quick Presets:</span>
              <button
                onClick={() => handleSaveUrl(DEFAULT_RENDER_URL)}
                className={`px-3 py-1 rounded-md border text-xs transition-all ${
                  currentUrl.includes('onrender.com')
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 font-bold'
                    : 'bg-[#152A46] text-slate-400 border-[#1E3A5F] hover:text-white'
                }`}
              >
                Render Cloud Service
              </button>
              <button
                onClick={() => handleSaveUrl(DEFAULT_DEV_URL)}
                className={`px-3 py-1 rounded-md border text-xs transition-all ${
                  currentUrl.includes('localhost')
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 font-bold'
                    : 'bg-[#152A46] text-slate-400 border-[#1E3A5F] hover:text-white'
                }`}
              >
                Localhost (8000)
              </button>
              <button
                onClick={() => {
                  resetApiBaseUrl();
                  const def = getApiBaseUrl();
                  setCurrentUrl(def);
                  setCustomInputUrl(def);
                  checkHealth(def, true);
                  setSaveUrlMessage('Reset to environment default.');
                  setTimeout(() => setSaveUrlMessage(''), 2500);
                }}
                className="px-3 py-1 rounded-md bg-[#152A46] text-slate-400 hover:text-white border border-[#1E3A5F] text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Default
              </button>
            </div>

            {/* Interaction Verification */}
            <div className="mt-4 pt-4 border-t border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Live Data Pipeline Test</span>
                <span className="text-[11px] text-slate-500">
                  Verifies full end-to-end data serialization by pulling live investigation cases.
                </span>
              </div>
              <button
                onClick={handleTestInteraction}
                disabled={isTestingInteraction}
                className="px-3.5 py-1.5 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-200 border border-[#1E3A5F] text-xs font-semibold transition-all whitespace-nowrap"
              >
                {isTestingInteraction ? 'Testing...' : 'Test GET /cases'}
              </button>
            </div>

            {interactionResult.tested && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  interactionResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/40 text-red-300'
                }`}
              >
                {interactionResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong>Pipeline Verified:</strong> Successfully retrieved {interactionResult.caseCount} case
                      records in {interactionResult.latencyMs}ms.
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>
                      <strong>Pipeline Inactive:</strong> {interactionResult.error}. Local mock fallback will be used.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── TAB 3: WORKSPACE & GRAPH PREFERENCES ── */}
      {activeTab === 'workspace' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Investigative Workspace & Visualization Settings
              </h3>
              {workspaceSuccess && (
                <span className="text-xs font-mono text-emerald-400 font-semibold">{workspaceSuccess}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Landing Page */}
              <div className="space-y-2">
                <label className="block text-xs text-slate-300 font-semibold">
                  Default View on Officer Authentication
                </label>
                <select
                  value={defaultLanding}
                  onChange={(e) => setDefaultLanding(e.target.value)}
                  className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="/dashboard">Dashboard (Intelligence Command Center)</option>
                  <option value="/cases">Case Dossiers Registry</option>
                  <option value="/workspace">Knowledge & Evidence Graph</option>
                  <option value="/geospatial">Geospatial Tactical Map</option>
                  <option value="/timeline">Chronological Timeline Analysis</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Target route immediately loaded following successful credential verification.
                </p>
              </div>

              {/* Map Base Layer */}
              <div className="space-y-2">
                <label className="block text-xs text-slate-300 font-semibold">
                  Geospatial Map Base Layer Theme
                </label>
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                  className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="dark-tactical">Dark Tactical (CartoDB Dark Matter)</option>
                  <option value="satellite">High-Resolution Satellite Imagery</option>
                  <option value="terrain">Topographic / Elevation Vector</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Base tile provider utilized across suspect location tracking and geo-fenced incidents.
                </p>
              </div>

              {/* Graph Physics Stabilization */}
              <div className="p-4 rounded-lg bg-[#071426] border border-[#1E3A5F] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Graph Dynamic Force Simulation</span>
                  <span className="text-[11px] text-slate-400">
                    Automatically balances entity nodes via force-directed physics.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enablePhysics}
                  onChange={(e) => setEnablePhysics(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-[#0B1F3A] border-[#1E3A5F]"
                />
              </div>

              {/* Auto Save Graph */}
              <div className="p-4 rounded-lg bg-[#071426] border border-[#1E3A5F] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Auto-Save Graph Layouts</span>
                  <span className="text-[11px] text-slate-400">
                    Saves manual node dragging positions directly to investigation case file.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSaveGraph}
                  onChange={(e) => setAutoSaveGraph(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-[#0B1F3A] border-[#1E3A5F]"
                />
              </div>
            </div>

            {/* AI Hypothesis Confidence Slider */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-semibold">
                  AI Hypothesis Engine Minimum Confidence Cutoff
                </label>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {(confidenceThreshold * 100).toFixed(0)}% Confidence
                </span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.95"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>40% (Permissive Leads)</span>
                <span>70% (Balanced Intelligence)</span>
                <span>95% (Hard Corroborated Evidence)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E3A5F] flex justify-end">
              <button
                onClick={handleSaveWorkspace}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Workspace Configuration
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 4: SECURITY & SESSION CONTROL ── */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Security Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0B1F3A] border border-[#1E3A5F] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Session Encryption</span>
              </div>
              <p className="text-lg font-mono font-bold text-white">TLS 1.3 / AES-256</p>
              <p className="text-[11px] text-slate-400">Full payload ciphering with forward secrecy.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1F3A] border border-[#1E3A5F] space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Audit Integrity</span>
              </div>
              <p className="text-lg font-mono font-bold text-white">Immutable Ledger</p>
              <p className="text-[11px] text-slate-400">Every search, view, and export logged cryptographically.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1F3A] border border-[#1E3A5F] space-y-2">
              <div className="flex items-center gap-2 text-purple-400">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Hardware Key</span>
              </div>
              <p className="text-lg font-mono font-bold text-white">FIDO2 Verified</p>
              <p className="text-[11px] text-slate-400">Hardware token binding active for current terminal.</p>
            </div>
          </div>

          {/* Session Inactivity Timeout */}
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Session Policies & Inactivity Lock
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-slate-300 font-semibold">
                  Automatic Terminal Inactivity Lock
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => {
                    setSessionTimeout(e.target.value);
                    localStorage.setItem('caselink_pref_timeout', e.target.value);
                  }}
                  className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="15m">15 Minutes of Inactivity</option>
                  <option value="30m">30 Minutes of Inactivity (Recommended)</option>
                  <option value="1h">1 Hour</option>
                  <option value="never">Disabled (Evaluation Only)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Terminates token authentication when no user input is registered on terminal.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-300 font-semibold">Client Storage & Cache</label>
                <button
                  onClick={handleClearCache}
                  className="w-full py-2 px-3 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 hover:text-white border border-[#1E3A5F] text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Local Storage & Reset Preferences
                </button>
                {cacheClearedMessage && (
                  <p className="text-[11px] font-mono text-emerald-400">{cacheClearedMessage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Critical Session Termination (Logout) Section */}
          <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Direct Session Termination & Secure Logout</h3>
                <p className="text-xs text-slate-300">
                  Ending your active session invalidates your cryptographic bearer token, erases current user session
                  state from browser storage, and returns you directly to the Secure Access Portal (Login Page).
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wider transition-all shadow-lg shadow-red-600/30"
              >
                <LogOut className="w-4 h-4" />
                LOG OUT & RETURN TO LOGIN
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;
