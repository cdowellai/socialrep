import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContentAIRequest {
  action: "generate_draft" | "predict_engagement" | "suggest_optimal_time" | "improve_content";
  content?: string;
  source_interaction?: {
    content: string;
    platform: string;
    sentiment: string;
    author_name?: string;
  };
  platforms?: string[];
  brand_voice?: string;
  historical_data?: {
    avg_likes: number;
    avg_comments: number;
    avg_shares: number;
    best_posting_times: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const request: ContentAIRequest = await req.json();
    const { action, content, source_interaction, platforms, brand_voice, historical_data } = request;

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate_draft":
        systemPrompt = `You are a social media content expert who creates engaging posts that match brand voice and maximize engagement. ${brand_voice ? `Brand voice guidelines: ${brand_voice}` : "Use a professional yet approachable tone."}

Create content that is:
- Platform-appropriate (consider character limits and best practices)
- Engaging and likely to generate interactions
- Authentic and not overly promotional
- Including relevant hashtags when appropriate`;

        if (source_interaction) {
          userPrompt = `Create a social media post based on this positive customer interaction:

Platform: ${source_interaction.platform}
Customer: ${source_interaction.author_name || "A customer"}
Their message: "${source_interaction.content}"
Sentiment: ${source_interaction.sentiment}

Target platforms: ${platforms?.join(", ") || "All platforms"}

Turn this into an engaging post that celebrates this interaction, thanks the customer (if appropriate), and resonates with our audience. Provide the post content directly without any preamble.`;
        } else {
          userPrompt = `Generate an engaging social media post for: ${platforms?.join(", ") || "All platforms"}

Topic or context: ${content || "General brand update"}

Provide the post content directly without any preamble.`;
        }
        break;

      case "predict_engagement":
        systemPrompt = `You are a social media analytics expert who predicts post performance based on content quality, timing, and historical patterns.

Analyze the given content and provide realistic engagement predictions.`;

        userPrompt = `Analyze this social media post and predict engagement:

Post content: "${content}"
Target platforms: ${platforms?.join(", ") || "General"}
${historical_data ? `
Historical averages:
- Avg likes: ${historical_data.avg_likes}
- Avg comments: ${historical_data.avg_comments}
- Avg shares: ${historical_data.avg_shares}
` : ""}

Respond in JSON format only:
{
  "likes": <predicted number>,
  "comments": <predicted number>,
  "shares": <predicted number>,
  "reach": <predicted number>,
  "confidence": <0-100 confidence score>,
  "reasoning": "<brief explanation>"
}`;
        break;

      case "suggest_optimal_time":
        systemPrompt = `You are a social media timing expert who knows the best times to post on each platform for maximum engagement.`;

        userPrompt = `Suggest optimal posting times for:

Platforms: ${platforms?.join(", ") || "All platforms"}
${historical_data?.best_posting_times?.length ? `Historical best times: ${historical_data.best_posting_times.join(", ")}` : ""}

Respond in JSON format only:
{
  "suggested_times": [
    {"platform": "platform_name", "best_time": "HH:MM", "timezone": "UTC", "day": "weekday", "reason": "brief explanation"}
  ],
  "general_recommendation": "<overall timing advice>"
}`;
        break;

      case "improve_content":
        systemPrompt = `You are a social media content optimizer who improves posts for better engagement while maintaining brand voice. ${brand_voice ? `Brand voice: ${brand_voice}` : ""}`;

        userPrompt = `Improve this social media post for better engagement:

Original: "${content}"
Target platforms: ${platforms?.join(", ") || "All platforms"}

Provide an improved version that:
1. Is more engaging and likely to generate interactions
2. Uses appropriate hashtags
3. Has a stronger call-to-action if relevant
4. Maintains the original message intent

Respond with ONLY the improved post content, no explanation.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON responses for structured actions
    let result: Record<string, unknown> = { content: generatedContent };
    
    if (action === "predict_engagement" || action === "suggest_optimal_time") {
      try {
        // Extract JSON from the response
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If parsing fails, return as-is
        result = { content: generatedContent, parse_error: true };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Content AI error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
