import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BrandVoiceSample {
  id: string;
  user_id: string;
  sample_type: "response" | "guideline" | "keyword" | "phrase";
  content: string;
  context: string | null;
  sentiment: string | null;
  platform: string | null;
  is_active: boolean;
  created_at: string;
}

type BrandVoiceSampleInsert = Omit<BrandVoiceSample, "id" | "created_at">;

export function useBrandVoice() {
  const { user } = useAuth();
  const [samples, setSamples] = useState<BrandVoiceSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSamples = useCallback(async () => {
    if (!user) {
      setSamples([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("brand_voice_samples")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setSamples((data || []) as BrandVoiceSample[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch brand voice samples");
      console.error("Error fetching brand voice samples:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addSample = async (sample: Omit<BrandVoiceSampleInsert, "user_id" | "is_active">) => {
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("brand_voice_samples")
      .insert({
        ...sample,
        user_id: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    setSamples((prev) => [data as BrandVoiceSample, ...prev]);
    return data as BrandVoiceSample;
  };

  const addBulkSamples = async (
    samples: Array<Omit<BrandVoiceSampleInsert, "user_id" | "is_active">>
  ) => {
    if (!user) throw new Error("Not authenticated");

    const insertData = samples.map((s) => ({
      ...s,
      user_id: user.id,
      is_active: true,
    }));

    const { data, error } = await supabase
      .from("brand_voice_samples")
      .insert(insertData)
      .select();

    if (error) throw error;
    setSamples((prev) => [...(data as BrandVoiceSample[]), ...prev]);
    return data as BrandVoiceSample[];
  };

  const deleteSample = async (id: string) => {
    const { error } = await supabase.from("brand_voice_samples").delete().eq("id", id);
    if (error) throw error;
    setSamples((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAllSamples = async () => {
    if (!user) throw new Error("Not authenticated");
    
    const { error } = await supabase
      .from("brand_voice_samples")
      .delete()
      .eq("user_id", user.id);
    
    if (error) throw error;
    setSamples([]);
  };

  // Get brand voice context for AI prompts
  const getBrandContext = useCallback(() => {
    const guidelines = samples
      .filter((s) => s.sample_type === "guideline")
      .map((s) => s.content)
      .join("\n");

    const phrases = samples
      .filter((s) => s.sample_type === "phrase")
      .map((s) => s.content);

    const keywords = samples
      .filter((s) => s.sample_type === "keyword")
      .map((s) => s.content);

    const responseExamples = samples
      .filter((s) => s.sample_type === "response")
      .slice(0, 5)
      .map((s) => `Context: ${s.context || "General"}\nResponse: ${s.content}`)
      .join("\n\n");

    return {
      guidelines,
      phrases,
      keywords,
      responseExamples,
      totalSamples: samples.length,
    };
  }, [samples]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  return {
    samples,
    loading,
    error,
    refetch: fetchSamples,
    addSample,
    addBulkSamples,
    deleteSample,
    clearAllSamples,
    getBrandContext,
  };
}
