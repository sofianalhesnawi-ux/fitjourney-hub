import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Dumbbell, Apple, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { cn } from '@/lib/utils';

interface FABAction {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
  bgColor: string;
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t, isRTL } = useFitTrack();

  const actions: FABAction[] = [
    {
      icon: <Dumbbell className="w-5 h-5" />,
      label: t.fab.logWorkout,
      path: '/workouts',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    },
    {
      icon: <Apple className="w-5 h-5" />,
      label: t.fab.logMeal,
      path: '/nutrition',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
    },
    {
      icon: <Scale className="w-5 h-5" />,
      label: t.fab.logWeight,
      path: '/metrics',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    },
  ];

  const handleAction = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className={cn(
        "fixed z-50 flex flex-col-reverse items-center gap-3",
        "bottom-24 lg:bottom-8",
        isRTL ? "left-6" : "right-6"
      )}>
        {/* Action buttons */}
        <AnimatePresence>
          {isOpen && actions.map((action, index) => (
            <motion.button
              key={action.path}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { delay: index * 0.05 }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.5, 
                y: 20,
                transition: { delay: (actions.length - index - 1) * 0.03 }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction(action.path)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl",
                "bg-card/95 backdrop-blur-xl border border-border/50",
                "shadow-lg shadow-black/10",
                "transition-all duration-200",
                action.bgColor
              )}
            >
              <span className={action.color}>{action.icon}</span>
              <span className="font-medium text-sm whitespace-nowrap">{action.label}</span>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Main FAB button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative flex items-center justify-center w-14 h-14 rounded-2xl",
            "bg-gradient-to-br from-primary to-accent",
            "shadow-xl shadow-primary/30",
            "transition-all duration-300",
            isOpen && "shadow-primary/50"
          )}
        >
          {/* Pulse ring */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-primary/30"
              animate={{
                scale: [1, 1.3],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}

          {/* Icon */}
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Plus className="w-6 h-6 text-primary-foreground" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
