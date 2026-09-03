import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 6 },
};

const pageTransition = {
  duration: 0.18,
  ease: 'easeOut' as const,
};

const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const handleToggle = () => setSidebarCollapsed((prev) => !prev);

  // Full-viewport specialized analytical workspaces (internal scrolling / canvas)
  const isFullHeightWorkspace =
    location.pathname === '/workspace' ||
    location.pathname.startsWith('/workspace/') ||
    location.pathname === '/geospatial' ||
    location.pathname.startsWith('/geospatial/');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#071426] text-slate-200">
      {/* ── Collapsible Intelligence Sidebar ── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
        currentPath={location.pathname}
      />

      {/* ── Main Application Column ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <TopBar sidebarCollapsed={sidebarCollapsed} />

        {/* ── Page Viewport ── */}
        <main
          className={`flex-1 min-h-0 w-full bg-[#071426] ${
            isFullHeightWorkspace
              ? 'overflow-hidden flex flex-col'
              : 'overflow-y-auto overflow-x-hidden'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className={`w-full ${
                isFullHeightWorkspace ? 'h-full flex-1 flex flex-col min-h-0' : 'min-h-full'
              }`}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
