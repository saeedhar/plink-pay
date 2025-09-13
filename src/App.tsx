import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OnboardingProvider } from './store/OnboardingContext';
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
          
          {/* Onboarding routes */}
          <Route path="/onboarding">
            <Route path="business-type" element={<BusinessTypeSelection />} />
            <Route path="phone-number" element={<PhoneNumberEntry />} />
            <Route path="otp" element={<OTPVerification />} />
            <Route path="cr-number" element={<CRNumberEntry />} />
            <Route path="id-number" element={<IDNumberEntry />} />
            <Route path="nafath" element={<NafathPage />} />
            <Route path="kyb" element={<KYBPage />} />
            <Route path="password" element={<PasswordSetup />} />
          </Route>
        </Routes>
      </Router>
    </OnboardingProvider>
  );
}


