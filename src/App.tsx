import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OnboardingProvider } from './store/OnboardingContext';
import { RouteGuard } from './components/navigation/RouteGuard';
import { OnboardingStep } from './store/onboardingFSM';
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

export default function App() {
  return (
    <OnboardingProvider>
      <Router>
        <Routes>
          {/* Main route - Splash screen */}
          <Route path="/" element={<Splash />} />
          
          {/* Onboarding routes with protection */}
          <Route path="/onboarding">
            <Route 
              path="business-type" 
              element={
                <RouteGuard requiredStep={OnboardingStep.BUSINESS_TYPE}>
                  <BusinessTypeSelection />
                </RouteGuard>
              } 
            />
            <Route 
              path="phone" 
              element={
                <RouteGuard requiredStep={OnboardingStep.PHONE}>
                  <PhoneNumberEntry />
                </RouteGuard>
              } 
            />
            <Route 
              path="otp" 
              element={
                <RouteGuard requiredStep={OnboardingStep.OTP}>
                  <OTPVerification />
                </RouteGuard>
              } 
            />
            <Route 
              path="cr-number" 
              element={
                <RouteGuard requiredStep={OnboardingStep.CR_NUMBER}>
                  <CRNumberEntry />
                </RouteGuard>
              } 
            />
            <Route 
              path="id-number" 
              element={
                <RouteGuard requiredStep={OnboardingStep.ID_NUMBER}>
                  <IDNumberEntry />
                </RouteGuard>
              } 
            />
            <Route 
              path="nafath" 
              element={
                <RouteGuard requiredStep={OnboardingStep.NAFATH}>
                  <NafathPage />
                </RouteGuard>
              } 
            />
            <Route 
              path="kyb" 
              element={
                <RouteGuard requiredStep={OnboardingStep.KYB}>
                  <KYBPage />
                </RouteGuard>
              } 
            />
            <Route 
              path="password" 
              element={
                <RouteGuard requiredStep={OnboardingStep.PASSWORD}>
                  <PasswordSetup />
                </RouteGuard>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </OnboardingProvider>
  );
}


