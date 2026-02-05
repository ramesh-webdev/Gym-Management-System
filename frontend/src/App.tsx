import { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/public/Navbar';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { ProgramsSection } from '@/components/public/ProgramsSection';
import { BMISection } from '@/components/public/BMISection';
import { PricingSection } from '@/components/public/PricingSection';
import { TrainersSection } from '@/components/public/TrainersSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { ContactSection } from '@/components/public/ContactSection';
import { Footer } from '@/components/public/Footer';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { MembersManagement } from '@/components/admin/MembersManagement';
import { TrainersManagement } from '@/components/admin/TrainersManagement';
import { MembershipPlans } from '@/components/admin/MembershipPlans';
import { AttendanceManagement } from '@/components/admin/AttendanceManagement';
import { PaymentsManagement } from '@/components/admin/PaymentsManagement';
import { ReportsAnalytics } from '@/components/admin/ReportsAnalytics';
import { NotificationsManagement } from '@/components/admin/NotificationsManagement';
import { SettingsManagement } from '@/components/admin/SettingsManagement';
import { MemberSidebar } from '@/components/member/MemberSidebar';
import { MemberDashboard } from '@/components/member/MemberDashboard';
import { MemberMembership } from '@/components/member/MemberMembership';
import { MemberAttendance } from '@/components/member/MemberAttendance';
import { MemberWorkout } from '@/components/member/MemberWorkout';
import { MemberDiet } from '@/components/member/MemberDiet';
import { MemberPayments } from '@/components/member/MemberPayments';
import { MemberSettings } from '@/components/member/MemberSettings';
import type { User } from '@/types';

type PageType =
  | 'home' | 'about' | 'programs' | 'pricing' | 'trainers' | 'contact'
  | 'login' | 'forgot-password'
  | 'admin-dashboard' | 'admin-members' | 'admin-trainers' | 'admin-plans'
  | 'admin-attendance' | 'admin-payments' | 'admin-reports' | 'admin-notifications' | 'admin-settings'
  | 'member-dashboard' | 'member-membership' | 'member-attendance'
  | 'member-workout' | 'member-diet' | 'member-payments' | 'member-settings';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [user, setUser] = useState<User | null>(null);

  // Handle navigation
  const navigate = (page: string) => {
    setCurrentPage(page as PageType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle login
  const handleLogin = (mobile: string, _password: string, role: 'admin' | 'member' | 'trainer') => {
    const mockUser: User = {
      id: '1',
      name: role === 'admin' ? 'Admin User' : role === 'trainer' ? 'Trainer User' : 'Sarah Johnson',
      phone: mobile,
      role,
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    setUser(mockUser);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  // Public Website Layout
  const PublicLayout = () => (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={navigate} />
      <main>
        {currentPage === 'home' && (
          <>
            <HeroSection onNavigate={navigate} />
            <AboutSection />
            <ProgramsSection onNavigate={navigate} />
            <BMISection />
            <PricingSection onNavigate={navigate} />
            <TrainersSection />
            <TestimonialsSection />
            <ContactSection />
          </>
        )}
        {currentPage === 'about' && <AboutSection />}
        {currentPage === 'programs' && <ProgramsSection onNavigate={navigate} />}
        {currentPage === 'pricing' && <PricingSection onNavigate={navigate} />}
        {currentPage === 'trainers' && <TrainersSection />}
        {currentPage === 'contact' && <ContactSection />}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );

  // Admin Dashboard Layout
  const AdminLayout = () => (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
      <div className="flex-1 lg:ml-64">
        <AdminHeader
          onNavigate={navigate}
          onLogout={handleLogout}
          userName={user?.name}
        />
        <main className="min-h-[calc(100vh-4rem)]">
          {currentPage === 'admin-dashboard' && <DashboardOverview />}
          {currentPage === 'admin-members' && <MembersManagement />}
          {currentPage === 'admin-trainers' && <TrainersManagement />}
          {currentPage === 'admin-plans' && <MembershipPlans />}
          {currentPage === 'admin-attendance' && <AttendanceManagement />}
          {currentPage === 'admin-payments' && <PaymentsManagement />}
          {currentPage === 'admin-reports' && <ReportsAnalytics />}
          {currentPage === 'admin-notifications' && <NotificationsManagement />}
          {currentPage === 'admin-settings' && <SettingsManagement />}
        </main>
      </div>
    </div>
  );

  // Member Dashboard Layout
  const MemberLayout = () => (
    <div className="min-h-screen bg-background flex">
      <MemberSidebar
        currentPage={currentPage}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
      <div className="flex-1 lg:ml-64">
        <main className="min-h-screen pt-0">
          {currentPage === 'member-dashboard' && <MemberDashboard onNavigate={navigate} />}
          {currentPage === 'member-membership' && <MemberMembership />}
          {currentPage === 'member-attendance' && <MemberAttendance />}
          {currentPage === 'member-workout' && <MemberWorkout />}
          {currentPage === 'member-diet' && <MemberDiet />}
          {currentPage === 'member-payments' && <MemberPayments />}
          {currentPage === 'member-settings' && <MemberSettings />}
        </main>
      </div>
    </div>
  );

  // Auth Pages
  const AuthLayout = () => (
    <div className="min-h-screen bg-background">
      {currentPage === 'login' && (
        <LoginForm onNavigate={navigate} onLogin={handleLogin} />
      )}
      {currentPage === 'forgot-password' && (
        <ForgotPasswordForm onNavigate={navigate} />
      )}
    </div>
  );

  // Determine which layout to render
  const renderLayout = () => {
    // Auth pages
    if (currentPage === 'login' || currentPage === 'forgot-password') {
      return <AuthLayout />;
    }

    // Admin pages
    if (currentPage.startsWith('admin-')) {
      return <AdminLayout />;
    }

    // Member pages
    if (currentPage.startsWith('member-')) {
      return <MemberLayout />;
    }

    // Public pages
    return <PublicLayout />;
  };

  return (
    <ThemeProvider>
      {renderLayout()}
    </ThemeProvider>
  );
}

export default App;
