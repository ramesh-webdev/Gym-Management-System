import { useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  CreditCard,
  Dumbbell,
  Apple,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockMembers, mockWorkoutPlan, mockDietPlan } from '@/data/mockData';
import gsap from 'gsap';

interface MemberDashboardProps {
  onNavigate: (page: string) => void;
}

export function MemberDashboard({ onNavigate }: MemberDashboardProps) {
  const cardsRef = useRef<HTMLDivElement>(null);
  const member = mockMembers[0]; // Current logged-in member

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, cardsRef);

    return () => ctx.revert();
  }, []);

  const daysUntilExpiry = Math.ceil(
    (new Date(member.membershipExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, <span className="text-lime-500">{member.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-muted-foreground">Here's your fitness journey at a glance</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500/10 border border-lime-500/20">
          <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
          <span className="text-lime-600 dark:text-lime-500 text-sm font-medium">Member since {member.joinDate.getFullYear()}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits', value: member.attendanceCount, icon: Calendar, color: 'bg-blue-500/20 text-blue-500' },
          { label: 'Days Left', value: daysUntilExpiry, icon: Clock, color: daysUntilExpiry < 30 ? 'bg-red-500/20 text-red-500' : 'bg-lime-500/20 text-lime-500' },
          { label: 'Current Streak', value: '12 days', icon: TrendingUp, color: 'bg-purple-500/20 text-purple-500' },
          { label: 'Plan', value: member.membershipType, icon: CreditCard, color: 'bg-orange-500/20 text-orange-500' },
        ].map((stat, index) => (
          <div
            key={index}
            className="dashboard-card p-5 rounded-xl bg-card/50 border border-border hover:border-border/80 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Membership Status */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Membership Status</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('member-membership')}
              className="text-lime-600 dark:text-lime-500 hover:text-lime-500"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-lime-500/20 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-lime-500" />
                </div>
                <div>
                  <p className="text-foreground font-medium text-lg">{member.membershipType} Plan</p>
                  <p className="text-muted-foreground">ID: {member.membershipId}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Membership Progress</span>
                    <span className="text-lime-600 dark:text-lime-500">75%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-lime-500" />
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Started: {member.joinDate.toLocaleDateString()}</span>
                  <span className="text-muted-foreground">Expires: {member.membershipExpiry.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="sm:w-48 p-4 rounded-lg bg-lime-500/10 border border-lime-500/20">
              <p className="text-muted-foreground text-sm mb-1">Days Remaining</p>
              <p className="font-display text-4xl font-bold text-lime-500">{daysUntilExpiry}</p>
              <p className="text-muted-foreground text-sm mt-2">Renew to keep your benefits</p>
              <Button
                size="sm"
                className="w-full mt-3 bg-lime-500 text-primary-foreground hover:bg-lime-400"
              >
                Renew Now
              </Button>
            </div>
          </div>
        </div>

        {/* Next Workout */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Today's Workout</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('member-workout')}
              className="text-lime-600 dark:text-lime-500 hover:text-lime-500"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {mockWorkoutPlan.exercises.slice(0, 3).map((exercise, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lime-600 dark:text-lime-500 text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">{exercise.name}</p>
                  <p className="text-muted-foreground text-sm">{exercise.sets} sets × {exercise.reps}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => onNavigate('member-workout')}
            className="w-full mt-4 border-border text-foreground hover:bg-muted"
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            View Full Plan
          </Button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Diet Plan Preview */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Today's Nutrition</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('member-diet')}
              className="text-lime-600 dark:text-lime-500 hover:text-lime-500"
            >
              View Plan
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground text-xs mb-1">Protein</p>
              <p className="font-display text-xl font-bold text-lime-500">{mockDietPlan.macros.protein}g</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground text-xs mb-1">Carbs</p>
              <p className="font-display text-xl font-bold text-blue-500">{mockDietPlan.macros.carbs}g</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground text-xs mb-1">Fats</p>
              <p className="font-display text-xl font-bold text-orange-500">{mockDietPlan.macros.fats}g</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <Apple className="w-5 h-5 text-lime-500" />
              <span className="text-foreground">Daily Calories</span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">{mockDietPlan.dailyCalories}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-foreground">Recent Activity</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('member-attendance')}
              className="text-lime-600 dark:text-lime-500 hover:text-lime-500"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              { activity: 'Workout Completed', date: 'Today, 9:30 AM', type: 'workout' },
              { activity: 'Check-in', date: 'Today, 9:00 AM', type: 'checkin' },
              { activity: 'Payment Received', date: 'Jan 1, 2024', type: 'payment' },
              { activity: 'Workout Completed', date: 'Yesterday, 6:00 PM', type: 'workout' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'workout' ? 'bg-lime-500/20' :
                  item.type === 'checkin' ? 'bg-blue-500/20' :
                  'bg-green-500/20'
                }`}>
                  {item.type === 'workout' ? <Dumbbell className="w-4 h-4 text-lime-500" /> :
                   item.type === 'checkin' ? <Calendar className="w-4 h-4 text-blue-500" /> :
                   <CreditCard className="w-4 h-4 text-green-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{item.activity}</p>
                  <p className="text-muted-foreground text-sm">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
