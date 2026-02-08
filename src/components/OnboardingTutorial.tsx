import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitTrack } from '@/contexts/FitTrackContext';
import { Button } from '@/components/ui/button';
import { Flame, Plus, Target, BarChart3, X, ChevronRight, ChevronLeft } from 'lucide-react';

const ONBOARDING_KEY = 'fittrack-onboarding-complete';

interface TutorialStep {
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  highlight?: string; // CSS selector hint for visual reference
  gradient: string;
}

const STEPS: TutorialStep[] = [
  {
    icon: Flame,
    titleKey: 'streakTitle',
    descKey: 'streakDesc',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Plus,
    titleKey: 'fabTitle',
    descKey: 'fabDesc',
    gradient: 'from-primary to-accent',
  },
  {
    icon: Target,
    titleKey: 'goalsTitle',
    descKey: 'goalsDesc',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: BarChart3,
    titleKey: 'reportsTitle',
    descKey: 'reportsDesc',
    gradient: 'from-blue-500 to-indigo-500',
  },
];

export function OnboardingTutorial() {
  const { t } = useFitTrack();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onboarding = (t as any).onboarding as Record<string, string> | undefined;
  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
          onClick={(e) => e.target === e.currentTarget && handleComplete()}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl max-w-md w-full relative overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleComplete}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-8 bg-primary' : i < currentStep ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Content with AnimatePresence for step transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className={`w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                >
                  <StepIcon className="h-10 w-10 text-white" />
                </motion.div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-2">
                  {onboarding?.[step.titleKey as keyof typeof onboarding] || step.titleKey}
                </h2>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {onboarding?.[step.descKey as keyof typeof onboarding] || step.descKey}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {onboarding?.prev || 'Back'}
              </Button>

              <span className="text-xs text-muted-foreground">
                {currentStep + 1} / {STEPS.length}
              </span>

              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1 shadow-lg shadow-primary/20"
              >
                {currentStep === STEPS.length - 1 
                  ? (onboarding?.getStarted || 'Get Started')
                  : (onboarding?.next || 'Next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Skip */}
            {currentStep < STEPS.length - 1 && (
              <button
                onClick={handleComplete}
                className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {onboarding?.skip || 'Skip tutorial'}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
