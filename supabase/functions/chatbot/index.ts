import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userId: string;
  conversationId?: string;
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ChatRequest = await req.json();
    const { messages, userId, conversationId, visitorId, visitorName, visitorEmail } = body;

    if (!messages?.length || !userId || !visitorId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: messages, userId, visitorId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create conversation
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const { data: newConv, error: convError } = await supabase
        .from("chatbot_conversations")
        .insert({
          user_id: userId,
          visitor_id: visitorId,
          visitor_name: visitorName,
          visitor_email: visitorEmail,
        })
        .select("id")
        .single();

      if (convError) {
        console.error("Error creating conversation:", convError);
        throw new Error("Failed to create conversation");
      }
      activeConversationId = newConv.id;
    }

    // Get chatbot settings for this user
    const { data: settings } = await supabase
      .from("chatbot_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get brand voice from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("brand_voice, company_name")
      .eq("user_id", userId)
      .single();

    const brandVoice = profile?.brand_voice || "professional and friendly";
    const companyName = profile?.company_name || "our company";

    // Store the latest user message
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === "user") {
      await supabase.from("chatbot_messages").insert({
        conversation_id: activeConversationId,
        role: "user",
        content: lastUserMessage.content,
      });
    }

    // Build system prompt
    const systemPrompt = `You are a helpful AI customer support assistant for ${companyName}. 
Your communication style is: ${brandVoice}

Guidelines:
- Be helpful, concise, and friendly
- Answer questions about products, services, and general inquiries
- If you don't know something, say so and offer to connect them with a human
- Keep responses brief (2-4 sentences) unless more detail is needed
- Be conversational and personable
- If they ask about pricing or want to make a purchase, encourage them to get in touch with the team

Welcome message: ${settings?.welcome_message || "Hi! How can I help you today?"}`;

    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter(m => m.role !== "system"),
    ];

    // Call AI with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
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
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    // Create a transform stream to capture the full response
    let fullResponse = "";
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        
        // Parse SSE to extract content
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
        
        controller.enqueue(chunk);
      },
      async flush() {
        // Store the complete assistant response
        if (fullResponse && activeConversationId) {
          await supabase.from("chatbot_messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: fullResponse,
          });
        }
      },
    });

    const transformedBody = response.body?.pipeThrough(transformStream);

    return new Response(transformedBody, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Conversation-Id": activeConversationId || "",
      },
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
