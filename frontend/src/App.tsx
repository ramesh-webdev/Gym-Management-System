import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/public/Navbar';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { ProgramsSection } from '@/components/public/ProgramsSection';
import { BMISection } from '@/components/public/BMISection';
import { PricingSection } from '@/components/public/PricingSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { ContactSection } from '@/components/public/ContactSection';
import { FAQ } from '@/components/public/FAQ';
import { PrivacyPolicy } from '@/components/public/PrivacyPolicy';
import { TermsOfService } from '@/components/public/TermsOfService';
import { Footer } from '@/components/public/Footer';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AdminSidebar, menuItems } from '@/components/admin/AdminSidebar';
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
import { DietPlanManagement } from '@/components/admin/DietPlanManagement';
import { RecipeManagement } from '@/components/admin/RecipeManagement';
import { MemberSidebar } from '@/components/member/MemberSidebar';
import { MemberDashboard } from '@/components/member/MemberDashboard';
import { MemberMembership } from '@/components/member/MemberMembership';
import { MemberDiet } from '@/components/member/MemberDiet';
import { Shop } from '@/components/member/Shop';
import { Recipes } from '@/components/member/Recipes';
import { MemberPayments } from '@/components/member/MemberPayments';
import { MemberSettings } from '@/components/member/MemberSettings';
import { MemberOnboarding } from './components/member/MemberOnboarding';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { hasPersonalTraining } from '@/utils/memberUtils';
import { getStoredUser, logout as apiLogout } from '@/api/auth';
import type { User } from '@/types';

function App() {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const navigate = useNavigate();
  const location = useLocation();

  // Sync from localStorage on mount only (avoids setState loop). Cross-tab sync via storage event below.
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
  }, []);

  // When another tab logs in/out, sync user state (no dependency on user to avoid loop)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        const stored = getStoredUser();
        setUser(stored);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Handle login: user and token are already stored by api.auth.login(); we just set state and navigate.
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (loggedInUser.role === 'member') {
      navigate('/member/dashboard');
    } else {
      navigate('/trainer/dashboard');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    apiLogout();
    navigate('/');
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (_onboardingData: any) => {
    if (!user) return;
    const updatedUser = { ...user, isOnboarded: true };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // In a real app, we would also save the onboardingData to the database
    navigate('/member/dashboard');
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
                <TestimonialsSection />
                <ContactSection />
              </>
            }
          />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/programs" element={<ProgramsSection />} />
          <Route path="/pricing" element={<PricingSection />} />
          <Route path="/contact" element={<ContactSection />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
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

    // Super-admin has full access. Other admins are restricted by permissions array.
    const isSuperAdmin = user.isSuperAdmin === true;
    const permissions = user.permissions;
    const isRestrictedAdmin = !isSuperAdmin && Array.isArray(permissions) && permissions.length > 0;
    const currentPath = location.pathname;
    const currentMenuItem = menuItems.find(item => item.path === currentPath);

    if (isRestrictedAdmin && currentMenuItem && !permissions.includes(currentMenuItem.id)) {
      const firstAllowedItem = menuItems.find(item => permissions.includes(item.id));
      return <Navigate to={firstAllowedItem?.path || '/admin/dashboard'} replace />;
    }

    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar
          currentPage={getCurrentPage()}
          onLogout={handleLogout}
          isSuperAdmin={isSuperAdmin}
          userPermissions={user.permissions}
        />
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
              <Route path="diet-plans" element={<DietPlanManagement />} />
              <Route path="recipes" element={<RecipeManagement />} />
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

    // Force onboarding if not completed
    if (!user.isOnboarded && location.pathname !== '/member/onboarding') {
      return <Navigate to="/member/onboarding" replace />;
    }

    const memberHasPersonalTraining = hasPersonalTraining(user.id);

    return (
      <div className="min-h-screen bg-background flex">
        {!user.isOnboarded ? null : (
          <MemberSidebar
            currentPage={getCurrentPage()}
            onLogout={handleLogout}
            hasPersonalTraining={memberHasPersonalTraining}
          />
        )}
        <div className={cn("flex-1", user.isOnboarded && "lg:ml-64")}>
          <main className="min-h-screen pt-0">
            <Routes>
              <Route path="onboarding" element={<MemberOnboarding onComplete={handleOnboardingComplete} user={user} />} />
              <Route path="dashboard" element={<MemberDashboard />} />
              <Route path="membership" element={<MemberMembership />} />
              <Route
                path="diet"
                element={
                  memberHasPersonalTraining ? (
                    <MemberDiet />
                  ) : (
                    <Navigate to="/member/dashboard" replace />
                  )
                }
              />
              <Route path="shop" element={<Shop />} />
              <Route path="recipes" element={<Recipes />} />
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
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
