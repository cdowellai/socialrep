import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    // Use constructEventAsync for Deno compatibility
    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log("Processing webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const planId = session.metadata?.plan_id;
        const billingPeriod = session.metadata?.billing_period || "monthly";

        if (!userId || !planId) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Create or update subscription record
        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan_id: planId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: subscription.status === "trialing" ? "trialing" : "active",
            billing_period: billingPeriod,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          }, { onConflict: "user_id" });

        if (subError) {
          console.error("Error creating subscription:", subError);
        }

        // Create usage record for the period
        const periodStart = new Date();
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);

        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabaseAdmin
          .from("usage")
          .upsert({
            user_id: userId,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
            ai_responses_used: 0,
            interactions_used: 0,
          }, { onConflict: "user_id,period_start" });

        console.log("Subscription created for user:", userId);
        break;
      }

      case "customer.subscription.created": {
        // Handle subscription creation (covers cases where checkout.session.completed metadata might be missing)
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const priceId = subscription.items.data[0]?.price.id;
          const { data: plan } = await supabaseAdmin
            .from("plans")
            .select("id")
            .or(`stripe_monthly_price_id.eq.${priceId},stripe_annual_price_id.eq.${priceId}`)
            .single();

          const billingPeriod = subscription.items.data[0]?.price.recurring?.interval === "year"
            ? "annual"
            : "monthly";

          await supabaseAdmin
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan_id: plan?.id || "",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status: subscription.status === "trialing" ? "trialing" : "active",
              billing_period: billingPeriod,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            }, { onConflict: "user_id" });

          console.log("Subscription.created handled for user:", userId);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = invoice.customer as string;

        const { data: subData } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (subData) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", subData.user_id);

          const periodStart = new Date();
          periodStart.setDate(1);
          periodStart.setHours(0, 0, 0, 0);

          const periodEnd = new Date(periodStart);
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          await supabaseAdmin
            .from("usage")
            .upsert({
              user_id: subData.user_id,
              period_start: periodStart.toISOString(),
              period_end: periodEnd.toISOString(),
              ai_responses_used: 0,
              interactions_used: 0,
            }, { onConflict: "user_id,period_start" });

          console.log("Invoice paid, usage reset for user:", subData.user_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: subData } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (subData) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", subData.user_id);

          console.log("Payment failed for user:", subData.user_id);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: subData } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (subData) {
          const priceId = subscription.items.data[0]?.price.id;

          const { data: plan } = await supabaseAdmin
            .from("plans")
            .select("id")
            .or(`stripe_monthly_price_id.eq.${priceId},stripe_annual_price_id.eq.${priceId}`)
            .single();

          const billingPeriod = subscription.items.data[0]?.price.recurring?.interval === "year"
            ? "annual"
            : "monthly";

          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan_id: plan?.id || subData.user_id,
              billing_period: billingPeriod,
              status: subscription.status === "trialing" ? "trialing" :
                      subscription.status === "active" ? "active" :
                      subscription.status === "past_due" ? "past_due" : "canceled",
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", subData.user_id);

          console.log("Subscription updated for user:", subData.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: subData } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (subData) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("user_id", subData.user_id);

          console.log("Subscription canceled for user:", subData.user_id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
