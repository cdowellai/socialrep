import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

type InteractionInsert = TablesInsert<"interactions">;
type ReviewInsert = TablesInsert<"reviews">;
type LeadInsert = TablesInsert<"leads">;

export const sampleInteractions: Omit<InteractionInsert, "user_id">[] = [
  {
    platform: "instagram",
    interaction_type: "comment",
    content: "This is absolutely incredible! 🔥 Best purchase I've made this year. The quality is outstanding and customer service was amazing!",
    author_name: "Tech Enthusiast",
    author_handle: "@tech_lover_2024",
    sentiment: "positive",
    sentiment_score: 0.9,
    status: "pending",
    urgency_score: 3,
  },
  {
    platform: "google",
    interaction_type: "review",
    content: "Good product overall. Delivery was a bit slow (took 5 days instead of promised 2) but the product quality makes up for it. Would recommend with that caveat.",
    author_name: "John Davidson",
    author_handle: "John D.",
    sentiment: "neutral",
    sentiment_score: 0.5,
    status: "pending",
    urgency_score: 5,
  },
  {
    platform: "twitter",
    interaction_type: "mention",
    content: "@yourcompany Still waiting on ticket #5847 after 3 days. This is unacceptable customer service. Need urgent help with my order!",
    author_name: "Frustrated Customer",
    author_handle: "@support_seeker",
    sentiment: "negative",
    sentiment_score: 0.15,
    status: "escalated",
    urgency_score: 9,
  },
  {
    platform: "facebook",
    interaction_type: "dm",
    content: "Hi! I'm interested in your Pro plan. Can you tell me more about the team collaboration features?",
    author_name: "Sarah Miller",
    author_handle: "Sarah M.",
    sentiment: "neutral",
    sentiment_score: 0.6,
    status: "pending",
    urgency_score: 6,
  },
  {
    platform: "linkedin",
    interaction_type: "comment",
    content: "Impressive results from implementing your solution. Our response time dropped by 60%!",
    author_name: "Michael Chen",
    author_handle: "Michael C.",
    sentiment: "positive",
    sentiment_score: 0.85,
    status: "responded",
    urgency_score: 2,
    response: "Thank you so much Michael! We're thrilled to hear about your success. If you ever need any support, we're here to help!",
    responded_at: new Date().toISOString(),
  },
  {
    platform: "instagram",
    interaction_type: "dm",
    content: "Hey! Do you ship internationally? I'm in Canada and really want to try your products.",
    author_name: "Northern Shopper",
    author_handle: "@maple_buyer",
    sentiment: "positive",
    sentiment_score: 0.7,
    status: "pending",
    urgency_score: 4,
  },
  {
    platform: "facebook",
    interaction_type: "comment",
    content: "Just received my order and the packaging was damaged. The product seems fine but I expected better handling.",
    author_name: "Careful Customer",
    author_handle: "Emma W.",
    sentiment: "negative",
    sentiment_score: 0.3,
    status: "pending",
    urgency_score: 7,
  },
  {
    platform: "twitter",
    interaction_type: "mention",
    content: "Shoutout to @yourcompany for the amazing support yesterday! Problem solved in 10 minutes 👏",
    author_name: "Happy User",
    author_handle: "@satisfied_customer",
    sentiment: "positive",
    sentiment_score: 0.95,
    status: "responded",
    urgency_score: 1,
    response: "We appreciate the kind words! Our team works hard to provide quick solutions. Thanks for being a valued customer! 🙌",
    responded_at: new Date().toISOString(),
  },
];

