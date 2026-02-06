-- Create plans table
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  monthly_price integer NOT NULL DEFAULT 0,
  annual_price integer NOT NULL DEFAULT 0,
  stripe_monthly_price_id text,
  stripe_annual_price_id text,
  max_interactions integer NOT NULL DEFAULT 100,
  max_platforms integer NOT NULL DEFAULT 2,
  max_team_seats integer NOT NULL DEFAULT 1,
  max_ai_responses integer NOT NULL DEFAULT 50,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on plans (public read)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable" 
ON public.plans 
FOR SELECT 
USING (true);

-- Seed plans data
INSERT INTO public.plans (name, display_name, monthly_price, annual_price, stripe_monthly_price_id, stripe_annual_price_id, max_interactions, max_platforms, max_team_seats, max_ai_responses, features)
VALUES 
  ('starter', 'Starter', 79, 63, 'prod_Tvlyw9kK0mhh2V', 'prod_Tvlzxd1PrsrJ0T', 1000, 3, 1, 100, '{"chatbot": false, "automations": false, "brand_ai": false, "leads": false, "crm_sync": false, "api_access": false, "white_label": false, "analytics_level": "basic"}'::jsonb),
  ('professional', 'Professional', 199, 159, 'prod_TvlzBQvcsrPp6H', 'prod_TvlzkF4tK3X8iV', 5000, 7, 5, 500, '{"chatbot": true, "automations": true, "brand_ai": true, "leads": true, "crm_sync": false, "api_access": false, "white_label": false, "analytics_level": "full"}'::jsonb),
  ('agency', 'Agency', 499, 399, 'prod_Tvm0beAdDvbBvY', 'prod_Tvm0sg3nOVbOwQ', -1, -1, 15, 2000, '{"chatbot": true, "automations": true, "brand_ai": true, "leads": true, "crm_sync": true, "api_access": true, "white_label": true, "analytics_level": "full"}'::jsonb),
  ('enterprise', 'Enterprise', 0, 0, NULL, NULL, -1, -1, -1, -1, '{"chatbot": true, "automations": true, "brand_ai": true, "leads": true, "crm_sync": true, "api_access": true, "white_label": true, "analytics_level": "full"}'::jsonb);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  billing_period text NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_end timestamp with time zone DEFAULT (now() + interval '14 days'),
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Create usage table
CREATE TABLE public.usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start timestamp with time zone NOT NULL DEFAULT date_trunc('month', now()),
  period_end timestamp with time zone NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  interactions_used integer NOT NULL DEFAULT 0,
  ai_responses_used integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Enable RLS on usage
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" 
ON public.usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
ON public.usage 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
ON public.usage
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to increment AI usage
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usage (user_id, ai_responses_used, period_start, period_end)
  VALUES (p_user_id, 1, date_trunc('month', now()), date_trunc('month', now()) + interval '1 month')
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET 
    ai_responses_used = usage.ai_responses_used + 1,
    updated_at = now();
END;
$$;

-- Create function to get user's current usage
CREATE OR REPLACE FUNCTION public.get_user_usage(p_user_id uuid)
RETURNS TABLE(ai_responses_used integer, interactions_used integer, period_start timestamp with time zone, period_end timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.ai_responses_used, u.interactions_used, u.period_start, u.period_end
  FROM public.usage u
  WHERE u.user_id = p_user_id 
    AND u.period_start = date_trunc('month', now())
  LIMIT 1;
END;
$$;

-- Add trigger for updating updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_updated_at
BEFORE UPDATE ON public.usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();