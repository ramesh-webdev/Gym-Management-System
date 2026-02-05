import { useEffect, useRef, useState } from 'react';
import { Instagram, Twitter, Facebook, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mockTrainers } from '@/data/mockData';

gsap.registerPlugin(ScrollTrigger);

export function TrainersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredTrainer, setHoveredTrainer] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal scroll animation
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        gsap.to(scrollContainer, {
          x: () => -(scrollContainer.scrollWidth - window.innerWidth + 100),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 20%',
            end: () => `+=${scrollContainer.scrollWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });
      }

      // Card entrance animations
      gsap.fromTo(
        '.trainer-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
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
      id="trainers"
      className="relative py-24 lg:py-32 overflow-hidden bg-background"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <span className="inline-block text-lime-600 dark:text-lime-500 font-accent text-xl mb-4">
              Expert Team
            </span>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground">
              MEET OUR <span className="text-lime-500">TEAM</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-md">
            Our certified trainers are here to guide you every step of the way on your fitness journey.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 px-4 sm:px-6 lg:px-12 xl:px-20"
      >
        {mockTrainers.map((trainer) => (
          <div
            key={trainer.id}
            className="trainer-card flex-shrink-0 w-[300px] lg:w-[350px] group"
            onMouseEnter={() => setHoveredTrainer(trainer.id)}
            onMouseLeave={() => setHoveredTrainer(null)}
          >
            <div className="relative h-[450px] rounded-2xl overflow-hidden">
              {/* Image */}
              <img
                src={trainer.avatar}
                alt={trainer.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  hoveredTrainer === trainer.id
                    ? 'scale-110 saturate-100'
                    : 'scale-100 saturate-0'
                }`}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(trainer.rating)
                          ? 'text-lime-500 fill-lime-500'
                          : 'text-muted-foreground/20'
                      }`}
                    />
                  ))}
                  <span className="text-muted-foreground text-sm ml-2">{trainer.rating}</span>
                </div>

                {/* Name & Role */}
                <h3 className="font-display text-2xl font-bold text-foreground mb-1 group-hover:text-lime-500 transition-colors">
                  {trainer.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {trainer.specialization.slice(0, 2).join(', ')}
                </p>

                {/* Experience */}
                <div className="text-lime-600 dark:text-lime-500 text-sm font-medium mb-4">
                  {trainer.experience}+ Years Experience
                </div>

                {/* Social Links - Show on hover */}
                <div
                  className={`flex gap-3 transition-all duration-500 ${
                    hoveredTrainer === trainer.id
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  {[Instagram, Twitter, Facebook].map((Icon, index) => (
                    <button
                      key={index}
                      className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-lime-500 hover:text-primary-foreground transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Border */}
              <div
                className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-500 pointer-events-none ${
                  hoveredTrainer === trainer.id
                    ? 'border-lime-500'
                    : 'border-border'
                }`}
              />
            </div>
          </div>
        ))}

        {/* View All Card */}
        <div className="trainer-card flex-shrink-0 w-[300px] lg:w-[350px]">
          <div className="relative h-[450px] rounded-2xl overflow-hidden bg-gradient-to-br from-lime-500/20 to-lime-500/5 border border-lime-500/30 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 rounded-full bg-lime-500/20 flex items-center justify-center mb-6">
              <span className="font-display text-4xl font-bold text-lime-500">+20</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              More Trainers
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Discover our full team of certified fitness professionals
            </p>
            <button className="px-6 py-3 rounded-full bg-lime-500 text-primary-foreground font-semibold hover:bg-lime-400 transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
