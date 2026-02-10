import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, EVENTS, ACTIONS } from "react-joyride";
import { useLocation, useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTheme } from "@/hooks/useTheme";

const tourSteps: Step[] = [
  {
    target: '[data-tour="overview"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Welcome to SocialRep! 🎉</h3>
        <p className="text-sm text-muted-foreground">
          This is your command center. Track ROI, response times, and engagement metrics at a glance. 
          Click any metric card to drill down into detailed analytics.
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
    title: "Overview Dashboard",
  },
  {
    target: '[data-tour="smart-inbox"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Smart Inbox ✉️</h3>
        <p className="text-sm text-muted-foreground">
          AI automates up to 80% of your replies! All comments, DMs, and mentions from Meta, X, 
          LinkedIn, and more flow here. One-click AI responses save hours daily.
        </p>
      </div>
    ),
    placement: "right-start",
    title: "Smart Inbox",
    floaterProps: { offset: 16 },
  },
  {
    target: '[data-tour="streams"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Streams 📊</h3>
        <p className="text-sm text-muted-foreground">
          Organize interactions into custom streams. Filter by platform, sentiment, or urgency. 
          Create sub-streams for specific campaigns or team members.
        </p>
      </div>
    ),
    placement: "right-start",
    title: "Streams",
    floaterProps: { offset: 16 },
  },
  {
    target: '[data-tour="content"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Content Scheduling 📝</h3>
        <p className="text-sm text-muted-foreground">
          Plan and schedule posts across all platforms. AI suggests optimal posting times 
          and can auto-draft content from your best interactions.
        </p>
      </div>
    ),
    placement: "right-start",
    title: "Content",
    floaterProps: { offset: 16 },
  },
  {
    target: '[data-tour="reviews"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Review Management ⭐</h3>
        <p className="text-sm text-muted-foreground">
          Monitor your reputation score across Google, Yelp, TripAdvisor, and more. 
          AI-crafted responses help you handle negative reviews professionally.
        </p>
      </div>
    ),
    placement: "right-start",
    title: "Reviews",
    floaterProps: { offset: 16 },
  },
  {
    target: '[data-tour="leads"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Lead Capture 🎯</h3>
        <p className="text-sm text-muted-foreground">
          Auto-detect potential customers from social interactions. AI scores leads based on 
          intent signals and routes hot prospects to your pipeline.
        </p>
      </div>
    ),
    placement: "right-start",
    title: "Leads",
    floaterProps: { offset: 16 },
  },
  {
    target: '[data-tour="analytics"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Analytics & Trends 📈</h3>
        <p className="text-sm text-muted-foreground">
          Deep dive into sentiment analysis, response performance, and team metrics. 
          Export PDF reports for stakeholders with one click.
        </p>
      </div>
    ),
    placement: "right-start",
    title: "Analytics",
    floaterProps: { offset: 16 },
  },
  {
    target: '[data-tour="settings"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Settings & Integrations ⚙️</h3>
        <p className="text-sm text-muted-foreground">
          Connect your social accounts, train your brand voice, and configure AI behavior. 
          Set up team permissions and notification preferences here.
        </p>
      </div>
    ),
    placement: "right-start",
    title: "Settings",
    floaterProps: { offset: 16 },
  },
];

// Condensed variant for A/B testing - fewer steps
const condensedSteps: Step[] = [
  tourSteps[0], // Overview
  tourSteps[1], // Smart Inbox
  tourSteps[4], // Reviews
  tourSteps[7], // Settings
];

export function OnboardingTour() {
  const { showTour, variant, currentStep, completeTour, skipTour, setCurrentStep, isLoading } = useOnboarding();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [run, setRun] = useState(false);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);

  const steps = variant === "condensed" ? condensedSteps : tourSteps;

  // Only run on dashboard
  useEffect(() => {
    if (showTour && location.pathname === "/dashboard" && !isLoading) {
      const timer = setTimeout(() => setRun(true), 500);
      return () => clearTimeout(timer);
    } else {
      setRun(false);
    }
  }, [showTour, location.pathname, isLoading]);

  // Elevate the active tour target so it's visible above the overlay
  useEffect(() => {
    const prev = document.querySelector("[data-tour-active]");
    if (prev) {
      prev.removeAttribute("data-tour-active");
    }
    if (activeTarget && run) {
      const el = document.querySelector(activeTarget);
      if (el) {
        el.setAttribute("data-tour-active", "true");
      }
    }
    return () => {
      const el = document.querySelector("[data-tour-active]");
      if (el) el.removeAttribute("data-tour-active");
    };
  }, [activeTarget, run]);

  const handleCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    // Track the current target for z-index elevation
    if (type === EVENTS.STEP_BEFORE || type === EVENTS.TOOLTIP) {
      const step = steps[index];
      if (step?.target && typeof step.target === "string") {
        setActiveTarget(step.target);
      }
    }

    // Update current step for progress tracking
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setCurrentStep(index + 1);
    }

    // Handle tour completion
    if ([STATUS.FINISHED].includes(status as any)) {
      completeTour();
      setRun(false);
    }

    // Handle skip/close
    if ([STATUS.SKIPPED].includes(status as any) || action === ACTIONS.CLOSE) {
      skipTour();
      setRun(false);
    }
  };

  if (!showTour || isLoading) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      spotlightPadding={8}
      callback={handleCallback}
      locale={{
        back: "Back",
        close: "Got it!",
        last: "Finish Tour",
        next: "Next",
        skip: "Skip Tour",
      }}
      floaterProps={{
        disableAnimation: false,
      }}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          backgroundColor: theme === "dark" ? "hsl(var(--card))" : "hsl(var(--background))",
          textColor: theme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
          arrowColor: theme === "dark" ? "hsl(var(--card))" : "hsl(var(--background))",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "12px",
          padding: "16px 20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: `1px solid ${theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))"}`,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipTitle: {
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "8px",
        },
        tooltipContent: {
          padding: "8px 0",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: 500,
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: "8px",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "13px",
        },
        buttonClose: {
          color: "hsl(var(--muted-foreground))",
        },
        spotlight: {
          borderRadius: "12px",
        },
        overlay: {
          mixBlendMode: "normal" as const,
        },
      }}
    />
  );
}
