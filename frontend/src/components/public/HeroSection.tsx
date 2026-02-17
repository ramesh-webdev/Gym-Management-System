import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

export function HeroSection() {
  const navigate = useNavigate();
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ko-500/10 border border-ko-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-ko-500 to-ko-600 animate-pulse" />
            <span className="text-sm font-medium text-ko-600 dark:text-ko-500">
              #1 Rated Gym Management Platform
            </span>
          </div>

          {/* Heading */}
          <h1
            ref={headingRef}
            className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-foreground leading-[0.9] mb-6"
          >
            DO THE
            <br />
            <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent glow-text">IMPOSSIBLE</span>
          </h1>

          {/* Subheading */}
          <p
            ref={subheadingRef}
            className="text-lg sm:text-xl text-foreground/90 max-w-xl mb-10 leading-relaxed font-medium"
          >
            Transform your potential into power with our elite training programs.
            Join thousands of members achieving their fitness goals with KO Fitness.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-ko-500 to-ko-600 text-primary-foreground hover:from-ko-600 hover:to-ko-700 font-semibold text-lg px-8 py-6 group"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t to-transparent z-10" />
    </section>
  );
}
