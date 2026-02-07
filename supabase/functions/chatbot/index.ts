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

const DEFAULT_HANDOFF_KEYWORDS = [
  "speak to human",
  "talk to agent",
  "real person",
  "customer service",
  "speak to someone",
  "talk to a human",
  "human agent",
  "live agent",
  "representative",
];

// Constants for validation
const MAX_MESSAGES_PER_REQUEST = 50;
const MAX_MESSAGE_CONTENT_LENGTH = 10000;
const MAX_MESSAGES_PER_MINUTE = 10;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    // Basic required field validation
    if (!messages?.length || !userId || !visitorId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: messages, userId, visitorId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate userId format (must be valid UUID)
    if (!UUID_REGEX.test(userId)) {
      return new Response(
        JSON.stringify({ error: "Invalid userId format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate conversationId format if provided
    if (conversationId && !UUID_REGEX.test(conversationId)) {
      return new Response(
        JSON.stringify({ error: "Invalid conversationId format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format if provided
    if (visitorEmail && !EMAIL_REGEX.test(visitorEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate message array size
    if (messages.length > MAX_MESSAGES_PER_REQUEST) {
      return new Response(
        JSON.stringify({ error: `Too many messages. Maximum ${MAX_MESSAGES_PER_REQUEST} allowed.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each message in the array
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: "Invalid message format: each message must have role and content" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (msg.content.length > MAX_MESSAGE_CONTENT_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Message content too long. Maximum ${MAX_MESSAGE_CONTENT_LENGTH} characters allowed.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate conversation ownership if conversationId is provided
    if (conversationId) {
      const { data: existingConv, error: convLookupError } = await supabase
        .from("chatbot_conversations")
        .select("visitor_id, user_id")
        .eq("id", conversationId)
        .single();

      if (convLookupError || !existingConv) {
        return new Response(
          JSON.stringify({ error: "Conversation not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the conversation belongs to the correct visitor and user
      if (existingConv.visitor_id !== visitorId || existingConv.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Invalid conversation access" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Rate limiting: Check recent messages for this conversation or visitor
    const rateLimitConversationId = conversationId;
    if (rateLimitConversationId) {
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { data: recentMessages, error: rateLimitError } = await supabase
        .from("chatbot_messages")
        .select("id")
        .eq("conversation_id", rateLimitConversationId)
        .eq("role", "user")
        .gte("created_at", oneMinuteAgo);

      if (!rateLimitError && recentMessages && recentMessages.length >= MAX_MESSAGES_PER_MINUTE) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait before sending more messages." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
    } else if (visitorName || visitorEmail) {
      // Update existing conversation with visitor info
      await supabase
        .from("chatbot_conversations")
        .update({
          visitor_name: visitorName,
          visitor_email: visitorEmail,
        })
        .eq("id", activeConversationId);
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

    // Get knowledge base content
    const { data: knowledgeBase } = await supabase
      .from("chatbot_knowledge_base")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    // Build knowledge base context
    let knowledgeContext = "";
    if (knowledgeBase && knowledgeBase.length > 0) {
      const faqContent = knowledgeBase
        .filter((k) => k.entry_type === "faq")
        .map((k) => `${k.title}: ${k.content}`)
        .join("\n\n");

      const qaContent = knowledgeBase
        .filter((k) => k.entry_type === "qa_pair")
        .map((k) => `Q: ${k.question}\nA: ${k.answer}`)
        .join("\n\n");

      const docContent = knowledgeBase
        .filter((k) => k.entry_type === "document")
        .map((k) => k.content)
        .join("\n\n");

      if (faqContent) knowledgeContext += `\n\n## FAQ Information:\n${faqContent}`;
      if (qaContent) knowledgeContext += `\n\n## Questions & Answers:\n${qaContent}`;
      if (docContent) knowledgeContext += `\n\n## Additional Information:\n${docContent}`;
    }

    // Check for human handoff triggers
    const lastUserMessage = messages[messages.length - 1];
    const handoffEnabled = settings?.human_handoff_enabled ?? false;
    const handoffKeywords = settings?.handoff_keywords || DEFAULT_HANDOFF_KEYWORDS;
    
    let shouldHandoff = false;
    if (handoffEnabled && lastUserMessage?.role === "user") {
      const lowerContent = lastUserMessage.content.toLowerCase();
      shouldHandoff = handoffKeywords.some((keyword: string) => 
        lowerContent.includes(keyword.toLowerCase())
      );
    }

    // Store the latest user message
    if (lastUserMessage?.role === "user") {
      await supabase.from("chatbot_messages").insert({
        conversation_id: activeConversationId,
        role: "user",
        content: lastUserMessage.content,
      });
    }

    // Handle human handoff
    if (shouldHandoff) {
      // Get all conversation messages for the transcript
      const { data: allMessages } = await supabase
        .from("chatbot_messages")
        .select("role, content, created_at")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      // Build transcript
      const transcript = allMessages
        ?.map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
        .join("\n") || lastUserMessage.content;

      // Create interaction in inbox
      const { data: interaction, error: interactionError } = await supabase
        .from("interactions")
        .insert({
          user_id: userId,
          platform: "chatbot",
          interaction_type: "message",
          author_name: visitorName || "Website Visitor",
          author_handle: visitorEmail || visitorId,
          content: `Chatbot handoff requested.\n\nVisitor: ${visitorName || "Anonymous"}\nEmail: ${visitorEmail || "Not provided"}\n\n--- Chat Transcript ---\n${transcript}`,
          sentiment: "neutral",
          urgency_score: 8,
          status: "pending",
        })
        .select("id")
        .single();

      if (interactionError) {
        console.error("Error creating interaction for handoff:", interactionError);
      }

      // Update conversation with handoff info
      await supabase
        .from("chatbot_conversations")
        .update({
          resolution_type: "human",
          handed_off_at: new Date().toISOString(),
          interaction_id: interaction?.id,
          status: "handed_off",
        })
        .eq("id", activeConversationId);

      // Store handoff message
      const handoffMessage = "I've connected you with our team — they'll respond shortly. A team member will reach out to you via your provided contact information or you can check back here.";
      
      await supabase.from("chatbot_messages").insert({
        conversation_id: activeConversationId,
        role: "assistant",
        content: handoffMessage,
      });

      // Return non-streaming response for handoff
      const handoffResponse = {
        choices: [{
          delta: { content: handoffMessage },
          finish_reason: "stop"
        }]
      };

      return new Response(
        `data: ${JSON.stringify(handoffResponse)}\n\ndata: [DONE]\n\n`,
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "X-Conversation-Id": activeConversationId || "",
            "X-Human-Handoff": "true",
          },
        }
      );
    }

    // Build system prompt with knowledge base
    const systemPrompt = `You are a helpful AI customer support assistant for ${companyName}. 
Your communication style is: ${brandVoice}

Guidelines:
- Be helpful, concise, and friendly
- Answer questions about products, services, and general inquiries
- If you don't know something specific, offer to connect them with a human by saying "Would you like me to connect you with our team?"
- Keep responses brief (2-4 sentences) unless more detail is needed
- Be conversational and personable
- If they ask about pricing or want to make a purchase, encourage them to get in touch with the team
- Use the knowledge base information below to provide accurate answers

Welcome message: ${settings?.welcome_message || "Hi! How can I help you today?"}
${knowledgeContext}`;

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

          // Update conversation resolution type to bot if still pending
          await supabase
            .from("chatbot_conversations")
            .update({ resolution_type: "bot" })
            .eq("id", activeConversationId)
            .eq("resolution_type", "pending");
        }
      },
    });

    const transformedBody = response.body?.pipeThrough(transformStream);

    return new Response(transformedBody, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Conversation-Id": activeConversationId || "",
        "X-Human-Handoff": "false",
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
