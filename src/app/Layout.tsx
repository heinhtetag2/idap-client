import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '@/widgets/sidebar';

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-white text-[#1A1A1A] font-sans overflow-hidden selection:bg-[#F3F3F3]">
      {/* Sidebar Navigation */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 h-full flex flex-col overflow-y-auto bg-[#FAFAFA]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
