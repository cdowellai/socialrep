-- Create role enum for team members
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Teams table - represents an organization/account
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team members table - links users to teams with roles
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Team invitations for pending invites
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, email)
);

-- Add team_id to profiles (each user's default team)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_team_id UUID REFERENCES public.teams(id);

-- Enable RLS on new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id 
      AND team_id = _team_id
      AND accepted_at IS NOT NULL
  )
$$;

-- Security definer function to check if user has specific role in team
CREATE OR REPLACE FUNCTION public.has_team_role(_user_id UUID, _team_id UUID, _role team_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id 
      AND team_id = _team_id
      AND role = _role
      AND accepted_at IS NOT NULL
  )
$$;

-- Check if user is admin or owner of team
CREATE OR REPLACE FUNCTION public.is_team_admin(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id 
      AND team_id = _team_id
      AND role IN ('owner', 'admin')
      AND accepted_at IS NOT NULL
  )
$$;

-- Get user's current team ID
CREATE OR REPLACE FUNCTION public.get_user_team_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT current_team_id FROM public.profiles WHERE user_id = _user_id),
    (SELECT team_id FROM public.team_members WHERE user_id = _user_id AND accepted_at IS NOT NULL LIMIT 1)
  )
$$;

-- RLS Policies for teams
CREATE POLICY "Users can view teams they belong to"
ON public.teams FOR SELECT
USING (public.is_team_member(auth.uid(), id) OR owner_id = auth.uid());

CREATE POLICY "Users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team admins can update team"
ON public.teams FOR UPDATE
USING (public.is_team_admin(auth.uid(), id));

CREATE POLICY "Team owners can delete team"
ON public.teams FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Team members can view other members"
ON public.team_members FOR SELECT
USING (public.is_team_member(auth.uid(), team_id) OR user_id = auth.uid());

CREATE POLICY "Team admins can add members"
ON public.team_members FOR INSERT
WITH CHECK (public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "Team admins can update members"
ON public.team_members FOR UPDATE
USING (public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "Team admins can remove members"
ON public.team_members FOR DELETE
USING (public.is_team_admin(auth.uid(), team_id) OR user_id = auth.uid());

-- RLS Policies for team_invitations
CREATE POLICY "Team admins can view invitations"
ON public.team_invitations FOR SELECT
USING (public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "Team admins can create invitations"
ON public.team_invitations FOR INSERT
WITH CHECK (public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "Team admins can delete invitations"
ON public.team_invitations FOR DELETE
USING (public.is_team_admin(auth.uid(), team_id));

-- Function to auto-create team when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_team()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_team_id UUID;
BEGIN
  -- Create default team for new user
  INSERT INTO public.teams (name, owner_id)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Team', NEW.id)
  RETURNING id INTO new_team_id;
  
  -- Add user as owner of their team
  INSERT INTO public.team_members (team_id, user_id, role, accepted_at)
  VALUES (new_team_id, NEW.id, 'owner', now());
  
  -- Update profile with current team
  UPDATE public.profiles SET current_team_id = new_team_id WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Trigger to create team on new user signup (runs after profile creation)
CREATE TRIGGER on_auth_user_created_team
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_team();

-- Indexes for performance
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);