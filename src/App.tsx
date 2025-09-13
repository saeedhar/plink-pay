import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OnboardingProvider } from './store/OnboardingContext';
import { RouteGuard } from './components/navigation/RouteGuard';
import { SessionWarningModal } from './components/security/SessionWarningModal';
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

function AppContent() {
  const security = useSecurity();

  return (
    <>
      <Router>
        <Routes>
          {/* Main route - Splash screen */}
          <Route path="/" element={<Splash />} />
          
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
      </Router>

      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={security.shouldShowWarning}
        timeRemaining={security.timeUntilExpiry}
        onExtendSession={security.extendSession}
        onLogout={security.endSession}
      />
    </>
  );
}

export default function App() {
  return (
    <OnboardingProvider>
      <AppContent />
    </OnboardingProvider>
  );
}


