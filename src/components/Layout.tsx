import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  Activity, 
  Target, 
  BarChart3, 
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_COLLAPSED_KEY = 'fittrack-sidebar-collapsed';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { theme, setTheme, resolvedTheme, t, isRTL, language, setLanguage } = useFitTrack();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const navItems = [
    { path: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { path: '/workouts', label: t.nav.workouts, icon: Dumbbell },
    { path: '/nutrition', label: t.nav.nutrition, icon: Apple },
    { path: '/metrics', label: t.nav.bodyMetrics, icon: Activity },
    { path: '/goals', label: t.nav.goals, icon: Target },
    { path: '/reports', label: t.nav.reports, icon: BarChart3 },
    { path: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';
  const mainPadding = sidebarCollapsed ? (isRTL ? 'lg:pr-16' : 'lg:pl-16') : (isRTL ? 'lg:pr-64' : 'lg:pl-64');

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
          sidebarWidth,
          isRTL ? "right-0" : "left-0"
        )}
      >
        <div className={cn(
          "flex grow flex-col gap-y-5 overflow-y-auto scrollbar-hide bg-sidebar px-3 pb-4",
          isRTL ? "border-l border-sidebar-border" : "border-r border-sidebar-border"
        )}>
          {/* Logo - clickable to toggle sidebar */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? t.common.expand : t.common.collapse}
            className={cn(
              "flex h-16 shrink-0 items-center cursor-pointer transition-colors hover:opacity-80",
              sidebarCollapsed ? "justify-center" : "gap-2 px-3"
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shrink-0">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-sidebar-foreground whitespace-nowrap">
                {t.appName}
              </span>
            )}
          </button>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center rounded-lg p-3 text-sm font-medium transition-all duration-200',
                        sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                      )} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 border-t border-sidebar-border space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                title={sidebarCollapsed ? (language === 'en' ? 'العربية' : 'English') : undefined}
                className={cn(
                  "w-full text-sidebar-foreground",
                  sidebarCollapsed ? "justify-center px-0" : "justify-start gap-3"
                )}
              >
                <Globe className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && (language === 'en' ? 'العربية' : 'English')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                title={sidebarCollapsed ? (resolvedTheme === 'dark' ? t.common.lightMode : t.common.darkMode) : undefined}
                className={cn(
                  "w-full text-sidebar-foreground",
                  sidebarCollapsed ? "justify-center px-0" : "justify-start gap-3"
                )}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5 shrink-0" />
                ) : (
                  <Moon className="h-5 w-5 shrink-0" />
                )}
                {!sidebarCollapsed && (resolvedTheme === 'dark' ? t.common.lightMode : t.common.darkMode)}
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-4 bg-sidebar border-b border-sidebar-border px-4 py-3 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="text-sidebar-foreground"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">{t.appName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="text-sidebar-foreground"
        >
          <Globe className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-sidebar-foreground"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "fixed inset-y-0 z-50 w-64 bg-sidebar lg:hidden overflow-y-auto scrollbar-hide",
                isRTL ? "right-0 border-l border-sidebar-border" : "left-0 border-r border-sidebar-border"
              )}
            >
              <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                    <Activity className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-sidebar-foreground">{t.appName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sidebar-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-4">
                <ul className="flex flex-col gap-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                          )}
                        >
                          <item.icon className={cn(
                            'h-5 w-5 shrink-0 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                          )} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn("transition-all duration-300", mainPadding)}>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border lg:hidden">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
