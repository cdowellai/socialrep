import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation
interface ValidationError {
  field: string;
  message: string;
}

function validateString(
  value: unknown,
  field: string,
  options: { required?: boolean; maxLength?: number; enum?: string[] } = {}
): ValidationError | null {
  const { required = false, maxLength, enum: allowedValues } = options;

  if (value === undefined || value === null || value === "") {
    if (required) return { field, message: `${field} is required` };
    return null;
  }

  if (typeof value !== "string") {
    return { field, message: `${field} must be a string` };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return { field, message: `${field} must be at most ${maxLength} characters` };
  }

  if (allowedValues && !allowedValues.includes(value)) {
    return { field, message: `${field} must be one of: ${allowedValues.join(", ")}` };
  }

  return null;
}

function validateStringArray(
  value: unknown,
  field: string,
  options: { maxItems?: number; maxItemLength?: number } = {}
): ValidationError | null {
  if (value === undefined || value === null) return null;

  if (!Array.isArray(value)) {
    return { field, message: `${field} must be an array` };
  }

  const { maxItems = 50, maxItemLength = 500 } = options;

  if (value.length > maxItems) {
    return { field, message: `${field} must have at most ${maxItems} items` };
  }

  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== "string") {
      return { field, message: `${field}[${i}] must be a string` };
    }
    if (value[i].length > maxItemLength) {
      return { field, message: `${field}[${i}] must be at most ${maxItemLength} characters` };
    }
  }

  return null;
}

interface BrandVoiceContext {
  guidelines?: string;
  phrases?: string[];
  keywords?: string[];
  responseExamples?: string;
}

