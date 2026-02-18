import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `These Terms of Service ("Terms") constitute a legally binding agreement between you ("you," "your," or "User") and SocialRep, Inc. ("SocialRep," "we," "us," or "our") governing your access to and use of the SocialRep platform, including our website, dashboard, APIs, chatbot widget, and all related services (collectively, the "Service").

By creating an account, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.

If you do not agree to these Terms, you must not access or use the Service.`,
  },
  {
    title: "2. Description of Service",
    content: `SocialRep is a software-as-a-service platform designed to help businesses manage their online reputation and social media engagement. The Service includes, but is not limited to:

• **Unified Inbox**: Aggregation of comments, mentions, direct messages, and reviews from connected social media and review platforms into a single dashboard.
• **AI-Powered Responses**: Artificial intelligence that drafts responses in your brand voice for your review and approval before sending.
• **Review Management**: Monitoring, responding to, and analyzing customer reviews across platforms including Google Business Profile, Yelp, and Trustpilot.
• **Content Scheduling**: Creation, scheduling, and publishing of social media posts to connected platforms.
• **Lead Management**: Identification, scoring, and tracking of potential customer leads from social interactions.
• **Analytics & Reporting**: Performance dashboards, sentiment analysis, response time tracking, and team performance metrics.
• **Chatbot**: An embeddable AI-powered chatbot trained on your knowledge base for automated customer engagement.
• **Streams**: Customizable monitoring columns for real-time tracking of specific interaction types, platforms, or topics.
• **Team Collaboration**: Multi-user workspaces with role-based permissions, internal notes, and assignment workflows.

We reserve the right to modify, suspend, or discontinue any feature of the Service at any time, with reasonable notice when practicable.`,
  },
  {
    title: "3. Account Registration and Security",
    content: `**3.1 Account Creation**
To use the Service, you must create an account by providing a valid email address and creating a password. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.

**3.2 Account Security**
You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
• Use a strong, unique password for your SocialRep account
• Enable multi-factor authentication when available
• Notify us immediately of any unauthorized access to or use of your account
• Not share your account credentials with any third party

**3.3 Team Accounts**
If you invite team members to your workspace, you are responsible for their compliance with these Terms. Account owners and administrators are responsible for managing team member access and permissions appropriately.

**3.4 Account Eligibility**
You must be at least 16 years of age to use the Service. By creating an account, you represent that you meet this age requirement.`,
  },
  {
    title: "4. Subscription Plans and Billing",
    content: `**4.1 Plans and Pricing**
The Service is offered through various subscription plans with different features, usage limits, and pricing tiers. Current plan details and pricing are available on our pricing page and may be updated from time to time.

**4.2 Free Trial**
We may offer a free trial period for new users. At the end of the trial, your account will be downgraded to the free tier unless you subscribe to a paid plan. We reserve the right to modify or discontinue free trials at any time.

**4.3 Payment Terms**
• Paid subscriptions are billed in advance on a monthly or annual basis, depending on the billing cycle you select.
• All fees are quoted in U.S. dollars and are exclusive of applicable taxes.
• Payment is processed securely through Stripe. By providing payment information, you authorize us to charge the applicable fees to your payment method.
• If payment fails, we will attempt to charge your payment method again. After repeated failures, your account may be downgraded or suspended.

**4.4 Usage Limits**
Each plan includes specific limits on interactions, AI responses, connected platforms, team seats, and scheduled posts. If you exceed your plan's limits, you may be prompted to upgrade. We will provide reasonable notice before restricting functionality due to usage overages.

**4.5 Plan Changes**
• **Upgrades**: Take effect immediately. You will be charged a prorated amount for the remainder of your current billing period.
• **Downgrades**: Take effect at the end of your current billing period. You retain access to higher-tier features until then.

**4.6 Refund Policy**
Monthly subscriptions are non-refundable. Annual subscriptions may be eligible for a prorated refund if cancelled within the first 30 days. After 30 days, annual subscriptions are non-refundable but you retain access through the end of your billing period.`,
  },
  {
    title: "5. Cancellation and Termination",
    content: `**5.1 Cancellation by You**
You may cancel your subscription at any time from your account settings. Upon cancellation:
• You retain access to paid features through the end of your current billing period.
• Your account will be downgraded to the free tier after the billing period ends.
• Your data will be retained for 30 days after downgrade, after which it may be deleted.

**5.2 Account Deletion**
You may request permanent deletion of your account and all associated data through your account settings or by contacting support. Account deletion is irreversible and will be processed within 30 days.

**5.3 Termination by SocialRep**
We may suspend or terminate your account if:
• You violate these Terms or our Acceptable Use Policy (Section 7)
• Your payment method fails and is not updated within 14 days
• We are required to do so by law
• We reasonably believe your account is being used for fraudulent or illegal purposes

We will provide notice before termination when practicable, except in cases of severe violations or legal requirements.

**5.4 Effect of Termination**
Upon termination, your right to use the Service ceases immediately. We may delete your data in accordance with our data retention policy. Sections of these Terms that by their nature should survive termination will remain in effect, including but not limited to Sections 9, 10, 11, and 13.`,
  },
  {
    title: "6. Your Content and Data",
    content: `**6.1 Ownership**
You retain all ownership rights to the content, data, and materials you submit to or create through the Service ("Your Content"). This includes your brand voice training data, knowledge base content, response templates, scheduled posts, and any other content you provide.

**6.2 License Grant**
By using the Service, you grant SocialRep a limited, non-exclusive, worldwide, royalty-free license to use, process, store, and display Your Content solely for the purpose of providing, maintaining, and improving the Service. This license terminates when you delete Your Content or close your account.

**6.3 AI-Generated Content**
Responses and content drafted by our AI features are generated based on your brand voice training, knowledge base, and the context of specific interactions. You are solely responsible for reviewing, editing, and approving all AI-generated content before it is sent or published. SocialRep does not guarantee the accuracy, appropriateness, or completeness of AI-generated content.

**6.4 Data Portability**
You may export your data at any time through the Service's export features. We support standard data formats to facilitate portability.

**6.5 Aggregated Data**
We may create anonymized, aggregated data derived from your use of the Service for purposes such as analytics, benchmarking, and service improvement. Such aggregated data will not identify you or any individual user.`,
  },
  {
    title: "7. Acceptable Use Policy",
    content: `You agree not to use the Service to:

**Prohibited Content**
• Send, publish, or store content that is unlawful, defamatory, harassing, threatening, obscene, or that violates any third party's intellectual property or privacy rights
• Distribute spam, unsolicited commercial messages, or phishing attempts through any feature of the Service
• Impersonate any person or entity, or falsely represent your affiliation with any person or entity

**Prohibited Activities**
• Attempt to gain unauthorized access to the Service, other users' accounts, or any related systems or networks
• Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Service
• Use automated means (bots, scrapers, crawlers) to access the Service except through our official APIs
• Circumvent or attempt to circumvent any usage limits, rate limits, or security measures
• Use the Service in any manner that could disable, overburden, damage, or impair our servers or networks
• Resell, sublicense, or redistribute access to the Service without our written consent
• Use the Service to violate any applicable law, regulation, or third-party platform's terms of service

**Platform Compliance**
When using SocialRep to interact with third-party platforms, you agree to comply with each platform's terms of service, community guidelines, and API usage policies. Violations of third-party platform policies may result in disconnection of that platform integration or suspension of your SocialRep account.

We reserve the right to investigate and take appropriate action against violations, including removing content, suspending accounts, and reporting illegal activity to law enforcement.`,
  },
  {
    title: "8. Third-Party Integrations",
    content: `**8.1 Connected Platforms**
The Service allows you to connect third-party platforms including but not limited to Facebook, Instagram, Google Business Profile, Yelp, Trustpilot, TikTok, YouTube, and LinkedIn. Your use of these platforms is governed by their respective terms of service and privacy policies.

**8.2 Authorization**
By connecting a third-party platform, you authorize SocialRep to access and interact with that platform on your behalf within the scope of permissions you grant. You may revoke this authorization at any time by disconnecting the platform in your settings.

**8.3 Third-Party Changes**
We are not responsible for changes made by third-party platforms to their APIs, terms of service, or functionality that may affect the Service's ability to integrate with those platforms. We will make reasonable efforts to adapt to such changes but cannot guarantee uninterrupted integration.

**8.4 Payment Processing**
Payment processing is provided by Stripe, Inc. Your use of Stripe's services is governed by the Stripe Services Agreement. We are not responsible for Stripe's actions or omissions.`,
  },
  {
    title: "9. Intellectual Property",
    content: `**9.1 SocialRep IP**
The Service, including its design, code, features, algorithms, documentation, branding, logos, and all related intellectual property, is owned by SocialRep and protected by copyright, trademark, patent, and other intellectual property laws. These Terms do not grant you any right, title, or interest in the Service except for the limited right to use it in accordance with these Terms.

**9.2 Feedback**
If you provide us with suggestions, ideas, or feedback about the Service ("Feedback"), you grant us an unrestricted, perpetual, irrevocable, royalty-free license to use, modify, and incorporate such Feedback into the Service without any obligation to you.

**9.3 Trademarks**
"SocialRep" and our logos are trademarks of SocialRep, Inc. You may not use our trademarks without prior written permission, except as necessary to refer to our Service in a factual, non-misleading manner.`,
  },
  {
    title: "10. Disclaimers",
    content: `THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOCIALREP DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:

• IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT
• WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS
• WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF AI-GENERATED CONTENT, SENTIMENT ANALYSIS, LEAD SCORES, OR OTHER AUTOMATED OUTPUTS
• WARRANTIES REGARDING THE AVAILABILITY OR FUNCTIONALITY OF THIRD-PARTY PLATFORM INTEGRATIONS

You acknowledge that AI-generated responses are drafts that require human review and that SocialRep is not liable for any consequences arising from the use of AI-generated content that you choose to send or publish.`,
  },
  {
    title: "11. Limitation of Liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:

**11.1** SOCIALREP'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL FEES PAID BY YOU TO SOCIALREP IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100).

**11.2** IN NO EVENT SHALL SOCIALREP BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, DATA, BUSINESS OPPORTUNITIES, OR REPUTATION, REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE OR WHETHER SOCIALREP WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

**11.3** THESE LIMITATIONS APPLY TO ALL CAUSES OF ACTION IN THE AGGREGATE, INCLUDING BUT NOT LIMITED TO BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, AND ANY OTHER LEGAL THEORY.

**11.4** SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IN SUCH JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.`,
  },
  {
    title: "12. Indemnification",
    content: `You agree to indemnify, defend, and hold harmless SocialRep, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:

• Your use of the Service
• Your Content, including any content you send or publish through the Service
• Your violation of these Terms
• Your violation of any third party's rights, including intellectual property rights or privacy rights
• Your violation of any applicable law or regulation
• Any content generated by our AI features that you chose to send, publish, or otherwise use

This indemnification obligation will survive the termination of your account and these Terms.`,
  },
  {
    title: "13. Dispute Resolution",
    content: `**13.1 Informal Resolution**
Before filing any formal legal action, you agree to first attempt to resolve the dispute informally by contacting us at support@socialrep.ai. We will attempt to resolve the dispute within 30 days of receipt of your notice.

**13.2 Binding Arbitration**
If the dispute is not resolved informally, you and SocialRep agree to resolve it through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. Arbitration will take place in the state of Delaware, or remotely at your election.

**13.3 Class Action Waiver**
YOU AND SOCIALREP AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.

**13.4 Exceptions**
Notwithstanding the above, either party may seek injunctive or equitable relief in any court of competent jurisdiction to protect its intellectual property rights or to prevent irreparable harm.

**13.5 Governing Law**
These Terms are governed by the laws of the State of Delaware, without regard to its conflict of laws principles.`,
  },
  {
    title: "14. General Provisions",
    content: `**14.1 Entire Agreement**
These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and SocialRep regarding the Service and supersede all prior agreements and understandings.

**14.2 Severability**
If any provision of these Terms is found to be invalid or unenforceable, that provision will be enforced to the maximum extent permissible, and the remaining provisions will remain in full force and effect.

**14.3 Waiver**
Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.

**14.4 Assignment**
You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign our rights and obligations without your consent in connection with a merger, acquisition, or sale of all or substantially all of our assets.

**14.5 Force Majeure**
SocialRep shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, pandemics, war, terrorism, government actions, power outages, internet disruptions, or third-party service failures.

**14.6 Notices**
We may provide notices to you via email to the address associated with your account or through the Service. You may provide notices to us at support@socialrep.ai. Notices are deemed received upon sending (for email) or posting (for in-Service notifications).

**14.7 Modifications to These Terms**
We may modify these Terms at any time by posting the revised Terms on our website. We will provide at least 14 days' notice of material changes via email. Your continued use of the Service after such notice constitutes acceptance of the modified Terms.`,
  },
  {
    title: "15. Contact Information",
    content: `If you have any questions about these Terms, please contact us:

**Email**: support@socialrep.ai
**Support**: Use the in-app support feature or visit our help center
**Mail**: SocialRep, Inc., Attn: Legal Department`,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 18, 2026</p>
        </header>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                {section.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j} className="text-foreground font-medium">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
