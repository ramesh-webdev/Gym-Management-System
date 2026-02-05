import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Dumbbell, Flame, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const programs = [
  {
    id: 1,
    name: 'BODYBUILDING',
    description: 'Build muscle mass and sculpt your physique with our comprehensive strength training programs.',
    icon: Dumbbell,
    image: '/about-1.jpg',
    color: 'from-red-500/20 to-orange-500/20',
  },
  {
    id: 2,
    name: 'CROSSFIT',
    description: 'High-intensity functional training that pushes your limits and builds all-around fitness.',
    icon: Flame,
    image: '/about-2.jpg',
    color: 'from-orange-500/20 to-yellow-500/20',
  },
  {
    id: 3,
    name: 'CARDIO',
    description: 'Improve your cardiovascular health and endurance with dynamic heart-pumping workouts.',
    icon: Zap,
    image: '/hero-bg.jpg',
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 4,
    name: 'YOGA',
    description: 'Find balance, flexibility, and inner peace through our mindful yoga practices.',
    icon: Heart,
    image: '/trainer-4.jpg',
    color: 'from-purple-500/20 to-pink-500/20',
  },
];

export function ProgramsSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards fan out animation
      gsap.fromTo(
        '.program-card',
        { rotation: -10, x: -100, opacity: 0 },
        {
          rotation: 0,
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
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
      id="programs"
      className="relative py-24 lg:py-32 overflow-hidden bg-background"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent font-accent text-xl mb-4">
            What We Offer
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground">
            OUR <span className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent">PROGRAMS</span>
          </h2>
        </div>

        {/* Cards Grid */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {programs.map((program, index) => (
            <div
              key={program.id}
              className="program-card group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={program.image}
                  alt={program.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ${hoveredCard === index ? 'scale-110' : 'scale-100'
                    }`}
                />
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${program.color} via-background/60 to-background/90`} />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-ko-500/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-ko-500 group-hover:to-ko-600 transition-colors">
                  <program.icon className="w-6 h-6 bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent group-hover:text-primary-foreground transition-colors" />
                </div>

                {/* Title */}
                <h3 className="font-display text-3xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-ko-500 group-hover:to-ko-600 group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                  {program.name}
                </h3>

                {/* Description - shows on hover */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${hoveredCard === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <p className="text-white/70 text-sm mb-4">
                    {program.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="bg-gradient-to-r from-ko-500 to-ko-600 bg-clip-text text-transparent hover:from-ko-600 hover:to-ko-700 hover:bg-ko-500/10 p-0"
                  >
                    Learn More
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Border Glow */}
              <div
                className={`absolute inset-0 rounded-2xl border-2 transition-all duration-500 ${hoveredCard === index
                    ? 'border-ko-500 shadow-glow'
                    : 'border-white/10'
                  }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
