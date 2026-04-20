

## Fix: Team invitation emails not arriving

### Root cause

The "Invite member" flow in `src/hooks/useTeam.ts` only inserts a row into the `team_invitations` table. It never sends an email. So invited people who don't already have an account never hear about the invitation.

The email domain `notify.socialrep.ai` is already verified and ready, but the app's transactional email layer hasn't been scaffolded yet, and there's no page for invitees to accept an invitation.

### What gets built

**1. Set up app email infrastructure**
- Provision the email queue, suppression handling, and unsubscribe pieces tied to the verified `notify.socialrep.ai` domain.
- Scaffold the `send-transactional-email` edge function so the app can send branded emails.

**2. Branded "Team invitation" email template**
- New React Email template `team-invitation` with:
  - Subject: "You've been invited to join {teamName} on SocialRep"
  - Inviter name, team name, role, and a primary CTA button "Accept invitation"
  - SocialRep midnight branding (matching the app's Plus Jakarta Sans + Inter type system, white email background per email rules)
  - Link expires note (matches `team_invitations.expires_at`)

**3. Wire the invite flow to actually send the email**
- Update `inviteMember` in `src/hooks/useTeam.ts`:
  - After inserting into `team_invitations`, fetch the inserted row to get the `token`
  - Call `supabase.functions.invoke('send-transactional-email', ...)` with:
    - `templateName: 'team-invitation'`
    - `recipientEmail`: the invited email
    - `idempotencyKey: invite-${invitation.id}`
    - `templateData`: team name, inviter name, role, accept URL
  - For the "user already exists, auto-added" path, send a lighter "You've been added to {team}" variant (same template, different copy via prop) so they know.
- Surface real errors in the UI (already partially planned previously) so a failed send doesn't get hidden behind a generic toast.

**4. Acceptance page for invitees**
- New route: `/accept-invite?token=...`
- Page logic:
  - Look up the invitation by token, check expiry
  - If user is not signed in → prompt them to sign up / log in (preserving the token)
  - On accept: insert into `team_members` with `accepted_at = now()`, delete the invitation row, redirect to `/dashboard`
- Add the route to `src/App.tsx` (public route).

**5. Resend invitation action**
- Small "Resend" button on pending invitations in `TeamManagement.tsx` that re-invokes `send-transactional-email` for the same token, so users can recover from missed/spammed emails without recreating the invite.

### Files to change

| File | Change |
|------|--------|
| Email infra | Provision queue + scaffold `send-transactional-email` against `notify.socialrep.ai` |
| `supabase/functions/_shared/transactional-email-templates/team-invitation.tsx` | New branded React Email template |
| `supabase/functions/_shared/transactional-email-templates/registry.ts` | Register `team-invitation` |
| `src/hooks/useTeam.ts` | Send email after creating invitation; send "added" email for existing-user path; expose detailed errors |
| `src/components/settings/TeamManagement.tsx` | Show real error messages; add "Resend" button on pending invitations |
| `src/pages/AcceptInvite.tsx` | New page that validates token and joins the team |
| `src/App.tsx` | Register `/accept-invite` route |

### What stays the same

- `notify.socialrep.ai` domain (already verified, no DNS work needed)
- Existing `team_invitations` table, token, and expiry logic
- Owner/admin invite permissions and seat limits
- Auth flow and dashboard

### Result

When an account owner invites a teammate:
- A branded SocialRep email lands in the invitee's inbox within seconds
- Clicking "Accept invitation" takes them through signup/login (if needed) and drops them straight into the right team
- The inviter can resend the email if it didn't land
- If anything fails, the toast shows the real reason instead of a generic failure

