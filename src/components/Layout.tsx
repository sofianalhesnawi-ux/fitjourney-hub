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
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';

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

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-72';
  const mainPadding = sidebarCollapsed ? (isRTL ? 'lg:pr-20' : 'lg:pl-20') : (isRTL ? 'lg:pr-72' : 'lg:pl-72');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-success/10 rounded-full blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-500 ease-out",
          sidebarWidth,
          isRTL ? "right-0" : "left-0"
        )}
      >
        <div className={cn(
          "flex grow flex-col gap-y-5 overflow-y-auto scrollbar-hide m-3 rounded-2xl",
          "bg-card/80 backdrop-blur-xl shadow-xl",
          "border border-border/50",
          isRTL ? "border-l-0 rounded-l-none" : "border-r-0 rounded-r-none"
        )}>
          {/* Logo - clickable to toggle sidebar */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? t.common.expand : t.common.collapse}
            className={cn(
              "flex h-20 shrink-0 items-center cursor-pointer transition-all duration-300 group",
              sidebarCollapsed ? "justify-center" : "gap-3 px-5"
            )}
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 shrink-0"
            >
              <Activity className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            {!sidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold gradient-text whitespace-nowrap"
              >
                {t.appName}
              </motion.span>
            )}
          </button>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-3">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.li 
                    key={item.path}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center rounded-xl p-3 text-sm font-medium transition-all duration-300',
                        sidebarCollapsed ? 'justify-center' : 'gap-x-3',
                        isActive
                          ? 'bg-gradient-to-r from-primary/15 to-accent/15 text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <item.icon className={cn(
                          'h-5 w-5 shrink-0 transition-all duration-300',
                          isActive 
                            ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]' 
                            : 'text-muted-foreground group-hover:text-primary'
                        )} />
                      </motion.div>
                      {!sidebarCollapsed && (
                        <span className="relative">
                          {item.label}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                            />
                          )}
                        </span>
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 border-t border-border/50 space-y-2 pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                title={sidebarCollapsed ? (language === 'en' ? 'العربية' : 'English') : undefined}
                className={cn(
                  "w-full text-muted-foreground hover:text-foreground",
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
                  "w-full text-muted-foreground hover:text-foreground",
                  sidebarCollapsed ? "justify-center px-0" : "justify-start gap-3"
                )}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: resolvedTheme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="h-5 w-5 shrink-0" />
                  ) : (
                    <Moon className="h-5 w-5 shrink-0" />
                  )}
                </motion.div>
                {!sidebarCollapsed && (resolvedTheme === 'dark' ? t.common.lightMode : t.common.darkMode)}
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-4 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 lg:hidden shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="text-foreground"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold gradient-text">{t.appName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="text-muted-foreground"
        >
          <Globe className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground"
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
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "fixed inset-y-0 z-50 w-72 bg-card/95 backdrop-blur-xl lg:hidden overflow-y-auto scrollbar-hide shadow-2xl",
                isRTL ? "right-0 border-l border-border/50" : "left-0 border-r border-border/50"
              )}
            >
              <div className="flex h-20 items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                    <Activity className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold gradient-text">{t.appName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-4">
                <ul className="flex flex-col gap-y-2">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.li 
                        key={item.path}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'group flex gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-300',
                            isActive
                              ? 'bg-gradient-to-r from-primary/15 to-accent/15 text-primary'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          )}
                        >
                          <item.icon className={cn(
                            'h-5 w-5 shrink-0 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                          )} />
                          {item.label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn("transition-all duration-500 relative z-10", mainPadding)}>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border/50 lg:hidden safe-area-pb">
        <div className="flex justify-around py-2 px-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-all duration-300 rounded-xl',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    isActive && "bg-primary/10"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  )} />
                </motion.div>
                <span className={cn(
                  "transition-all",
                  isActive && "font-semibold"
                )}>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
