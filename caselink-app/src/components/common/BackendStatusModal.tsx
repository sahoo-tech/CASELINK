import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Cloud,
  ExternalLink,
  X,
  Radio,
  Clock,
  Settings,
} from 'lucide-react';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  pingBackendHealth,
  wakeUpBackend,
  DEFAULT_DEV_URL,
  DEFAULT_RENDER_URL,
  type HealthPingResult,
} from '../../services/apiClient';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({ isOpen, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState<string>(getApiBaseUrl());
  const [customInputUrl, setCustomInputUrl] = useState<string>(getApiBaseUrl());
  const [pingResult, setPingResult] = useState<HealthPingResult | null>(null);
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [wakeAttempt, setWakeAttempt] = useState<number>(0);
  const [maxWakeAttempts, setMaxWakeAttempts] = useState<number>(15);
  const [wakeMessage, setWakeMessage] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');

  const checkHealth = useCallback(async (targetUrl?: string) => {
    const res = await pingBackendHealth(targetUrl);
    setPingResult(res);
    return res;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentUrl(getApiBaseUrl());
      setCustomInputUrl(getApiBaseUrl());
      checkHealth();
    }
  }, [isOpen, checkHealth]);

  const handleWakeUp = async () => {
    setIsWakingUp(true);
    setWakeAttempt(1);
    setWakeMessage('Sending initial wake-up ping to Render container...');

    const success = await wakeUpBackend((attempt, max, msg) => {
      setWakeAttempt(attempt);
      setMaxWakeAttempts(max);
      setWakeMessage(msg);
    }, 20);

    setIsWakingUp(false);
    if (success) {
      checkHealth();
      setWakeMessage('Backend is online and fully responsive!');
    } else {
      setWakeMessage('Render server is still spinning up. Please try again in 10-15 seconds.');
    }
  };

  const handleSaveUrl = (urlToSave: string) => {
    setApiBaseUrl(urlToSave);
    setCurrentUrl(urlToSave);
    setCustomInputUrl(urlToSave);
    setSaveMessage('Target URL updated!');
    setTimeout(() => setSaveMessage(''), 2500);
    checkHealth(urlToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              pingResult?.healthy
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
            }`}>
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Backend Server & Render Wake-Up Manager</h3>
              <p className="text-[11px] text-slate-400">Manage communication between Vercel and Render</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#152A46] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Card */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          pingResult?.healthy
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : 'bg-amber-950/20 border-amber-500/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className={`flex h-3 w-3 rounded-full ${
                pingResult?.healthy ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`} />
              {pingResult?.healthy && (
                <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
              )}
            </div>
            <div>
              <span className="font-bold text-white text-xs block">
                {pingResult?.healthy
                  ? '🟢 Backend Connected & Ready'
                  : '🟡 Backend Sleeping / Cold-Start'}
              </span>
              <span className="text-[11px] text-slate-400">
                {pingResult?.healthy
                  ? `Latency: ${pingResult.latencyMs}ms · Graph nodes: ${pingResult.data?.knowledge_graph?.nodes || 68}`
                  : pingResult?.error || 'Instance in free-tier sleep mode (15 min inactivity)'}
              </span>
            </div>
          </div>

          <button
            onClick={() => checkHealth()}
            className="p-2 rounded-lg bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 hover:text-white border border-[#1E3A5F] transition-all"
            title="Refresh Health"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Render Free Tier Info Note */}
        <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-slate-300 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <Cloud className="w-3.5 h-3.5" />
            <span>Render Cloud Sleep Notice:</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Free Render web services spin down after 15 minutes of inactivity. When you visit for the first time, click <strong className="text-slate-200">Send Wake-Up Signal</strong> below. The server takes ~30–45 seconds to spin up, after which full intelligence communication is active.
          </p>
        </div>

        {/* Wake Up Action Bar */}
        <div className="space-y-2">
          <button
            onClick={handleWakeUp}
            disabled={isWakingUp}
            className={`w-full py-2.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
              isWakingUp
                ? 'bg-amber-600 cursor-wait'
                : pingResult?.healthy
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
            }`}
          >
            {isWakingUp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending Wake-Up Ping (Attempt {wakeAttempt}/{maxWakeAttempts})...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{pingResult?.healthy ? 'Re-Ping Backend Connection' : '⚡ Send Wake-Up Signal to Render'}</span>
              </>
            )}
          </button>

          {wakeMessage && (
            <p className="text-center font-mono text-[11px] text-amber-300 animate-fade-in">
              {wakeMessage}
            </p>
          )}
        </div>

        {/* Target Backend URL Config */}
        <div className="space-y-2.5 pt-2 border-t border-[#1E3A5F]">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              Target Backend Endpoint:
            </span>
            {saveMessage && (
              <span className="text-[10px] font-mono text-emerald-400">{saveMessage}</span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customInputUrl}
              onChange={(e) => setCustomInputUrl(e.target.value)}
              placeholder="https://your-service.onrender.com/api/v1"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#152A46] border border-[#1E3A5F] text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSaveUrl(customInputUrl)}
              className="px-3.5 py-1.5 rounded-lg bg-[#152A46] hover:bg-blue-600 text-slate-200 hover:text-white font-semibold border border-[#1E3A5F] transition-all"
            >
              Save
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 pt-1 text-[10px]">
            <span className="text-slate-500">Quick Switch:</span>
            <button
              onClick={() => handleSaveUrl(DEFAULT_RENDER_URL)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                currentUrl.includes('onrender.com')
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 font-bold'
                  : 'bg-[#152A46] text-slate-400 border-[#1E3A5F] hover:text-slate-200'
              }`}
            >
              Render Cloud
            </button>
            <button
              onClick={() => handleSaveUrl(DEFAULT_DEV_URL)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                currentUrl.includes('localhost')
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 font-bold'
                  : 'bg-[#152A46] text-slate-400 border-[#1E3A5F] hover:text-slate-200'
              }`}
            >
              Localhost (8000)
            </button>
            <button
              onClick={() => {
                resetApiBaseUrl();
                setCurrentUrl(getApiBaseUrl());
                setCustomInputUrl(getApiBaseUrl());
                checkHealth();
              }}
              className="px-2 py-0.5 rounded bg-[#152A46] text-slate-400 hover:text-slate-200 border border-[#1E3A5F]"
            >
              Reset Default
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F] text-[11px] text-slate-500">
          <span>Frontend: Vercel Ready</span>
          <span>Backend: Render Ready</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#152A46] hover:bg-[#1E3A5F] text-slate-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusModal;
