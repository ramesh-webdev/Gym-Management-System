import { useEffect, useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

interface HeroSectionProps {
  onNavigate: (page: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { y: 100, opacity: 0, rotateX: 45 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, delay: 0.2, ease: 'power4.out' }
      );

      // Subheading animation
      gsap.fromTo(
        subheadingRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.6, ease: 'power3.out' }
      );

      // CTA animation
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.9, ease: 'power2.out' }
      );

      // Background zoom
      gsap.fromTo(
        '.hero-bg',
        { scale: 1.2 },
        { scale: 1, duration: 2, ease: 'power2.out' }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Gym background"
          className="hero-bg w-full h-full object-cover"
        />
        {/* Gradient Overlay - Dark mode only */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent dark:from-background/95 dark:via-background/70 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 pt-24">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 border border-lime-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
            <span className="text-sm font-medium text-lime-600 dark:text-lime-400">
              #1 Rated Gym Management Platform
            </span>
          </div>

          {/* Heading */}
          <h1
            ref={headingRef}
            className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-foreground leading-[0.9] mb-6"
          >
            MAKE YOUR
            <br />
            BODY <span className="text-lime-500 glow-text">SHAPE</span>
          </h1>

          {/* Subheading */}
          <p
            ref={subheadingRef}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            Transform your potential into power with our elite training programs.
            Join thousands of members achieving their fitness goals with GymFlow.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() => onNavigate('login')}
              className="bg-lime-500 text-primary-foreground hover:bg-lime-400 font-semibold text-lg px-8 py-6 group"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('about')}
              className="border-foreground/30 text-foreground hover:bg-muted font-semibold text-lg px-8 py-6 group"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 sm:gap-12 mt-16 pt-8 border-t border-border">
            {[
              { value: '10+', label: 'Years Experience' },
              { value: '5K+', label: 'Active Members' },
              { value: '50+', label: 'Expert Trainers' },
              { value: '98%', label: 'Success Rate' },
            ].map((stat, index) => (
              <div key={index} className="text-center sm:text-left">
                <div className="font-display text-3xl sm:text-4xl font-bold text-lime-500">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
