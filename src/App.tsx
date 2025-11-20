import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OnboardingProvider } from './store/OnboardingContext';
import { RouteGuard } from './components/navigation/RouteGuard';
import { ProtectedRoute } from './components/navigation/ProtectedRoute';
import { PublicRoute } from './components/navigation/PublicRoute';
import { SessionWarningModal } from './components/security/SessionWarningModal';
import { NafathModal } from './components/modals/NafathModal';
import SessionExpiredModal, { setSessionExpiredHandler } from './components/modals/SessionExpiredModal';
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
import OnboardingComplete from './features/onboarding/pages/OnboardingComplete';
import GlobalScreeningPage from './features/onboarding/pages/GlobalScreeningPage';
import LoginPage from './features/login/pages/LoginPage';
import LoginOTPPage from './features/login/pages/LoginOTPPage';
import OTPVerificationPage from './features/auth/pages/OTPVerificationPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ForgotPasswordOTPPage from './features/auth/pages/ForgotPasswordOTPPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import ResetPasswordSuccessPage from './features/auth/pages/ResetPasswordSuccessPage';
import ForgotPasswordPhonePage from './features/auth/pages/ForgotPasswordPhonePage';
import ForgotPasswordPhoneOTPPage from './features/auth/pages/ForgotPasswordPhoneOTPPage';
import SetPasswordPage from './features/auth/pages/SetPasswordPage';
import ForgotPasswordSelectionPage from './features/auth/pages/ForgotPasswordSelectionPage';
import AccountLockedPage from './features/auth/pages/AccountLockedPage';
import { AppAdminRoutes } from './features/admin/AppAdminRoutes';
import AppNavigator from './components/navigation/AppNavigator';
import TopUp from './features/dashboard/pages/TopUp';
import TopUpCard from './features/dashboard/pages/TopUpCard';
import TopUpSelectMethod from './features/dashboard/pages/TopUpSelectMethod';
import TopUpSelectExistingCard from './features/dashboard/pages/TopUpSelectExistingCard';
import TopUpEnterCVV from './features/dashboard/pages/TopUpEnterCVV';
import TopUp3DSecure from './features/dashboard/pages/TopUp3DSecure';
import TopUpSuccess from './features/dashboard/pages/TopUpSuccess';
import TopUpVirtualIBAN from './features/dashboard/pages/TopUpVirtualIBAN';
import TopUpAddNewCard from './features/dashboard/pages/TopUpAddNewCard';

function AppRoutes() {
  const security = useSecurity();
  const [showSessionExpired, setShowSessionExpired] = React.useState(false);

  // Set up the session expired handler
  React.useEffect(() => {
    setSessionExpiredHandler(() => {
      setShowSessionExpired(true);
    });
  }, []);

  return (
    <>
      <SessionExpiredModal 
        isOpen={showSessionExpired} 
        onClose={() => setShowSessionExpired(false)} 
      />
      <Routes>
        {/* Main route - Splash screen */}
        <Route path="/" element={<Splash />} />
        
        {/* Auth routes - Public routes (redirect if authenticated) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login/verify-otp" 
          element={
            <PublicRoute>
              <LoginOTPPage />
            </PublicRoute>
          } 
        />
        <Route path="/account-locked" element={<AccountLockedPage />} />
        <Route 
          path="/otp-verification" 
          element={
            <PublicRoute>
              <OTPVerificationPage />
            </PublicRoute>
          } 
        />
        
        {/* Forgot Password routes - Public routes */}
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPasswordSelectionPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password/id-bod" 
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password/id-bod/otp" 
          element={
            <PublicRoute>
              <ForgotPasswordOTPPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password-success" 
          element={
            <PublicRoute>
              <ResetPasswordSuccessPage />
            </PublicRoute>
          } 
        />
        
        {/* Forgot Password routes - Phone flow */}
        <Route 
          path="/forgot-password/phone" 
          element={
            <PublicRoute>
              <ForgotPasswordPhonePage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password/phone/otp" 
          element={
            <PublicRoute>
              <ForgotPasswordPhoneOTPPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password/phone/set-password" 
          element={
            <PublicRoute>
              <SetPasswordPage />
            </PublicRoute>
          } 
        />
        
        {/* Admin routes */}
        {(import.meta.env.VITE_ADMIN_ENABLED === 'true' || import.meta.env.PROD) && (
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
          <Route 
            path="complete" 
            element={
              <RouteGuard requiredStep="done">
                <OnboardingComplete />
              </RouteGuard>
            } 
          />
        </Route>
        
        {/* Authenticated App Routes - Protected */}
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <AppNavigator />
            </ProtectedRoute>
          } 
        />

        {/* Services - Top Up - Protected */}
        <Route 
          path="/services/topup" 
          element={
            <ProtectedRoute>
              <TopUp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/card" 
          element={
            <ProtectedRoute>
              <TopUpCard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/card/add" 
          element={
            <ProtectedRoute>
              <TopUpAddNewCard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/card/select-method" 
          element={
            <ProtectedRoute>
              <TopUpSelectMethod />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/card/select-existing" 
          element={
            <ProtectedRoute>
              <TopUpSelectExistingCard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/card/cvv" 
          element={
            <ProtectedRoute>
              <TopUpEnterCVV />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/card/3d-secure" 
          element={
            <ProtectedRoute>
              <TopUp3DSecure />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/card/success" 
          element={
            <ProtectedRoute>
              <TopUpSuccess />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/virtual-iban" 
          element={
            <ProtectedRoute>
              <TopUpVirtualIBAN />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/topup/add-new-card" 
          element={
            <ProtectedRoute>
              <TopUpAddNewCard />
            </ProtectedRoute>
          } 
        />
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


