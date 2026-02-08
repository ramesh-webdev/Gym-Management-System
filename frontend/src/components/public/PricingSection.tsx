import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getMembershipPlans } from '@/api/membership-plans';
import type { MembershipPlan } from '@/types';

gsap.registerPlugin(ScrollTrigger);

export function PricingSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    getMembershipPlans()
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards 3D flip animation
      gsap.fromTo(
        '.pricing-card',
        { rotateY: 90, opacity: 0 },
        {
          rotateY: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative py-24 lg:py-32 overflow-hidden bg-background"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-ko-500/5 via-transparent to-ko-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ko-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent font-accent text-xl mb-4">
            Pricing Plans
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-4">
            CHOOSE YOUR <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">PLAN</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Flexible membership options designed to fit your lifestyle and fitness goals.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          style={{ perspective: '1000px' }}
        >
          {plansLoading ? (
            <p className="col-span-full text-center text-muted-foreground py-8">Loading plans...</p>
          ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card relative rounded-2xl transition-all duration-500 ${plan.isPopular
                ? 'md:-mt-4 md:mb-4 z-10'
                : ''
                }`}
              style={{ transformStyle: 'preserve-3d' }}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div
                className={`relative h-full p-8 rounded-2xl border transition-all duration-500 ${plan.isPopular
                  ? 'bg-card border-ko-500/50 shadow-glow-lg'
                  : 'bg-card/50 border-border hover:border-border/80'
                  } ${hoveredPlan === plan.id ? 'scale-[1.02]' : ''}`}
              >
                {/* Plan Name */}
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-display text-4xl font-bold bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">
                    ₹{plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.duration === 1 ? '/month' : plan.duration === 3 ? '/quarter' : plan.duration === 6 ? '/half-year' : '/year'}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-ko-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent" />
                      </div>
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => navigate('/login')}
                  className={`w-full h-12 font-semibold transition-all duration-300 ${plan.isPopular
                    ? 'bg-lime-500 text-primary-foreground hover:bg-lime-400'
                    : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
                    }`}
                >
                  Get Started
                </Button>
              </div>

              {/* Floating Animation for Popular */}
              {plan.isPopular && (
                <div className="absolute inset-0 rounded-2xl bg-ko-500/20 blur-xl -z-10 animate-float" />
              )}
            </div>
          ))
          )}
        </div>

      </div>
    </section>
  );
}
