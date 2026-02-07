import { Shield } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <section className="min-h-screen pt-24 pb-16 bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-ko-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-ko-500" />
            </div>
            <span className="text-sm font-medium text-ko-500">Legal</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              KO Fitness (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gym management system, website, and services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Name, email address, phone number, and contact details</li>
              <li>Membership and payment information</li>
              <li>Health and fitness-related information you choose to share</li>
              <li>Account credentials and profile data</li>
              <li>Communications and support requests</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Process memberships, payments, and bookings</li>
              <li>Send you updates, reminders, and promotional communications (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Ensure safety and security at our facilities</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Information Sharing
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your information with trusted service providers who assist us in operating our business (e.g., payment processors), and when required by law or to protect our rights and safety.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the right to access, correct, or delete your personal data, or to withdraw consent. Contact us to exercise these rights.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about this Privacy Policy or our data practices, please contact us through our Contact page or at the address provided on our website.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
