import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { FormField, Input } from "../../../components/ui/FormField";
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
                  <FormField
                    id="phone"
                    label="Phone Number"
                    helper="Must start with 05 and be exactly 10 digits"
                    required
                  >
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05X XXX XXXX"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      hasError={!!(error || validationError)}
                      maxLength={12} // Formatted length
                      autoComplete="tel"
                      leftIcon={<span className="text-black font-medium">+966</span>}
                      className="pl-16"
                      style={{ borderRadius: '20px', borderColor: '#023B67' }}
                    />
                  </FormField>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleNext}
                    disabled={!isValid || isLoading}
                    className={`px-12 py-3 rounded-2xl font-semibold transition-colors text-lg w-full ${
                      !isValid || isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#023B67] text-white hover:bg-[#023B67]/90"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
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
      <AlertModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title="Already Registered"
        message="This phone number is already registered. Please login to access your account."
        buttonLabel="Go to Login"
        variant="primary"
        onConfirm={() => navigate('/login')}
        icon={
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </>
  );
}
