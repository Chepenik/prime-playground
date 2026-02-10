"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";
import { loadState, saveState } from "@/lib/persistence";

export interface OnboardingStep {
  title: string;
  content: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

interface OnboardingTooltipProps {
  featureKey: string;
  steps: OnboardingStep[];
}

export function OnboardingTooltip({ featureKey, steps }: OnboardingTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const seen = loadState<boolean>(`onboarding-${featureKey}`, false);
    if (!seen) {
      setDismissed(false);
    }
  }, [featureKey]);

  const dismiss = () => {
    setDismissed(true);
    saveState(`onboarding-${featureKey}`, true);
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismiss();
    }
  };

  if (dismissed || steps.length === 0) return null;

  const step = steps[currentStep];
  const position = step.position || "top-left";

  const positionClasses: Record<string, string> = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={`absolute z-50 ${positionClasses[position]} max-w-xs`}
      >
        <div className="rounded-lg border bg-popover/95 backdrop-blur-sm shadow-lg p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm">{step.title}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-muted-foreground"
              onClick={dismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {step.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>
            <Button size="sm" className="h-7 text-xs" onClick={next}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-3 w-3 ml-1" />
                </>
              ) : (
                "Got it"
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
