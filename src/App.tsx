import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OnboardingProvider } from './store/OnboardingContext';
import { RouteGuard } from './components/navigation/RouteGuard';
import { SessionWarningModal } from './components/security/SessionWarningModal';
import { NafathModal } from './components/modals/NafathModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSecurity } from './hooks/useSecurity';
import {
  Splash,
  BusinessTypeSelection,
  PhoneNumberEntry,
  OTPVerification,
  CRNumberEntry,
  IDNumberEntry,
  NafathPage,
  KYBPage,
  PasswordSetup
} from './features/onboarding/pages';
import GlobalScreeningPage from './features/onboarding/pages/GlobalScreeningPage';
import { AppAdminRoutes } from './features/admin/AppAdminRoutes';

function AppRoutes() {
  const security = useSecurity();

  return (
    <>
      <Routes>
        {/* Main route - Splash screen */}
        <Route path="/" element={<Splash />} />
        
        {/* Admin routes */}
        {import.meta.env.VITE_ADMIN_ENABLED === 'true' && (
          <Route path="/admin/*" element={<AppAdminRoutes />} />
        )}
        
        {/* Onboarding routes with protection */}
        <Route path="/onboarding">
          <Route 
            path="business-type" 
            element={
              <RouteGuard requiredStep="businessType">
                <BusinessTypeSelection />
              </RouteGuard>
            } 
          />
          <Route 
            path="phone" 
            element={
              <RouteGuard requiredStep="phone">
                <PhoneNumberEntry />
              </RouteGuard>
            } 
          />
          <Route 
            path="otp" 
            element={
              <RouteGuard requiredStep="otp">
                <OTPVerification />
              </RouteGuard>
            } 
          />
          <Route 
            path="cr-number" 
            element={
              <RouteGuard requiredStep="cr">
                <CRNumberEntry />
              </RouteGuard>
            } 
          />
          <Route 
            path="id-number" 
            element={
              <RouteGuard requiredStep="id">
                <IDNumberEntry />
              </RouteGuard>
            } 
          />
          <Route 
            path="nafath" 
            element={
              <RouteGuard requiredStep="nafath">
                <NafathPage />
              </RouteGuard>
            } 
          />
          <Route 
            path="global-screening" 
            element={
              <RouteGuard requiredStep="globalScreening">
                <GlobalScreeningPage />
              </RouteGuard>
            } 
          />
          <Route 
            path="kyb" 
            element={
              <RouteGuard requiredStep="kyb">
                <KYBPage />
              </RouteGuard>
            } 
          />
          <Route 
            path="password" 
            element={
              <RouteGuard requiredStep="password">
                <PasswordSetup />
              </RouteGuard>
            } 
          />
        </Route>
      </Routes>

              {/* Session Warning Modal */}
              <SessionWarningModal
                isOpen={security.shouldShowWarning}
                timeRemaining={security.timeUntilExpiry}
                onExtendSession={security.extendSession}
                onLogout={security.endSession}
              />

              {/* Global Nafath Modal */}
              <NafathModal />
            </>
          );
        }

export default function App() {
  return (
    <ErrorBoundary>
      <OnboardingProvider>
        <Router>
          <AppRoutes />
        </Router>
      </OnboardingProvider>
    </ErrorBoundary>
  );
}


