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
  
  // Mock authentication status - set to true for testing
  const isAuthenticated = true;

  return (
    <>
      <Routes>
        {/* Main route - Splash screen */}
        <Route path="/" element={<Splash />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/verify-otp" element={<LoginOTPPage />} />
        <Route path="/account-locked" element={<AccountLockedPage />} />
        <Route path="/otp-verification" element={<OTPVerificationPage />} />
        
        {/* Forgot Password routes */}
        <Route path="/forgot-password" element={<ForgotPasswordSelectionPage />} />
        <Route path="/forgot-password/id-bod" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/id-bod/otp" element={<ForgotPasswordOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password-success" element={<ResetPasswordSuccessPage />} />
        
        {/* Forgot Password routes - Phone flow */}
        <Route path="/forgot-password/phone" element={<ForgotPasswordPhonePage />} />
        <Route path="/forgot-password/phone/otp" element={<ForgotPasswordPhoneOTPPage />} />
        <Route path="/forgot-password/phone/set-password" element={<SetPasswordPage />} />
        
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
        
        {/* Authenticated App Routes */}
        {isAuthenticated && (
          <Route path="/app/*" element={<AppNavigator />} />
        )}

        {/* Services - Top Up without app prefix */}
        <Route path="/services/topup" element={<TopUp />} />
        <Route path="/services/topup/card" element={<TopUpCard />} />
        <Route path="/services/topup/card/add" element={<TopUpAddNewCard />} />
        <Route path="/services/topup/card/select-method" element={<TopUpSelectMethod />} />
        <Route path="/services/topup/card/select-existing" element={<TopUpSelectExistingCard />} />
        <Route path="/services/topup/card/cvv" element={<TopUpEnterCVV />} />
        <Route path="/services/topup/card/3d-secure" element={<TopUp3DSecure />} />
        <Route path="/services/topup/card/success" element={<TopUpSuccess />} />
        <Route path="/services/topup/virtual-iban" element={<TopUpVirtualIBAN />} />
        <Route path="/services/topup/add-new-card" element={<TopUpAddNewCard />} />
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


