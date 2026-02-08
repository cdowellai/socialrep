import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingState {
  isLoading: boolean;
  showTour: boolean;
  variant: string;
  currentStep: number;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    isLoading: true,
    showTour: false,
    variant: "default",
    currentStep: 0,
  });

  // Fetch onboarding status on mount
  useEffect(() => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchOnboardingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed, onboarding_variant, onboarding_skipped")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        // Assign A/B variant if not set
        let variant = data?.onboarding_variant || "default";
        if (!data?.onboarding_variant) {
          // Simple A/B: 50% default, 50% condensed
          variant = Math.random() > 0.5 ? "default" : "condensed";
          await supabase
            .from("profiles")
            .update({ onboarding_variant: variant })
            .eq("user_id", user.id);
        }

        const shouldShowTour = !data?.onboarding_completed && !data?.onboarding_skipped;

        setState({
          isLoading: false,
          showTour: shouldShowTour,
          variant,
          currentStep: 0,
        });
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchOnboardingStatus();
  }, [user]);

  const completeTour = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      setState(prev => ({ ...prev, showTour: false }));
    } catch (error) {
      console.error("Error completing tour:", error);
    }
  }, [user]);

  const skipTour = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({
          onboarding_skipped: true,
        })
        .eq("user_id", user.id);

      setState(prev => ({ ...prev, showTour: false }));
    } catch (error) {
      console.error("Error skipping tour:", error);
    }
  }, [user]);

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const restartTour = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({
          onboarding_completed: false,
          onboarding_skipped: false,
          onboarding_completed_at: null,
        })
        .eq("user_id", user.id);

      setState(prev => ({ ...prev, showTour: true, currentStep: 0 }));
    } catch (error) {
      console.error("Error restarting tour:", error);
    }
  }, [user]);

  return {
    ...state,
    completeTour,
    skipTour,
    setCurrentStep,
    restartTour,
  };
}
