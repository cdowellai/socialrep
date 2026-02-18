import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const sections = [
  {
    title: "1. Introduction",
    content: `SocialRep ("we," "us," "our") operates the SocialRep platform (the "Service"), a software-as-a-service application that helps businesses manage social media interactions, reviews, and customer engagement across multiple platforms. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our Service, or interact with us in any way.

By accessing or using the Service, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the Service.

This policy applies to all users, including account holders, team members invited to a workspace, and visitors to our marketing website. We are committed to protecting your privacy and handling your data in an open and transparent manner.`,
  },
  {
    title: "2. Information We Collect",
    subsections: [
      {
        subtitle: "2.1 Information You Provide Directly",
        content: `We collect information you voluntarily provide when you register for an account, subscribe to a plan, use our Service, or contact us. This includes:

• **Account Information**: Name, email address, company name, password, and billing information (processed securely through our payment processor, Stripe).
• **Profile Information**: Avatar, display name, brand voice descriptions, response tone preferences, and other customization settings.
• **Team Information**: When you invite team members, we collect their email addresses and assigned roles.
• **Brand Voice Training Data**: Sample responses, communication style preferences, and brand guidelines you provide to train our AI features.
• **Knowledge Base Content**: FAQs, documents, and other materials you upload to power your chatbot.
• **Support Communications**: Any messages, feedback, or support requests you send to us.`,
      },
      {
        subtitle: "2.2 Information Collected Through Platform Integrations",
        content: `When you connect third-party platforms (Facebook, Instagram, Google Business Profile, Yelp, Trustpilot, etc.) to SocialRep, we access and store:

• **Social Media Interactions**: Comments, mentions, direct messages, reviews, and replies from connected platforms, including the content, author information (name, handle, avatar), timestamps, and metadata.
• **Platform Account Data**: Account names, page IDs, and access tokens required to maintain the connection and sync data.
• **Review Data**: Star ratings, review content, reviewer names, and response history from review platforms.
• **Post Data**: Content, media URLs, scheduling metadata, and engagement metrics for posts you create or manage through SocialRep.

We only access data that is necessary to provide the Service and within the scope of permissions you grant during the platform connection process.`,
      },
      {
        subtitle: "2.3 Information Collected Automatically",
        content: `When you access our Service, we automatically collect certain information, including:

• **Usage Data**: Pages visited, features used, actions taken, time spent on pages, and interaction patterns within the dashboard.
• **Device Information**: Browser type and version, operating system, device type, screen resolution, and language preferences.
• **Log Data**: IP addresses, access times, referring URLs, and error logs.
• **Cookies and Similar Technologies**: We use cookies, local storage, and similar technologies to maintain sessions, remember preferences, and analyze usage patterns. See Section 8 for our full Cookie Policy.`,
      },
      {
        subtitle: "2.4 Information from Third Parties",
        content: `We may receive information about you from third parties, including:

• **Payment Processor**: Stripe provides us with transaction confirmations, subscription status, and limited billing details (we never receive or store your full credit card number).
• **Authentication Providers**: If you use social login (e.g., Google Sign-In), we receive your name, email, and profile picture from the authentication provider.
• **Analytics Services**: Aggregated usage data from analytics tools we use to improve the Service.`,
      },
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: `We use the information we collect for the following purposes:

**Service Delivery and Operations**
• Providing, maintaining, and improving the SocialRep platform
• Processing and managing your social media interactions, reviews, and customer engagements
• Generating AI-powered response drafts using your brand voice training data
• Operating the chatbot feature using your knowledge base content
• Scheduling and publishing content to connected platforms
• Managing leads and customer relationship data
• Sending notifications about interactions requiring your attention

**AI and Machine Learning**
• Training and improving our AI response generation to match your brand voice
• Performing sentiment analysis on incoming interactions
• Calculating lead scores and urgency ratings
• Generating content suggestions and analytics insights
• **Important**: Your data is used to personalize AI features for your account only. We do not use your content to train general-purpose AI models shared across customers.

**Analytics and Reporting**
• Generating dashboards, reports, and insights about your social media performance
• Tracking response times, sentiment trends, and team performance metrics
• Providing engagement analytics for scheduled and published content

**Account Management**
• Processing payments and managing subscriptions
• Authenticating users and maintaining account security
• Managing team access, roles, and permissions
• Sending transactional emails (account confirmations, password resets, billing receipts)

**Communication**
• Responding to your inquiries and support requests
• Sending product updates, feature announcements, and tips (with your consent)
• Notifying you about changes to our terms or policies

**Legal and Safety**
• Complying with legal obligations and responding to lawful requests
• Detecting, preventing, and addressing fraud, abuse, or security issues
• Enforcing our Terms of Service and other agreements`,
  },
  {
    title: "4. How We Share Your Information",
    content: `We do not sell your personal information. We share your information only in the following circumstances:

**Service Providers**
We engage trusted third-party service providers who process data on our behalf to help us operate the Service:
• **Stripe**: Payment processing and subscription management
• **Cloud Infrastructure**: Hosting, database, and storage services
• **Email Services**: Transactional email delivery
• **Analytics Tools**: Usage analytics and performance monitoring

All service providers are contractually obligated to protect your data and use it only for the purposes we specify.

**Connected Platforms**
When you use SocialRep to respond to interactions or publish content, we transmit your responses and content to the respective platforms (Facebook, Instagram, Google, etc.) via their APIs. This is necessary to deliver the core functionality of the Service.

**Team and Workspace Members**
If you are part of a team workspace, other members of your team may have access to shared data including interactions, responses, leads, and analytics, based on their assigned roles and permissions.

**Legal Requirements**
We may disclose your information if required to do so by law, regulation, legal process, or governmental request. We may also disclose information to protect the rights, property, or safety of SocialRep, our users, or others.

**Business Transfers**
In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our website of any change in ownership or uses of your personal information.

**With Your Consent**
We may share your information for any other purpose with your explicit consent.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your information for as long as your account is active or as needed to provide the Service. Specific retention periods include:

• **Account Data**: Retained for the duration of your account plus 30 days after deletion to allow for recovery.
• **Interaction Data**: Social media interactions and responses are retained for the lifetime of your account. You may delete individual interactions at any time.
• **Analytics Data**: Aggregated analytics data is retained for up to 24 months. Raw event data is retained for 12 months.
• **AI Training Data**: Brand voice samples and knowledge base content are retained until you delete them or close your account.
• **Billing Records**: Transaction records are retained for 7 years to comply with tax and accounting regulations.
• **Server Logs**: Automatically collected log data is retained for 90 days.

When you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., fraud prevention, legal compliance).`,
  },
  {
    title: "6. Data Security",
    content: `We implement industry-standard technical and organizational measures to protect your information, including:

• **Encryption in Transit**: All data transmitted between your browser and our servers is encrypted using TLS 1.2 or higher.
• **Encryption at Rest**: Sensitive data, including platform access tokens and API keys, is encrypted at rest using AES-256 encryption.
• **Access Controls**: We enforce role-based access controls and the principle of least privilege for all internal systems.
• **Authentication Security**: Passwords are hashed using bcrypt. We support multi-factor authentication (MFA) for added account security.
• **Infrastructure Security**: Our infrastructure is hosted on enterprise-grade cloud providers with SOC 2 Type II compliance, automated backups, and disaster recovery capabilities.
• **Row-Level Security**: Database access is enforced at the row level, ensuring users can only access data belonging to their own account or team workspace.
• **Regular Audits**: We conduct periodic security assessments and vulnerability scans.
• **Incident Response**: We maintain an incident response plan and will notify affected users within 72 hours of discovering a data breach that poses a risk to their rights and freedoms.

While we strive to protect your data, no method of electronic storage or transmission is 100% secure. We encourage you to use strong, unique passwords and enable MFA on your account.`,
  },
  {
    title: "7. Your Rights and Choices",
    content: `Depending on your jurisdiction, you may have the following rights regarding your personal data:

**Access and Portability**
You have the right to request a copy of the personal data we hold about you. You can export your data (interactions, leads, analytics) directly from the SocialRep dashboard at any time.

**Correction**
You can update your personal information through your account settings. If you believe any information we hold is inaccurate, you may contact us to request correction.

**Deletion**
You may request deletion of your personal data by deleting your account from the Settings page. You can also delete specific data (interactions, leads, knowledge base entries) individually through the dashboard.

**Restriction and Objection**
You may request that we restrict processing of your data or object to processing based on legitimate interests. Note that restricting processing may limit your ability to use certain features.

**Withdraw Consent**
Where we process data based on your consent (e.g., marketing communications), you may withdraw consent at any time. This does not affect the lawfulness of processing before withdrawal.

**Platform Disconnection**
You may disconnect any third-party platform from SocialRep at any time through Settings. Upon disconnection, we stop syncing new data from that platform. Previously synced data remains in your account unless you delete it.

**Do Not Track**
We respect Do Not Track (DNT) browser signals. When we detect a DNT signal, we limit data collection to what is strictly necessary for Service operation.

To exercise any of these rights, contact us at support@socialrep.ai or through the contact methods listed in Section 12.`,
  },
  {
    title: "8. Cookies and Tracking Technologies",
    content: `We use the following types of cookies and similar technologies:

**Strictly Necessary Cookies**
These are essential for the Service to function. They include session cookies for authentication and security tokens. You cannot opt out of these cookies.

**Functional Cookies**
These remember your preferences (theme, language, dashboard layout) to enhance your experience. You can disable these in your browser settings, but some features may not work as expected.

**Analytics Cookies**
These help us understand how users interact with the Service so we can improve it. Analytics data is aggregated and does not identify individual users.

We do **not** use advertising or third-party tracking cookies. We do not participate in ad networks or sell data to advertisers.

**Managing Cookies**
You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking essential cookies will prevent you from using the Service.`,
  },
  {
    title: "9. International Data Transfers",
    content: `SocialRep is operated from the United States. If you are accessing the Service from outside the United States, please be aware that your data may be transferred to, stored, and processed in the United States or other countries where our service providers operate.

We ensure that international data transfers are protected by appropriate safeguards, including:
• Standard Contractual Clauses (SCCs) approved by relevant authorities
• Data Processing Agreements with all sub-processors
• Adherence to applicable data protection frameworks

If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your data in compliance with the General Data Protection Regulation (GDPR) and rely on the following legal bases:
• **Contract**: Processing necessary to provide the Service you requested
• **Legitimate Interest**: Analytics, security, and service improvement
• **Consent**: Marketing communications and optional features
• **Legal Obligation**: Compliance with applicable laws`,
  },
  {
    title: "10. Children's Privacy",
    content: `The Service is not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal data from a child under 16, we will take steps to delete that information promptly.

If you are a parent or guardian and believe that your child has provided us with personal information, please contact us at support@socialrep.ai.`,
  },
  {
    title: "11. Changes to This Privacy Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or for other operational reasons. When we make material changes, we will:

• Post the updated policy on this page with a revised "Last Updated" date
• Notify registered users via email at least 14 days before the changes take effect
• Display a prominent notice within the Service dashboard

We encourage you to review this Privacy Policy periodically. Your continued use of the Service after changes are posted constitutes your acceptance of the revised policy.`,
  },
  {
    title: "12. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

**Email**: support@socialrep.ai
**Support**: Use the in-app support feature or visit our help center
**Mail**: SocialRep, Inc., Attn: Privacy Team

For GDPR-related inquiries, you may also contact our Data Protection Officer at support@socialrep.ai.

If you are not satisfied with our response to a privacy concern, you have the right to lodge a complaint with your local data protection supervisory authority.`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 18, 2026</p>
        </header>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              {section.content && (
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
              )}
              {section.subsections?.map((sub, k) => (
                <div key={k} className="mt-6">
                  <h3 className="text-lg font-medium mb-2">{sub.subtitle}</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                    {sub.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j} className="text-foreground font-medium">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
