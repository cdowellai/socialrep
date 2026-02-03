import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AIRequestBody {
  content: string;
  platform: string;
  sentiment?: string;
  brandVoice?: string;
  interactionType?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, platform, sentiment, brandVoice, interactionType } = await req.json() as AIRequestBody;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI assistant helping a business manage their social media reputation. 
Generate a professional, empathetic response to customer interactions.

Brand Voice: ${brandVoice || "professional and friendly"}
Platform: ${platform}
Interaction Type: ${interactionType || "comment"}
Detected Sentiment: ${sentiment || "neutral"}

Guidelines:
- Keep responses concise (2-4 sentences for comments, longer for DMs)
- Match the tone to the platform (more casual for Instagram, professional for LinkedIn)
- For negative sentiment: acknowledge concerns, offer solutions, invite private discussion
- For positive sentiment: express gratitude, encourage continued engagement
- For neutral sentiment: be helpful and informative
- Never be defensive or dismissive
- Include a call-to-action when appropriate`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please generate a response to this ${interactionType || "comment"}: "${content}"` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate AI response");
    }

    const data = await response.json();
    const generatedResponse = data.choices?.[0]?.message?.content || "";

    // Analyze sentiment of the original content
    const sentimentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Analyze the sentiment of the following text. Respond with ONLY one word: positive, neutral, or negative." },
          { role: "user", content: content },
        ],
        stream: false,
      }),
    });

    let analyzedSentiment = "neutral";
    let sentimentScore = 0.5;

    if (sentimentResponse.ok) {
      const sentimentData = await sentimentResponse.json();
      const sentimentText = sentimentData.choices?.[0]?.message?.content?.toLowerCase().trim() || "neutral";
      
      if (sentimentText.includes("positive")) {
        analyzedSentiment = "positive";
        sentimentScore = 0.8;
      } else if (sentimentText.includes("negative")) {
        analyzedSentiment = "negative";
        sentimentScore = 0.2;
      } else {
        analyzedSentiment = "neutral";
        sentimentScore = 0.5;
      }
    }

    return new Response(
      JSON.stringify({
        response: generatedResponse,
        sentiment: analyzedSentiment,
        sentimentScore: sentimentScore,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-response error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
