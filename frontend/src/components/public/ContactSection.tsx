import { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Clock, Send, ArrowDown, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { sendContactMessage } from '@/api/contact';
import { toast } from 'sonner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPublicSettings, type PublicSettingsResponse } from '@/api/settings';

gsap.registerPlugin(ScrollTrigger);

function formatTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h || '0', 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m || '00'} ${ampm}`;
}

export function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [publicSettings, setPublicSettings] = useState<PublicSettingsResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getPublicSettings()
      .then(setPublicSettings)
      .catch(() => setPublicSettings(null));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-content',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendContactMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', phone: '', message: '' });
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Location',
      content: publicSettings?.address || 'Address will appear here once set in Settings.',
    },
    {
      icon: Phone,
      title: 'Phone',
      content: publicSettings?.phone || 'Phone will appear here once set in Settings.',
    },
    {
      icon: Mail,
      title: 'Email',
      content: publicSettings?.email || 'Email will appear here once set in Settings.',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content:
        publicSettings?.workingHours?.entries?.length
          ? publicSettings.workingHours.entries
            .map((e) => `${e.days}: ${formatTime(e.open)} - ${formatTime(e.close)}`)
            .join(' · ')
          : 'Working hours will appear here once set in Settings.',
    },
  ];

  const mapRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    // Hide after 10 seconds
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowScrollHint(false);
        }
      },
      { threshold: 0.2 } // Trigger when 20% of the map is visible
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollHint(false); // Hide immediately on click
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-24 lg:py-32 overflow-hidden bg-background"
    >
      {/* Scroll Down Hint - Fixed Bottom */}
      <div
        onClick={scrollToMap}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center cursor-pointer animate-bounce bg-background/80 backdrop-blur-sm p-2 rounded-xl border border-border/50 shadow-sm hover:border-lime-500/50 transition-all duration-500 ${showScrollHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
      >
        <span className="text-xs font-medium text-muted-foreground mb-1">View Location</span>
        <ArrowDown className="w-5 h-5 text-lime-500" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div className="contact-content">
            <span className="inline-block text-lime-600 dark:text-lime-500 font-accent text-xl mb-4">
              Get In Touch
            </span>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6">
              LET'S <span className="text-lime-500">CONNECT</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Have questions about our gym or membership plans? Reach out to us
              and our team will get back to you within 24 hours.
            </p>

            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-muted border border-border hover:border-lime-500/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center mb-4 group-hover:bg-lime-500 transition-colors">
                    <item.icon className="w-6 h-6 text-lime-500 group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-content">
            <div className="p-8 rounded-2xl bg-card/50 border border-border">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                Send us a Message
              </h3>

              {submitted ? (
                <div className="text-center py-12 animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-lime-500/20 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-lime-500" />
                  </div>
                  <h4 className="font-display text-2xl font-bold text-foreground mb-2">
                    Message Sent!
                  </h4>
                  <p className="text-muted-foreground">
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Your Name
                      </label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-lime-500 h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Mobile Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: value });
                        }}
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-lime-500 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Your Message
                    </label>
                    <Textarea
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-lime-500 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-lime-500 text-primary-foreground hover:bg-lime-400 font-semibold h-12 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div ref={mapRef} className="mt-12 lg:mt-20 scroll-mt-24">
          <div className="w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-border shadow-lg">
            <iframe
              title="Gym Location"
              src="https://maps.google.com/maps?q=10.751142,79.119317&z=15&output=embed"
              className="w-full h-full grayscale-[0.5] hover:grayscale-0 transition-all duration-500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
