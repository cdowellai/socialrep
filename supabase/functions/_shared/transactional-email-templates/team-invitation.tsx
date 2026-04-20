/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface TeamInvitationProps {
  teamName?: string
  inviterName?: string
  role?: string
  acceptUrl?: string
  expiresInDays?: number
  variant?: 'invite' | 'added'
}

const TeamInvitationEmail = ({
  teamName = 'their team',
  inviterName = 'A teammate',
  role = 'member',
  acceptUrl = 'https://socialrep.ai/dashboard',
  expiresInDays = 7,
  variant = 'invite',
}: TeamInvitationProps) => {
  const isAdded = variant === 'added'
  const heading = isAdded
    ? `You've been added to ${teamName}`
    : `Join ${teamName} on SocialRep`
  const intro = isAdded
    ? `${inviterName} added you to ${teamName} as a ${role}. You now have access — sign in to get started.`
    : `${inviterName} invited you to join ${teamName} on SocialRep as a ${role}. SocialRep is the AI-powered hub for managing every comment, DM, and review across your social accounts.`
  const cta = isAdded ? 'Open SocialRep' : 'Accept invitation'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{heading}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brandSection}>
            <Text style={brand}>SocialRep</Text>
          </Section>
          <Heading style={h1}>{heading}</Heading>
          <Text style={text}>{intro}</Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={acceptUrl} style={button}>
              {cta}
            </Button>
          </Section>
          {!isAdded && (
            <Text style={mutedText}>
              This invitation expires in {expiresInDays} days. If you weren't
              expecting this, you can safely ignore this email.
            </Text>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            SocialRep · The AI-powered social & reputation management hub
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: TeamInvitationEmail,
  subject: (data: Record<string, any>) =>
    data?.variant === 'added'
      ? `You've been added to ${data?.teamName ?? 'a team'} on SocialRep`
      : `You've been invited to join ${data?.teamName ?? 'a team'} on SocialRep`,
  displayName: 'Team invitation',
  previewData: {
    teamName: 'Acme Inc.',
    inviterName: 'Jane Doe',
    role: 'admin',
    acceptUrl: 'https://socialrep.ai/accept-invite?token=preview',
    expiresInDays: 7,
    variant: 'invite',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
}
const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 28px',
}
const brandSection = { marginBottom: '32px' }
const brand = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#06060a',
  margin: 0,
  letterSpacing: '-0.01em',
}
const h1 = {
  fontSize: '26px',
  fontWeight: '700',
  color: '#06060a',
  lineHeight: '1.25',
  margin: '0 0 16px',
  letterSpacing: '-0.02em',
}
const text = {
  fontSize: '15px',
  color: '#3f3f46',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const mutedText = {
  fontSize: '13px',
  color: '#71717a',
  lineHeight: '1.5',
  margin: '24px 0 0',
}
const button = {
  backgroundColor: '#3b3bef',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '14px 28px',
  borderRadius: '12px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = {
  borderColor: '#e4e4e7',
  margin: '40px 0 20px',
}
const footer = {
  fontSize: '12px',
  color: '#a1a1aa',
  margin: 0,
}
