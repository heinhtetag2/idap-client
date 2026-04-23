import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Settings,
  HelpCircle,
  Bell,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  LayoutDashboard,
  Receipt,
  ClipboardList,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(true);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 68 : 240 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="h-full bg-white border-r border-[#E3E3E3] flex flex-col flex-shrink-0 relative z-20 overflow-hidden"
      >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 shrink-0">
        <motion.div
          initial={false}
          animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn("flex items-center overflow-hidden", isCollapsed ? "" : "flex-1 mr-2")}
        >
          <div
            aria-label="Logo placeholder"
            className="h-9 w-full border border-dashed border-[#D4D4D4] bg-[#F3F3F3] rounded-md flex items-center justify-center text-[10px] font-medium tracking-wide text-[#8A8A8A] select-none"
          >
            LOGO
          </div>
        </motion.div>
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 text-[#8A8A8A] hover:bg-[#F3F3F3] rounded-md transition-all",
            isCollapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* New Survey Button */}
      <div className={cn("mb-4 mt-2", isCollapsed ? "px-3" : "px-4")}>
        <button
          onClick={() => navigate('/surveys/new')}
          title={isCollapsed ? t('New survey') : undefined}
          className={cn(
            "flex items-center justify-center gap-2 bg-[#FF3C21] text-white rounded-md text-sm font-medium hover:bg-[#E63419] transition-colors cursor-pointer",
            isCollapsed ? "w-10 h-10 mx-auto p-2" : "w-full px-4 py-2"
          )}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">{t('New survey')}</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <div className={cn("flex-1 overflow-y-auto px-3 py-2 overflow-x-hidden", isCollapsed ? "space-y-3" : "space-y-6")}>

        {/* Overview */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("OVERVIEW")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={LayoutDashboard} label={t("Dashboard")} path="/" isCollapsed={isCollapsed} />
          </div>
        </div>

        {isCollapsed && <div className="border-t border-[#E3E3E3] mx-2" />}

        {/* Workspace */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("WORKSPACE")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={ClipboardList} label={t("Surveys")} path="/surveys" isCollapsed={isCollapsed} />
            <NavItem icon={CreditCard} label={t("Billing & Credits")} path="/billing" isCollapsed={isCollapsed} />
          </div>
        </div>

        {isCollapsed && <div className="border-t border-[#E3E3E3] mx-2" />}

        {/* Account */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("ACCOUNT")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={Settings} label={t("Settings")} path="/settings" isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#E3E3E3] space-y-0.5 shrink-0">
        <NavItem icon={HelpCircle} label={t("Help")} path="/help" isCollapsed={isCollapsed} />
        <NavButton 
          icon={({ className }) => (
            <div className="relative inline-flex">
              <Bell className={className} />
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF3C21] rounded-full border border-white"></span>
              )}
            </div>
          )}
          label={t("Notifications")} 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
          isCollapsed={isCollapsed} 
        />
        
        {/* Workspace Profile */}
        <div className="relative group">
          <div className={cn(
            "mt-4 flex items-center hover:bg-[#F3F3F3] rounded-md cursor-pointer transition-colors w-full",
            isCollapsed ? "justify-center px-0 py-2" : "gap-3 px-2 py-2"
          )}>
            <div className="w-8 h-8 rounded-md bg-[#FFF1EE] text-[#FF3C21] flex items-center justify-center text-xs font-semibold shrink-0">
              HO
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-[#1A1A1A] truncate text-left">Hein's Org</span>
                <span className="text-xs text-[#8A8A8A] truncate text-left">Growth plan</span>
              </div>
            )}
          </div>

          {/* Workspace Menu Dropdown */}
          <div className="absolute left-full bottom-0 ml-2 w-56 bg-white border border-[#E3E3E3] rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5 flex flex-col gap-0.5">
            <div className="px-2.5 py-2 mb-1">
              <span className="block text-sm font-medium text-[#1A1A1A] truncate">Hein's Org</span>
              <span className="block text-xs text-[#8A8A8A] truncate">Growth plan · Hein Htet</span>
            </div>
            
            <div className="h-px bg-[#E3E3E3] mx-1 mb-1"></div>
            
            <button className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[#3F3F46] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-sm transition-colors flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-[#8A8A8A]" />
              Account Settings
            </button>
            <button className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[#3F3F46] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-sm transition-colors flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#8A8A8A]" />
              Support
            </button>
            
            <div className="h-px bg-[#E3E3E3] mx-1 my-1"></div>
            
            <button className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-sm transition-colors flex items-center gap-2.5">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </motion.aside>

      {/* Notifications Sliding Panel */}
      <AnimatePresence>
      {isNotificationsOpen && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full bg-white border-r border-[#E3E3E3] overflow-hidden z-10 flex-shrink-0 relative"
        >
          <div className="w-[320px] h-full flex flex-col">
            {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#E3E3E3] shrink-0">
            <h2 className="text-base font-semibold text-[#1A1A1A] tracking-tight">{t("Notifications")}</h2>
            <button 
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1.5 text-[#8A8A8A] hover:bg-[#F3F3F3] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content area - Notifications List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {/* Unread Section */}
            {hasUnread && (
              <div className="px-5 py-3">
                <h3 className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">
                  {t("New")}
                </h3>
                <div className="space-y-2">
                  {/* Survey reached target */}
                  <NavLink to="/surveys/sur-001" className="group block text-left p-3 rounded-md bg-white border border-[#E3E3E3] hover:bg-[#FAFAFA] transition-colors relative cursor-pointer">
                    <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[#FF3C21]" />
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                      </div>
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-[#1A1A1A] leading-snug">
                          <span className="font-medium">{t("Organizational Culture Survey")}</span> {t("reached its 207 response target.")}
                        </p>
                        <span className="text-xs text-[#8A8A8A] mt-1.5 block">
                          {t("10 mins ago")}
                        </span>
                      </div>
                    </div>
                  </NavLink>

                  {/* Low credit warning */}
                  <NavLink to="/billing" className="group block text-left p-3 rounded-md bg-white border border-[#E3E3E3] hover:bg-[#FAFAFA] transition-colors relative cursor-pointer">
                    <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[#FF3C21]" />
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFF1EE] flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-[#FF3C21]" />
                      </div>
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-[#1A1A1A] leading-snug">
                          {t("Your credit balance is running low. ")}
                          <span className="font-medium">{t("Top up to keep active surveys live.")}</span>
                        </p>
                        <span className="text-xs text-[#8A8A8A] mt-1.5 block">
                          {t("1 hour ago")}
                        </span>
                      </div>
                    </div>
                  </NavLink>
                </div>
              </div>
            )}

            {/* Earlier Section */}
            <div className={cn("px-5 py-3", hasUnread ? "border-t border-[#E3E3E3]" : "")}>
              <h3 className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">
                {hasUnread ? t("Earlier") : t("Recent")}
              </h3>
              <div className="space-y-2">
                {!hasUnread && (
                  <>
                    <NavLink to="/surveys/sur-001" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4A4A4A]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#4A4A4A] leading-snug">
                            <span className="font-medium text-[#1A1A1A]">{t("Organizational Culture Survey")}</span> {t("reached its 207 response target.")}
                          </p>
                          <span className="text-xs text-[#8A8A8A] mt-1.5 block">
                            {t("10 mins ago")}
                          </span>
                        </div>
                      </div>
                    </NavLink>

                    <NavLink to="/billing" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-[#4A4A4A]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#4A4A4A] leading-snug">
                            {t("Your credit balance is running low. ")}
                            <span className="font-medium text-[#1A1A1A]">{t("Top up to keep active surveys live.")}</span>
                          </p>
                          <span className="text-xs text-[#8A8A8A] mt-1.5 block">
                            {t("1 hour ago")}
                          </span>
                        </div>
                      </div>
                    </NavLink>
                  </>
                )}

                {/* Credit top-up successful */}
                <NavLink to="/billing" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        <span className="font-medium text-[#1A1A1A]">{t("Credit top-up of ₮1,000K")}</span> {t("was successful. Growth package bonus credits applied.")}
                      </p>
                      <span className="text-xs text-[#8A8A8A] mt-1.5 block">
                        {t("Yesterday")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* Response milestone */}
                <NavLink to="/surveys/sur-004" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        <span className="font-medium text-[#1A1A1A]">{t("Organizational Culture Survey")}</span> {t("passed 150 responses with avg. quality 4.3.")}
                      </p>
                      <span className="text-xs text-[#8A8A8A] mt-1.5 block">
                        {t("Apr 18")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* Upcoming invoice */}
                <NavLink to="/billing" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <Receipt className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        {t("Upcoming invoice: ")}
                        <span className="font-medium text-[#1A1A1A]">{t("Growth plan ₮500K")}</span>
                        {t(" due May 14, 2026.")}
                      </p>
                      <span className="text-xs text-[#8A8A8A] mt-1.5 block">
                        {t("Apr 14")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* New survey created */}
                <NavLink to="/surveys/sur-005" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <ClipboardList className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        {t("Draft survey ")}
                        <span className="font-medium text-[#1A1A1A]">"{t("Service Quality Assessment")}"</span>
                        {t(" is ready to launch.")}
                      </p>
                      <span className="text-xs text-[#8A8A8A] mt-1.5 block">
                        {t("Apr 10")}
                      </span>
                    </div>
                  </div>
                </NavLink>
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          {hasUnread && (
            <div className="p-4 border-t border-[#E3E3E3] bg-white mt-auto shrink-0">
              <button 
                onClick={() => setHasUnread(false)}
                className="w-full py-2 px-4 bg-transparent border border-[#E3E3E3] text-[#1A1A1A] text-sm font-medium rounded-md hover:bg-[#F3F3F3] transition-colors"
              >
                {t("Mark all as read")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ icon: Icon, label, path, isCollapsed }: { icon: React.ElementType, label: string, path: string, isCollapsed?: boolean }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) => cn(
        "flex items-center rounded-md text-sm font-medium transition-colors group",
        isCollapsed ? "justify-center p-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2 w-full",
        isActive
          ? "bg-[#FFF1EE] text-[#FF3C21]"
          : "text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#1A1A1A]"
      )}
      title={isCollapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors", isActive ? "text-[#FF3C21]" : "text-[#8A8A8A] group-hover:text-[#4A4A4A]")} />
          {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

function NavButton({ icon: Icon, label, isActive, onClick, isCollapsed }: { icon: React.ElementType, label: string, isActive?: boolean, onClick: () => void, isCollapsed?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors group",
        isCollapsed ? "justify-center p-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2 w-full",
        isActive 
          ? "bg-[#F3F3F3] text-[#1A1A1A]"
          : "text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#1A1A1A]"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors", isActive ? "text-[#1A1A1A]" : "text-[#8A8A8A] group-hover:text-[#4A4A4A]")} />
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
