import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { SignupInput } from "../../../components/ui/SignupInput";
import { SignupButton } from "../../../components/ui/SignupButton";
import { AlertModal } from "../../../components/ui/Modal";
import { useOnboardingNavigation } from "../../../hooks/useOnboardingNavigation";
import { useLoadingState } from "../../../hooks/useLoadingState";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import SignupIcon from "../../../assets/signup.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { validateSaudiPhone, formatPhoneNumber } from "../../../utils/validators";
import { sendOTP, DuplicatePhoneError } from "../../../services/onboardingAPI";
import { DevScenarioBar } from "../../../dev/DevScenarioBar";

export default function PhoneNumberEntry() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  
  const navigate = useNavigate();
  const { state, dispatch, saveCheckpoint } = useOnboarding();
  const { goToNextStep, canGoToNextStep } = useOnboardingNavigation();
  const { executeAction, isLoading, error } = useLoadingState({
    maxRetries: 3,
    debounceMs: 300
  });

  // Ensure we're on the correct step when component mounts
  useEffect(() => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'phone' });
  }, [dispatch]);

  // Real-time validation
  const validationError = validateSaudiPhone(phoneNumber);
  const isValid = !validationError && phoneNumber.length > 0;

  const handlePhoneChange = (value: string) => {
    // Format as user types and convert Arabic numerals
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    
    // Update state and ensure we're on phone step
    dispatch({ type: 'SET_PHONE', payload: formatted });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'phone' });
  };

  const handleNext = async () => {
    setIsTouched(true);
    const validationResult = validateSaudiPhone(phoneNumber);
    if (validationResult) {
      return; // Validation handled by real-time validation
    }

    try {
      await executeAction('send_otp', async () => {
        const cleanPhone = phoneNumber.replace(/\s/g, '');
        
        // Send OTP with integrated retry logic
        await sendOTP(cleanPhone, state.businessType || 'freelancer');
        
        // Update FSM to next step
        dispatch({ type: 'NEXT_STEP' });
        
        // Navigate to OTP page
        navigate('/onboarding/otp');
      });
    } catch (err) {
      if (err instanceof DuplicatePhoneError) {
        setShowDuplicateModal(true);
      }
      // Other errors handled by useLoadingState
    }
  };

  const fieldError = isTouched ? validationError : null;
  const statusError = typeof error === 'string' ? error : null;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      
        
      <div 
          className="flex min-h-screen"
          style={{
            background: 'linear-gradient(160.08deg, #023A66 38.35%, #0475CC 91.81%)'
          }}
        >          {/* Sidebar */}
          <StepSidebar 
            steps={[
              "Select Your Business Type",
              "phone number", 
              "CR Number",
              "ID Number",
              "Nafath",
              "KYB"
            ]} 
            activeIndex={1} 
            logoSrc={WhiteLogo} 
          />

          {/* Right content */}
          <main className="flex-1 bg-white rounded-tl-[40px] relative flex flex-col">
            <div className="text-center pt-12 pb-8">
              <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto" />
            </div>

            <div className="flex-1 flex items-start justify-center pt-16">
              <div className="max-w-md w-full px-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <img src={SignupIcon} alt="" className="h-12 w-12" />
                  <h1 className="text-4xl font-bold text-gray-800">
                    Sign Up
                  </h1>
                </div>

                <p className="text-gray-600 text-center mb-12">
                  Enter your phone number<br />
                  to Sign up
                </p>

                <div className="mb-8">
                  <SignupInput
                    id="phone"
                    label="Phone Number"
                    placeholder="05X XXX XXXX"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  hasError={!!(fieldError || statusError)}
                    maxLength={12}
                    autoComplete="tel"
                    helper="Must start with 05 and be exactly 10 digits"
                    required
                    leftIcon={<span className="text-black font-medium">+966</span>}
                  onBlur={() => setIsTouched(true)}
                  error={(fieldError || statusError) ?? undefined}
                  />
                </div>

                <SignupButton
                  onClick={handleNext}
                  disabled={!isValid}
                  isLoading={isLoading}
                  loadingText="Sending..."
                >
                  Next
                </SignupButton>
              </div>
            </div>
        </main>
      </div>
      
      {/* <DevScenarioBar
        title="Phone Scenarios"
        items={[
          { label: 'Duplicate phone', patch: { duplicatePhone: true } },
          { label: 'OK',               patch: { duplicatePhone: false } },
        ]}
      /> */}
    </div>

      {/* Duplicate Phone Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowDuplicateModal(false)}
              className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center space-y-6">
              {/* Warning Icon */}
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800">
                Already Registered
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-base leading-relaxed">
                This phone number is already registered. Please login to access your account.
              </p>

              {/* Go to Login Button */}
              <button
                onClick={() => navigate('/login')}
                className="w-full gradient-button text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
