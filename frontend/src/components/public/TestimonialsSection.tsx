import { useEffect, useRef, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTestimonialsPublic } from '@/api/testimonials';
import type { Testimonial } from '@/api/testimonials';

gsap.registerPlugin(ScrollTrigger);

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    getTestimonialsPublic().then(setTestimonials);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.testimonial-container',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
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

  const length = testimonials.length;

  const goToNext = () => {
    if (isAnimating || length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrev = () => {
    if (isAnimating || length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + length) % length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-rotate testimonials
  useEffect(() => {
    if (length === 0) return;
    const interval = setInterval(() => {
      if (!isAnimating) goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [length, currentIndex, isAnimating]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden bg-background"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="testimonial-container max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block text-lime-600 dark:text-lime-500 font-accent text-xl mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground">
              WHAT <span className="text-lime-500">CLIENTS SAY</span>
            </h2>
          </div>

          {/* Testimonial Card */}
          {length === 0 ? (
            <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 lg:p-12 text-center text-muted-foreground">
              No testimonials yet.
            </div>
          ) : currentTestimonial ? (
            <div className="relative">
              {/* Quote Icon */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-lime-500 flex items-center justify-center z-10">
                <Quote className="w-6 h-6 text-primary-foreground" />
              </div>

              <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 lg:p-12 pt-12">
                {/* Content */}
                <div
                  key={currentIndex}
                  className="text-center animate-fade-in"
                >
                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(currentTestimonial.rating ?? 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-lime-500 fill-lime-500"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-xl lg:text-2xl text-foreground/90 font-medium leading-relaxed mb-8">
                    "{currentTestimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex flex-col items-center">
                    <img
                      src={currentTestimonial.imageBase64 || currentTestimonial.avatar || ''}
                      alt={currentTestimonial.name}
                      className="w-16 h-16 rounded-full border-2 border-lime-500 mb-4 object-cover bg-muted"
                    />
                    <h4 className="font-display text-xl font-bold text-foreground">
                      {currentTestimonial.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {currentTestimonial.role || ''}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPrev}
                    className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 text-foreground"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>

                  {/* Dots */}
                  <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isAnimating) {
                            setIsAnimating(true);
                            setCurrentIndex(index);
                            setTimeout(() => setIsAnimating(false), 500);
                          }
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? 'w-8 bg-lime-500'
                            : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNext}
                    className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80 text-foreground"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
