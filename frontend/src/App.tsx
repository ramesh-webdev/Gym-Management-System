import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import { ProductManagement } from '@/components/admin/ProductManagement';
import { PaymentsManagement } from '@/components/admin/PaymentsManagement';
import { ReportsAnalytics } from '@/components/admin/ReportsAnalytics';
import { NotificationsManagement } from '@/components/admin/NotificationsManagement';
import { SettingsManagement } from '@/components/admin/SettingsManagement';
import { MemberSidebar } from '@/components/member/MemberSidebar';
import { MemberDashboard } from '@/components/member/MemberDashboard';
import { MemberMembership } from '@/components/member/MemberMembership';
import { MemberWorkout } from './components/member/MemberWorkout';
import { MemberDiet } from './components/member/MemberDiet';
import { Shop } from './components/member/Shop';
import { MemberPayments } from './components/member/MemberPayments';
import { MemberSettings } from '@/components/member/MemberSettings';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import type { User } from '@/types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Convert date strings back to Date objects
        parsedUser.createdAt = new Date(parsedUser.createdAt);
        parsedUser.lastLogin = new Date(parsedUser.lastLogin);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

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
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Navigate based on role
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'member') {
      navigate('/member/dashboard');
    } else {
      navigate('/trainer/dashboard');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  // Get current page from location for sidebar highlighting
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/')) {
      return path.replace('/admin/', 'admin-');
    } else if (path.startsWith('/member/')) {
      return path.replace('/member/', 'member-');
    }
    return path.replace('/', '') || 'home';
  };

  // Public Website Layout
  const PublicLayout = () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <AboutSection />
                <ProgramsSection />
                <BMISection />
                <PricingSection />
                <TrainersSection />
                <TestimonialsSection />
                <ContactSection />
              </>
            }
          />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/programs" element={<ProgramsSection />} />
          <Route path="/pricing" element={<PricingSection />} />
          <Route path="/trainers" element={<TrainersSection />} />
          <Route path="/contact" element={<ContactSection />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );

  // Admin Dashboard Layout
  const AdminLayout = () => {
    if (!user || user.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar currentPage={getCurrentPage()} onLogout={handleLogout} />
        <div className="flex-1 lg:ml-64">
          <AdminHeader onLogout={handleLogout} userName={user?.name} />
          <main className="min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="members" element={<MembersManagement />} />
              <Route path="trainers" element={<TrainersManagement />} />
              <Route path="plans" element={<MembershipPlans />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="payments" element={<PaymentsManagement />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="settings" element={<SettingsManagement />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  };

  // Member Dashboard Layout
  const MemberLayout = () => {
    if (!user || user.role !== 'member') {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="min-h-screen bg-background flex">
        <MemberSidebar currentPage={getCurrentPage()} onLogout={handleLogout} />
        <div className="flex-1 lg:ml-64">
          <main className="min-h-screen pt-0">
            <Routes>
              <Route path="dashboard" element={<MemberDashboard />} />
              <Route path="membership" element={<MemberMembership />} />
              <Route path="workout" element={<MemberWorkout />} />
              <Route path="diet" element={<MemberDiet />} />
              <Route path="shop" element={<Shop />} />
              <Route path="payments" element={<MemberPayments />} />
              <Route path="settings" element={<MemberSettings />} />
              <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminLayout />} />
        
        {/* Member Routes */}
        <Route path="/member/*" element={<MemberLayout />} />
        
        {/* Public Routes - must be last */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
      <ScrollToTop />
    </ThemeProvider>
  );
}

export default App;
