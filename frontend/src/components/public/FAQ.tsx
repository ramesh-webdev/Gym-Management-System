import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
    {
        question: "What are your gym opening hours?",
        answer: "We are open from 5:00 AM to 11:00 PM on weekdays, and 7:00 AM to 9:00 PM on weekends. We also offer 24/7 access for Elite membership holders."
    },
    {
        question: "Do you offer personal training?",
        answer: "Yes, we have a team of certified expert trainers specializing in bodybuilding, weight loss, functional training, and more. You can book a session through the member portal."
    },
    {
        question: "How can I cancel or freeze my membership?",
        answer: "You can request a membership freeze or cancellation directly from your member dashboard under the 'Membership' tab, or visit our front desk for assistance."
    },
    {
        question: "Are there shower and locker facilities?",
        answer: "Absolutely. We provide premium locker rooms equipped with secure digital lockers, private showers, and vanity areas for all our members."
    },
    {
        question: "Can I bring a guest with me?",
        answer: "Member guests are welcome! Each member gets 2 guest passes per month. Additional guest passes can be purchased at the reception."
    },
    {
        question: "Do you have parking facilities?",
        answer: "Yes, we have ample dedicated parking space for our members right in front of the building, monitored by 24/7 security."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="pt-32 pb-24 bg-background">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-block bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent font-accent text-xl mb-4">
                        Support Center
                    </span>
                    <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6">
                        FREQUENTLY ASKED <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">QUESTIONS</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Find answers to common questions about our facilities, memberships, and services.
                        Can't find what you're looking for? Contact us!
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group rounded-2xl border transition-all duration-300",
                                openIndex === index
                                    ? "bg-card border-ko-500/50 shadow-lg shadow-ko-500/5"
                                    : "bg-card/50 border-border hover:border-ko-500/30"
                            )}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full h-full flex items-center justify-between p-6 text-left"
                            >
                                <span className={cn(
                                    "font-display text-xl font-bold transition-colors",
                                    openIndex === index ? "text-ko-500" : "text-foreground group-hover:text-ko-500"
                                )}>
                                    {faq.question}
                                </span>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                    openIndex === index
                                        ? "bg-ko-500 text-primary-foreground rotate-180"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </button>

                            <div
                                className={cn(
                                    "overflow-hidden transition-all duration-300 ease-in-out",
                                    openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                )}
                            >
                                <div className="p-6 pt-0 text-muted-foreground text-lg leading-relaxed border-t border-border/50 mt-2">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-ko-500/10 to-transparent border border-ko-500/20 text-center">
                    <h3 className="font-display text-2xl font-bold mb-4">Still have questions?</h3>
                    <p className="text-muted-foreground mb-8">
                        Our team is here to help you. Reach out to us via email or phone.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="mailto:support@kofitness.com"
                            className="px-8 py-3 rounded-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground font-bold hover:scale-105 transition-transform"
                        >
                            Email Support
                        </a>
                        <a
                            href="tel:+919876543210"
                            className="px-8 py-3 rounded-full bg-muted text-foreground font-bold hover:bg-muted/80 transition-colors"
                        >
                            Call Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
