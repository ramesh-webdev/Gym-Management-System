import { useEffect, useRef } from 'react';
import { TrendingUp, Users, Award } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image 2 reveal animation
      gsap.fromTo(
        image2Ref.current,
        { clipPath: 'circle(0% at 50% 50%)' },
        {
          clipPath: 'circle(100% at 50% 50%)',
          duration: 1,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Image 1 slide in
      gsap.fromTo(
        image1Ref.current,
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.3,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content animation
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Parallax effect on scroll
      gsap.to(image1Ref.current, {
        y: -50,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to(image2Ref.current, {
        rotation: 5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: TrendingUp, value: '10+', label: 'Years Experience', suffix: '' },
    { icon: Users, value: '500', label: 'Happy Clients', suffix: '+' },
    { icon: Award, value: '50', label: 'Expert Trainers', suffix: '+' },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 lg:py-32 overflow-hidden bg-background"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Images Grid */}
          <div className="relative h-[500px] lg:h-[600px]">
            {/* Main Image */}
            <div
              ref={image2Ref}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[70%] aspect-square rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="/about-2.jpg"
                alt="Fitness training"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Secondary Image */}
            <div
              ref={image1Ref}
              className="absolute right-0 top-0 w-[50%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-background"
            >
              <img
                src="/about-1.jpg"
                alt="Gym workout"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Experience Badge */}
            <div className="absolute right-4 bottom-20 bg-lime-500 rounded-xl p-6 shadow-glow">
              <div className="font-display text-5xl font-bold text-primary-foreground">10+</div>
              <div className="text-sm font-medium text-primary-foreground/80">Years of<br />Excellence</div>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="lg:pl-8">
            <span className="inline-block text-lime-600 dark:text-lime-500 font-accent text-xl mb-4">
              About Us
            </span>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              READY TO TRAIN
              <br />
              YOUR <span className="text-lime-500">BODY</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              At GymFlow, we believe fitness is more than just physical exercise—it's a 
              lifestyle transformation. Our state-of-the-art facilities, combined with 
              world-class trainers and personalized programs, create the perfect environment 
              for you to achieve your health and fitness goals.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Whether you're a beginner taking your first steps or an athlete pushing 
              your limits, our comprehensive approach ensures you have everything you need 
              to succeed on your fitness journey.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl bg-muted border border-border hover:border-lime-500/50 transition-colors"
                >
                  <stat.icon className="w-6 h-6 text-lime-500 mb-3" />
                  <div className="font-display text-3xl font-bold text-foreground group-hover:text-lime-500 transition-colors">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
