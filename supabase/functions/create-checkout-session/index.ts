import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }

    const { plan_id, billing_period } = await req.json();

    if (!plan_id || !billing_period) {
      throw new Error("Missing plan_id or billing_period");
    }

    // Get plan details from database
    const { data: plan, error: planError } = await supabaseClient
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }

    const priceId = billing_period === "annual" 
      ? plan.stripe_annual_price_id 
      : plan.stripe_monthly_price_id;

    if (!priceId) {
      throw new Error("No Stripe price ID for this plan");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          supabase_user_id: userData.user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          supabase_user_id: userData.user.id,
          plan_id: plan_id,
          billing_period: billing_period,
        },
      },
      success_url: `https://socialrep.lovable.app/dashboard/settings?tab=billing&success=true`,
      cancel_url: `https://socialrep.lovable.app/dashboard/settings?tab=billing&canceled=true`,
      metadata: {
        supabase_user_id: userData.user.id,
        plan_id: plan_id,
        billing_period: billing_period,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});