import { useEffect, useRef, useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function BMISection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Form slide up
      gsap.fromTo(
        '.bmi-form',
        { y: 100, opacity: 0 },
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

      // Visualizer draw
      gsap.fromTo(
        '.bmi-visualizer',
        { strokeDashoffset: 1000 },
        {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: 0.3,
          ease: 'power2.inOut',
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

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // convert to meters
    const w = parseFloat(weight);
    
    if (h > 0 && w > 0) {
      const bmiValue = w / (h * h);
      setBmi(parseFloat(bmiValue.toFixed(1)));
      
      if (bmiValue < 18.5) setCategory('Underweight');
      else if (bmiValue < 25) setCategory('Normal');
      else if (bmiValue < 30) setCategory('Overweight');
      else setCategory('Obese');
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'Underweight': return 'text-blue-500';
      case 'Normal': return 'text-lime-500';
      case 'Overweight': return 'text-yellow-500';
      case 'Obese': return 'text-red-500';
      default: return 'text-foreground';
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden bg-background"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Form Section */}
          <div className="bmi-form">
            <span className="inline-block text-lime-600 dark:text-lime-500 font-accent text-xl mb-4">
              Health Calculator
            </span>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6">
              CALCULATE YOUR <span className="text-lime-500">BMI</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Body Mass Index (BMI) is a simple calculation using a person's height and weight. 
              The formula is BMI = kg/m² where kg is a person's weight in kilograms and m² is their height in metres squared.
            </p>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Height (cm)
                  </label>
                  <Input
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-lime-500 h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-lime-500 h-12"
                  />
                </div>
              </div>

              <Button
                onClick={calculateBMI}
                className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400 font-semibold h-12"
              >
                <Calculator className="mr-2 w-5 h-5" />
                Calculate BMI
              </Button>

              {bmi !== null && (
                <div className="p-6 rounded-xl bg-muted border border-border animate-scale-in">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Your BMI is</div>
                    <div className="font-display text-6xl font-bold text-lime-500 mb-2">
                      {bmi}
                    </div>
                    <div className={`text-xl font-semibold ${getCategoryColor()}`}>
                      {category}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visualizer Section */}
          <div ref={visualizerRef} className="relative flex items-center justify-center">
            {/* BMI Scale Visual */}
            <div className="relative w-full max-w-md">
              {/* Body Silhouette */}
              <svg
                viewBox="0 0 200 400"
                className="w-full h-auto bmi-visualizer"
                style={{ strokeDasharray: 1000 }}
              >
                {/* Body outline */}
                <path
                  d="M100 20 
                         C120 20 130 35 130 50
                         C130 65 125 75 120 80
                         C140 85 155 100 155 130
                         C155 160 145 180 140 200
                         C135 250 140 300 145 350
                         C148 380 140 395 130 395
                         C120 395 115 380 115 350
                         C115 320 110 280 105 250
                         C100 280 95 320 95 350
                         C95 380 90 395 80 395
                         C70 395 62 380 65 350
                         C70 300 75 250 70 200
                         C65 180 55 160 55 130
                         C55 100 70 85 90 80
                         C85 75 80 65 80 50
                         C80 35 90 20 100 20Z"
                  fill="none"
                  stroke="rgba(163, 255, 0, 0.3)"
                  strokeWidth="2"
                />
                
                {/* Fill based on BMI */}
                {bmi && (
                  <path
                    d="M100 20 
                           C120 20 130 35 130 50
                           C130 65 125 75 120 80
                           C140 85 155 100 155 130
                           C155 160 145 180 140 200
                           C135 250 140 300 145 350
                           C148 380 140 395 130 395
                           C120 395 115 380 115 350
                           C115 320 110 280 105 250
                           C100 280 95 320 95 350
                           C95 380 90 395 80 395
                           C70 395 62 380 65 350
                           C70 300 75 250 70 200
                           C65 180 55 160 55 130
                           C55 100 70 85 90 80
                           C85 75 80 65 80 50
                           C80 35 90 20 100 20Z"
                    fill={`rgba(163, 255, 0, ${Math.min(bmi / 40, 0.5)})`}
                    stroke="#a3ff00"
                    strokeWidth="3"
                    className="animate-fade-in"
                  />
                )}
              </svg>

              {/* BMI Scale */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                {[
                  { label: '40+', color: 'bg-red-500', range: 'Obese' },
                  { label: '30', color: 'bg-orange-500', range: 'Overweight' },
                  { label: '25', color: 'bg-yellow-500', range: 'Normal+' },
                  { label: '18.5', color: 'bg-lime-500', range: 'Normal' },
                  { label: '0', color: 'bg-blue-500', range: 'Under' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className={`w-3 h-8 rounded ${item.color}`} />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
