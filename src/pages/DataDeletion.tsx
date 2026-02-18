import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Mail, Shield } from "lucide-react";

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Data Deletion</h1>
            <p className="mt-2 text-muted-foreground">
              Last updated: February 18, 2026
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <p className="text-lg text-muted-foreground">
              At SocialRep, we respect your right to control your personal data. You may request the
              deletion of your account and all associated data at any time.
            </p>

            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold m-0">Option 1: Self-Service Deletion</h2>
                  <p className="text-muted-foreground mt-1 mb-0">
                    You can delete your account and all associated data directly from the app by
                    navigating to <strong>Settings &gt; Profile</strong> and selecting the delete
                    account option.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold m-0">Option 2: Email Request</h2>
                  <p className="text-muted-foreground mt-1 mb-0">
                    You can email{" "}
                    <a
                      href="mailto:support@socialrep.ai"
                      className="text-primary hover:underline font-medium"
                    >
                      support@socialrep.ai
                    </a>{" "}
                    to request data deletion. Please include the email address associated with your
                    account.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold m-0">What Gets Deleted</h2>
                  <p className="text-muted-foreground mt-1 mb-0">
                    Upon request, the following data will be <strong>permanently deleted within 30 days</strong>:
                  </p>
                  <ul className="mt-3 space-y-2 text-muted-foreground list-none pl-0 mb-0">
                    {[
                      "Your personal account information and profile data",
                      "Connected platform tokens and OAuth credentials",
                      "All interaction history (comments, messages, reviews)",
                      "Analytics and reporting data",
                      "Brand voice training samples and AI configuration",
                      "Team memberships and associated settings",
                      "Chatbot conversations and knowledge base entries",
                      "Scheduled and published content records",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground">
              This page is provided in compliance with platform data deletion requirements,
              including Meta's data deletion callback policy. If you have questions about data
              deletion or privacy, please review our{" "}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>{" "}
              or contact us at{" "}
              <a
                href="mailto:support@socialrep.ai"
                className="text-primary hover:underline font-medium"
              >
                support@socialrep.ai
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
