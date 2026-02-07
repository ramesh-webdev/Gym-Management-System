import { FileText } from 'lucide-react';

export function TermsOfService() {
  return (
    <section className="min-h-screen pt-24 pb-16 bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-ko-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-ko-500" />
            </div>
            <span className="text-sm font-medium text-ko-500">Legal</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Agreement to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using KO Fitness services, our website, or gym management system, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Membership and Services
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Membership terms, fees, and benefits are as described in your membership agreement. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Providing accurate information when registering</li>
              <li>Maintaining the security of your account credentials</li>
              <li>Paying fees on time as per your plan</li>
              <li>Following gym rules and safety guidelines</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Use of Facilities
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Use of our facilities and equipment is at your own risk. You must use equipment properly and follow staff instructions. We are not liable for injuries resulting from misuse or failure to follow safety guidelines. We recommend consulting a physician before starting any fitness program.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Cancellation and Refunds
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cancellation and refund policies are outlined in your membership agreement. Please refer to that document or contact our support team for specific terms applicable to your plan.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Prohibited Conduct
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use our services for any illegal or unauthorized purpose</li>
              <li>Share your account or allow unauthorized access</li>
              <li>Harass, abuse, or harm other members or staff</li>
              <li>Damage equipment or property</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, logos, and materials on our website and in our systems are the property of KO Fitness or our licensors and may not be copied, modified, or used without our written permission.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, KO Fitness shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or facilities.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms of Service from time to time. We will notify you of material changes by posting the updated terms on our website. Continued use of our services after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us through our Contact page or the support details provided on our website.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
