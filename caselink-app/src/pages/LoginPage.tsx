import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, ChevronDown, CheckCircle, AlertTriangle, Sparkles, KeyRound } from 'lucide-react';
import userService from '../services/userService';

const FeatureBullet: React.FC<{ text: string; delay: number }> = ({ text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-3 text-slate-300"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
      <Shield className="w-4 h-4 text-blue-400" />
    </div>
    <span className="text-sm">{text}</span>
  </motion.div>
);

const containerVariants: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Lead Investigator');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!officialId || !password || !department) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await userService.login({ officialId, password, department, role });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071426] flex">
      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.05) 0%, transparent 50%)',
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(30,58,95,1) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,95,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gradient vignette over grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#071426]/80 via-transparent to-[#071426]/60" />

        {/* Top logo bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Government Intelligence</p>
          </div>
        </motion.div>

        {/* Center hero text */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-[0.3em] mb-4">
              Intelligence Platform
            </p>
            <h1 className="text-6xl font-black text-white tracking-tight leading-none mb-4">
              CASE<span className="text-blue-400">LINK</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-sm">
              Connecting Evidence. Revealing Investigative Leads.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            <FeatureBullet text="256-bit end-to-end encrypted access" delay={0.5} />
            <FeatureBullet text="Role-based clearance and access control" delay={0.65} />
            <FeatureBullet text="Full audit trail for all platform actions" delay={0.8} />
          </div>
        </div>

        {/* Bottom classification */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-amber-500/30 bg-amber-500/10">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400 tracking-wide">
              RESTRICTED GOVERNMENT SYSTEM
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Subtle glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-blue-600/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-xl p-8 shadow-2xl">
            {/* Card header */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">CL</span>
              </div>
              <div>
                <p className="text-base font-bold text-slate-100 leading-none">CASELINK</p>
                <p className="text-xs text-slate-500 mt-0.5">Investigation Intelligence Platform</p>
              </div>
            </motion.div>

            <div className="border-t border-[#1E3A5F] mb-6" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="mb-4">
                <h2 className="text-xl font-bold text-slate-100">Secure Access Portal</h2>
                <p className="text-sm text-slate-400 mt-0.5">National Criminal Network Intelligence Database</p>
              </motion.div>

              {/* ── Eye-Catching Professional Demo Banner ── */}
              <motion.div
                variants={itemVariants}
                className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/80 via-[#102a4e] to-blue-950/80 border border-blue-400/60 shadow-lg shadow-blue-500/10 relative overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start gap-2.5 relative z-10">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white tracking-wide uppercase">
                        Demonstration Environment
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono tracking-wider">
                        OPEN EVALUATION MODE
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Pre-configured credentials are <strong>not required</strong>. For evaluation and trial purposes, you may enter <strong>any custom credentials or agency details</strong> of your choice into the fields below to immediately initialize an authorized investigative session.
                    </p>

                    {/* Quick Demo Autofill Presets */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOfficialId('INV-42109');
                          setPassword('Officer@2026');
                          setDepartment('Central Bureau of Investigation (CBI)');
                          setRole('Lead Investigator');
                        }}
                        className="px-2 py-0.5 rounded bg-[#152A46] hover:bg-blue-600 hover:text-white border border-[#1E3A5F] text-[10px] text-blue-300 transition-all font-mono shadow-sm"
                      >
                        Lead Investigator (CBI)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOfficialId('ANL-30901');
                          setPassword('Analyst@2026');
                          setDepartment('Intelligence Bureau (IB)');
                          setRole('Senior Intelligence Analyst');
                        }}
                        className="px-2 py-0.5 rounded bg-[#152A46] hover:bg-blue-600 hover:text-white border border-[#1E3A5F] text-[10px] text-blue-300 transition-all font-mono shadow-sm"
                      >
                        Senior Analyst (IB)
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Official ID */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Official ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={officialId}
                      onChange={(e) => setOfficialId(e.target.value)}
                      placeholder="OFF-ID-XXXXX"
                      className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors font-mono"
                      autoComplete="off"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg pl-9 pr-10 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Department */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CBI, NIA, State Police"
                    className="w-full bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  />
                </motion.div>

                {/* Role */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full appearance-none bg-[#071426] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors cursor-pointer"
                    >
                      <option value="Lead Investigator">Lead Investigator</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants} className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-wider transition-colors duration-150"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        AUTHENTICATING...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        SECURE LOGIN
                      </>
                    )}
                  </button>
                </motion.div>
              </form>

              {/* Security indicators */}
              <motion.div variants={itemVariants} className="mt-6 pt-5 border-t border-[#1E3A5F]">
                <div className="flex flex-col gap-2">
                  {[
                    'Encrypted Access',
                    'Role Based Control',
                    'Audit Logging Enabled',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Classification banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-4 text-center"
          >
            <p className="text-xs font-mono text-slate-600 tracking-widest uppercase">
              RESTRICTED • AUTHORIZED PERSONNEL ONLY • ALL ACTIONS LOGGED
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