export const sampleReviews: Omit<ReviewInsert, "user_id">[] = [
  {
    platform: "google",
    rating: 5,
    content: "Absolutely fantastic service! The team went above and beyond to help me. Highly recommended!",
    reviewer_name: "Alex Thompson",
    is_featured: true,
    response: "Thank you Alex! We're so glad we could help. Looking forward to serving you again!",
    responded_at: new Date().toISOString(),
  },
  {
    platform: "yelp",
    rating: 4,
    content: "Great product, good value. Shipping could be faster but overall satisfied with my purchase.",
    reviewer_name: "Jamie Lee",
    is_featured: false,
  },
  {
    platform: "google",
    rating: 5,
    content: "Best in the business! Their AI-powered responses saved us hours every week.",
    reviewer_name: "Chris Rodriguez",
    is_featured: true,
    response: "We're thrilled to hear that Chris! Efficiency is at the heart of what we do.",
    responded_at: new Date().toISOString(),
  },
  {
    platform: "facebook",
    rating: 3,
    content: "Product is okay, nothing special. Expected more based on the hype.",
    reviewer_name: "Pat Davis",
    is_featured: false,
  },
  {
    platform: "google",
    rating: 5,
    content: "Game changer for our small business! We've seen 40% improvement in customer satisfaction.",
    reviewer_name: "Morgan Smith",
    is_featured: true,
  },
  {
    platform: "tripadvisor",
    rating: 2,
    content: "Had some issues with the setup process. Support was helpful but took too long to respond initially.",
    reviewer_name: "Taylor Brown",
    is_featured: false,
  },
];

export const sampleLeads: Omit<LeadInsert, "user_id">[] = [
  {
    contact_name: "Jennifer Walsh",
    contact_email: "j.walsh@techcorp.com",
    company: "TechCorp Inc",
    source_platform: "linkedin",
    status: "qualified",
    score: 85,
    notes: "Interested in enterprise plan. Has 50+ team members. Follow up scheduled for next week.",
  },
  {
    contact_name: "David Kim",
    contact_email: "david@startupxyz.io",
    company: "StartupXYZ",
    source_platform: "twitter",
    status: "new",
    score: 65,
    notes: "Mentioned us in a positive tweet. Early-stage startup, might be a good fit for Pro plan.",
  },
  {
    contact_name: "Amanda Foster",
    contact_email: "afoster@retailco.com",
    company: "RetailCo",
    source_platform: "facebook",
    status: "contacted",
    score: 75,
    notes: "Requested demo after seeing our ad. Works in marketing department.",
  },
  {
    contact_name: "Robert Chen",
    contact_email: "rchen@bigenterprise.com",
    company: "Big Enterprise Ltd",
    source_platform: "google",
    status: "qualified",
    score: 92,
    notes: "Fortune 500 company. Looking to consolidate social media management. High priority.",
  },
  {
    contact_name: "Lisa Park",
    contact_email: "lisa@creativestudio.co",
    company: "Creative Studio",
    source_platform: "instagram",
    status: "new",
    score: 55,
    notes: "DM'd asking about pricing. Small agency with 5-10 clients.",
  },
  {
    contact_name: "Mark Johnson",
    contact_email: "mark@lostlead.com",
    company: "Lost Lead Co",
    source_platform: "facebook",
    status: "lost",
    score: 30,
    notes: "Budget constraints. May revisit in Q3.",
  },
];

export async function seedSampleData(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already has data
    const { data: existingInteractions } = await supabase
      .from("interactions")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (existingInteractions && existingInteractions.length > 0) {
      return { success: true }; // Data already exists
    }

    // Insert sample interactions
    const { error: interactionsError } = await supabase
      .from("interactions")
      .insert(sampleInteractions.map(i => ({ ...i, user_id: userId })));

    if (interactionsError) throw interactionsError;

    // Insert sample reviews
    const { error: reviewsError } = await supabase
      .from("reviews")
      .insert(sampleReviews.map(r => ({ ...r, user_id: userId })));

    if (reviewsError) throw reviewsError;

    // Insert sample leads
    const { error: leadsError } = await supabase
      .from("leads")
      .insert(sampleLeads.map(l => ({ ...l, user_id: userId })));

    if (leadsError) throw leadsError;

    return { success: true };
  } catch (error) {
    console.error("Error seeding sample data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to seed sample data" 
    };
  }
}

export async function clearSampleData(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from("interactions").delete().eq("user_id", userId);
    await supabase.from("reviews").delete().eq("user_id", userId);
    await supabase.from("leads").delete().eq("user_id", userId);
    
    return { success: true };
  } catch (error) {
    console.error("Error clearing sample data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to clear data" 
    };
  }
}
