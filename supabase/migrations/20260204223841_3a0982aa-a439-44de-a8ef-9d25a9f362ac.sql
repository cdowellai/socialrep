-- Add auto-response toggle columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN auto_respond_comments boolean NOT NULL DEFAULT false,
ADD COLUMN auto_respond_messages boolean NOT NULL DEFAULT false,
ADD COLUMN auto_respond_reviews boolean NOT NULL DEFAULT false,
ADD COLUMN auto_respond_chatbot boolean NOT NULL DEFAULT true;