interface AIRequestBody {
  content: string;
  platform: string;
  sentiment?: string;
  brandVoice?: string;
  interactionType?: string;
  brandVoiceContext?: BrandVoiceContext;
  language?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check request size
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 100 * 1024) {
      return new Response(
        JSON.stringify({ error: "Request body too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON body
    let body: AIRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      content, 
      platform, 
      sentiment, 
      brandVoice, 
      interactionType,
      brandVoiceContext,
      language 
    } = body;

    // Input validation
    const validationErrors: ValidationError[] = [];

    const contentErr = validateString(content, "content", { required: true, maxLength: 10000 });
    if (contentErr) validationErrors.push(contentErr);

    const platformErr = validateString(platform, "platform", { required: true, maxLength: 50 });
    if (platformErr) validationErrors.push(platformErr);

    const sentimentErr = validateString(sentiment, "sentiment", { 
      enum: ["positive", "neutral", "negative"] 
    });
    if (sentimentErr) validationErrors.push(sentimentErr);

    const brandVoiceErr = validateString(brandVoice, "brandVoice", { maxLength: 200 });
    if (brandVoiceErr) validationErrors.push(brandVoiceErr);

    const interactionTypeErr = validateString(interactionType, "interactionType", { 
      maxLength: 50,
      enum: ["comment", "dm", "mention", "review", "post"]
    });
    if (interactionTypeErr) validationErrors.push(interactionTypeErr);

    const languageErr = validateString(language, "language", { maxLength: 50 });
    if (languageErr) validationErrors.push(languageErr);

    // Validate brandVoiceContext if provided
    if (brandVoiceContext !== undefined && brandVoiceContext !== null) {
      if (typeof brandVoiceContext !== "object" || Array.isArray(brandVoiceContext)) {
        validationErrors.push({ field: "brandVoiceContext", message: "brandVoiceContext must be an object" });
      } else {
        const guidelinesErr = validateString(brandVoiceContext.guidelines, "brandVoiceContext.guidelines", { maxLength: 2000 });
        if (guidelinesErr) validationErrors.push(guidelinesErr);

        const phrasesErr = validateStringArray(brandVoiceContext.phrases, "brandVoiceContext.phrases", { maxItems: 20, maxItemLength: 200 });
        if (phrasesErr) validationErrors.push(phrasesErr);

        const keywordsErr = validateStringArray(brandVoiceContext.keywords, "brandVoiceContext.keywords", { maxItems: 50, maxItemLength: 100 });
        if (keywordsErr) validationErrors.push(keywordsErr);

        const examplesErr = validateString(brandVoiceContext.responseExamples, "brandVoiceContext.responseExamples", { maxLength: 5000 });
        if (examplesErr) validationErrors.push(examplesErr);
      }
    }

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build enhanced system prompt with brand voice training
    let systemPrompt = `You are an AI assistant helping a business manage their social media reputation. 
Generate a professional, empathetic response to customer interactions.

Brand Voice: ${brandVoice || "professional and friendly"}
Platform: ${platform}
Interaction Type: ${interactionType || "comment"}
Detected Sentiment: ${sentiment || "neutral"}
${language ? `Language: Respond in ${language}` : ""}

Guidelines:
- Keep responses concise (2-4 sentences for comments, longer for DMs)
- Match the tone to the platform (more casual for Instagram, professional for LinkedIn)
- For negative sentiment: acknowledge concerns, offer solutions, invite private discussion
- For positive sentiment: express gratitude, encourage continued engagement
- For neutral sentiment: be helpful and informative
- Never be defensive or dismissive
- Include a call-to-action when appropriate
- Use appropriate emojis for casual platforms (Instagram, Twitter) if the brand allows`;

    // Add brand voice training data if available
    if (brandVoiceContext) {
      if (brandVoiceContext.guidelines) {
        systemPrompt += `\n\nBrand Guidelines:\n${brandVoiceContext.guidelines}`;
      }
      if (brandVoiceContext.phrases?.length) {
        systemPrompt += `\n\nPreferred Phrases to Use:\n- ${brandVoiceContext.phrases.join("\n- ")}`;
      }
      if (brandVoiceContext.keywords?.length) {
        systemPrompt += `\n\nKey Terms to Include When Relevant:\n- ${brandVoiceContext.keywords.join(", ")}`;
      }
      if (brandVoiceContext.responseExamples) {
        systemPrompt += `\n\nExample Responses from this Brand:\n${brandVoiceContext.responseExamples}`;
      }
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
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate AI response");
    }

    const data = await response.json();
    const generatedResponse = data.choices?.[0]?.message?.content || "";

    // Analyze sentiment with confidence score
    const sentimentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: `Analyze the sentiment of the following text. Respond with a JSON object containing:
- sentiment: "positive", "neutral", or "negative"
- confidence: a number between 0 and 1 indicating confidence
- reason: a brief explanation (max 10 words)

ONLY respond with the JSON object, no other text.` 
          },
          { role: "user", content: content },
        ],
        stream: false,
      }),
    });

    let analyzedSentiment = "neutral";
    let sentimentScore = 0.5;
    let sentimentReason = "";

    if (sentimentResponse.ok) {
      const sentimentData = await sentimentResponse.json();
      const sentimentText = sentimentData.choices?.[0]?.message?.content?.trim() || "";
      
      try {
        // Parse JSON response
        const parsed = JSON.parse(sentimentText);
        analyzedSentiment = parsed.sentiment || "neutral";
        sentimentScore = parsed.confidence || 0.5;
        sentimentReason = parsed.reason || "";
      } catch {
        // Fallback to simple text matching
        if (sentimentText.toLowerCase().includes("positive")) {
          analyzedSentiment = "positive";
          sentimentScore = 0.8;
        } else if (sentimentText.toLowerCase().includes("negative")) {
          analyzedSentiment = "negative";
          sentimentScore = 0.2;
        } else {
          analyzedSentiment = "neutral";
          sentimentScore = 0.5;
        }
      }
    }

    // Calculate response confidence based on brand voice training availability
    let responseConfidence = 0.7; // Base confidence
    if (brandVoiceContext) {
      if (brandVoiceContext.responseExamples) responseConfidence += 0.1;
      if (brandVoiceContext.guidelines) responseConfidence += 0.05;
      if (brandVoiceContext.phrases?.length) responseConfidence += 0.05;
      if (brandVoiceContext.keywords?.length) responseConfidence += 0.03;
    }
    responseConfidence = Math.min(responseConfidence, 0.95);

    return new Response(
      JSON.stringify({
        response: generatedResponse,
        sentiment: analyzedSentiment,
        sentimentScore: sentimentScore,
        sentimentReason: sentimentReason,
        responseConfidence: responseConfidence,
        brandVoiceApplied: !!brandVoiceContext,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-response error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
