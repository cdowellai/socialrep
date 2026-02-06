import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PlanFeatures {
  chatbot: boolean;
  automations: boolean;
  brand_ai: boolean;
  leads: boolean;
  crm_sync: boolean;
  api_access: boolean;
  white_label: boolean;
  analytics_level: "basic" | "full";
}

interface Plan {
  id: string;
  name: string;
  display_name: string;
  monthly_price: number;
  annual_price: number;
  max_interactions: number;
  max_platforms: number;
  max_team_seats: number;
  max_ai_responses: number;
  features: PlanFeatures;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  billing_period: "monthly" | "annual";
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
}

interface Usage {
  ai_responses_used: number;
  interactions_used: number;
  period_start: string;
  period_end: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  plan: Plan | null;
  plans: Plan[];
  usage: Usage | null;
  loading: boolean;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  canUseAI: () => boolean;
  canConnectPlatform: (currentCount: number) => boolean;
  canInviteTeamMember: (currentCount: number) => boolean;
  isTrialing: boolean;
  isPastDue: boolean;
  trialDaysRemaining: number;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (planId: string, billingPeriod: "monthly" | "annual") => Promise<string | null>;
  createPortalSession: () => Promise<string | null>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionData = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setPlan(null);
      setUsage(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch all plans
      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .order("monthly_price", { ascending: true });

      if (plansData) {
        setPlans(plansData.map(p => ({
          ...p,
          features: p.features as unknown as PlanFeatures,
        })));
      }

      // Fetch user's subscription
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subData) {
        setSubscription(subData as Subscription);

        // Get plan details
        const userPlan = plansData?.find(p => p.id === subData.plan_id);
        if (userPlan) {
          setPlan({
            ...userPlan,
            features: userPlan.features as unknown as PlanFeatures,
          });
        }
      } else {
        setSubscription(null);
        setPlan(null);
      }

      // Fetch usage
      const { data: usageData } = await supabase
        .from("usage")
        .select("*")
        .eq("user_id", user.id)
        .gte("period_start", new Date(new Date().setDate(1)).toISOString())
        .maybeSingle();

      if (usageData) {
        setUsage(usageData as Usage);
      } else {
        setUsage({
          ai_responses_used: 0,
          interactions_used: 0,
          period_start: new Date(new Date().setDate(1)).toISOString(),
          period_end: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  // Check for pending checkout after login (from pricing page signup flow)
  // Wait until loading is complete to ensure auth session is fully established
  useEffect(() => {
    const handlePendingCheckout = async () => {
      // Wait until user is authenticated AND initial data fetch is complete
      if (!user || loading) return;

      const pendingPlanId = localStorage.getItem("pending_checkout_plan");
      const pendingPeriod = localStorage.getItem("pending_checkout_period") as "monthly" | "annual" | null;

      if (pendingPlanId && pendingPeriod) {
        // Clear localStorage immediately to prevent duplicate attempts
        localStorage.removeItem("pending_checkout_plan");
        localStorage.removeItem("pending_checkout_period");

        try {
          // Small delay to ensure session is fully propagated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            console.error("No valid session for checkout");
            return;
          }

          const response = await supabase.functions.invoke("create-checkout-session", {
            body: { plan_id: pendingPlanId, billing_period: pendingPeriod },
          });

          if (response.error) {
            console.error("Checkout session error:", response.error);
            return;
          }

          if (response.data?.url) {
            window.location.href = response.data.url;
          }
        } catch (error) {
          console.error("Error processing pending checkout:", error);
        }
      }
    };

    handlePendingCheckout();
  }, [user, loading]);

  const hasFeature = useCallback((feature: keyof PlanFeatures): boolean => {
    if (!plan) return false;
    return plan.features[feature] === true;
  }, [plan]);

  const canUseAI = useCallback((): boolean => {
    if (!plan || !usage) return false;
    if (plan.max_ai_responses === -1) return true; // Unlimited
    return usage.ai_responses_used < plan.max_ai_responses;
  }, [plan, usage]);

  const canConnectPlatform = useCallback((currentCount: number): boolean => {
    if (!plan) return true; // Allow if no plan (free tier)
    if (plan.max_platforms === -1) return true; // Unlimited
    return currentCount < plan.max_platforms;
  }, [plan]);

  const canInviteTeamMember = useCallback((currentCount: number): boolean => {
    if (!plan) return false;
    if (plan.max_team_seats === -1) return true; // Unlimited
    return currentCount < plan.max_team_seats;
  }, [plan]);

  const isTrialing = subscription?.status === "trialing";
  const isPastDue = subscription?.status === "past_due";

  const trialDaysRemaining = subscription?.trial_end
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const createCheckoutSession = async (planId: string, billingPeriod: "monthly" | "annual"): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("create-checkout-session", {
        body: { plan_id: planId, billing_period: billingPeriod },
      });

      if (response.error) throw response.error;
      return response.data?.url || null;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return null;
    }
  };

  const createPortalSession = async (): Promise<string | null> => {
    try {
      const response = await supabase.functions.invoke("create-portal-session");
      if (response.error) throw response.error;
      return response.data?.url || null;
    } catch (error) {
      console.error("Error creating portal session:", error);
      return null;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plan,
        plans,
        usage,
        loading,
        hasFeature,
        canUseAI,
        canConnectPlatform,
        canInviteTeamMember,
        isTrialing,
        isPastDue,
        trialDaysRemaining,
        refreshSubscription: fetchSubscriptionData,
        createCheckoutSession,
        createPortalSession,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}