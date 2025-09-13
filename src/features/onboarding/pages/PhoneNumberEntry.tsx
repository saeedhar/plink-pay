import { useState } from "react";
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

export default function PhoneNumberEntry() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  const { state, dispatch, saveCheckpoint } = useOnboarding();
  const { goToNextStep, canGoToNextStep } = useOnboardingNavigation();
  const { executeAction, isLoading, error } = useLoadingState({
    maxRetries: 3,
    debounceMs: 300
  });

  // Real-time validation
  const validationError = validateSaudiPhone(phoneNumber);
  const isValid = !validationError && phoneNumber.length > 0;

  const handlePhoneChange = (value: string) => {
    // Format as user types and convert Arabic numerals
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    
    // Update state
    dispatch({ type: 'SET_PHONE', payload: formatted });
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
        await sendOTP(cleanPhone);
        
        // Create checkpoint before proceeding
        saveCheckpoint('phone_entered');
        
        // Navigate to next step using enhanced navigation
        return goToNextStep(cleanPhone, {
          optimisticUpdate: () => {
            // Optimistically store phone number
            dispatch({ type: 'SET_PHONE', payload: cleanPhone });
          }
        });
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
        {/* Stepper */}
        <Stepper 
          currentStep={state.currentStep} 
          completedSteps={state.completedSteps} 
        />
        
        <div className="flex min-h-[calc(100vh-120px)] bg-[#2E248F]">
          {/* Sidebar */}
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
          <main className="flex-1 bg-white rounded-tl-[88px] relative flex flex-col">
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
                    error={error || validationError}
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
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      }
                    />
                  </FormField>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleNext}
                    disabled={!canGoToNextStep(() => isValid) || isLoading}
                    className={`px-12 py-4 rounded-lg font-semibold transition-colors text-lg w-full ${
                      !canGoToNextStep(() => isValid) || isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#2E248F] text-white hover:bg-[#1a1a5a]"
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
      </div>

      {/* Duplicate Phone Modal */}
      <AlertModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title="Phone Number Already Registered"
        message="This phone number is already associated with an existing account. Please use a different number or contact support if you believe this is an error."
        buttonLabel="Try Different Number"
        variant="primary"
        icon={
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
    </>
  );
}
