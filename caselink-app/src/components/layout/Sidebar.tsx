import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  GitBranch,
  Users,
  Clock,
  Map,
  Brain,
  FileText,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  dividerBefore?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',         path: '/dashboard',   icon: LayoutDashboard },
  { label: 'Cases',             path: '/cases',        icon: FolderOpen },
  { label: 'Evidence Graph',    path: '/workspace',    icon: GitBranch },
  { label: 'Entities',          path: '/entities',     icon: Users },
  { label: 'Timeline Analysis', path: '/timeline',     icon: Clock },
  { label: 'Geospatial View',   path: '/geospatial',   icon: Map },
  { label: 'Hypothesis Engine', path: '/hypothesis',   icon: Brain },
  { label: 'Reports',           path: '/reports',      icon: FileText },
  { label: 'Audit Logs',        path: '/admin',        icon: Shield,    dividerBefore: true },
  { label: 'Settings',          path: '/settings',     icon: Settings,  dividerBefore: true },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 224 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-[#0B1F3A] border-r border-[#1E3A5F] overflow-hidden shrink-0"
      style={{ minWidth: collapsed ? 56 : 224 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-[#1E3A5F] h-14">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 shrink-0 font-bold text-white text-sm select-none">
          CL
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="logo-text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="text-white font-bold tracking-widest text-sm whitespace-nowrap"
            >
              CASELINK
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <React.Fragment key={item.path}>
              {item.dividerBefore && (
                <div className="my-2 mx-3 border-t border-[#1E3A5F]" />
              )}
              <div className="relative group">
                <Link
                  to={item.path}
                  className={[
                    'flex items-center gap-3 mx-1 my-0.5 px-2 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                      : 'text-slate-400 hover:bg-[#152A46] hover:text-slate-200 border-l-2 border-transparent',
                  ].join(' ')}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        key={`label-${item.path}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="bg-[#152A46] border border-[#1E3A5F] text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-[#1E3A5F] p-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-md text-slate-500 hover:text-slate-200 hover:bg-[#152A46] transition-colors duration-150"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="ml-2 text-xs font-medium whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
