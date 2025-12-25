import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { SignupInput } from "../../../components/ui/SignupInput";
import { SignupButton } from "../../../components/ui/SignupButton";
import { AlertModal } from "../../../components/ui/Modal";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import CRIcon from "../../../assets/CR-Num.svg";
import FreelancerIcon from "../../../assets/freelancerid.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import OnboardingFooter from "../components/OnboardingFooter";
import { validateCRNumber, convertArabicToEnglish } from "../../../utils/validators";
import { verifyCR, CRVerificationError } from "../../../services/onboardingAPI";
import { DevScenarioBar } from "../../../dev/DevScenarioBar";

export default function CRNumberEntry() {
  const [crNumber, setCrNumber] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();
  
  // Check if user is a freelancer
  const isFreelancer = state.data.businessType === 'freelancer';

  // Real-time validation - only show errors after user interaction
  const validationError = validateCRNumber(crNumber);
  const shouldShowValidationError = hasUserInteracted && validationError;
  const isValid = !validationError && crNumber.length > 0;

  const handleCRChange = (value: string) => {
    // Mark that user has interacted
    setHasUserInteracted(true);
    
    // Allow only digits (convert Arabic numerals) and limit to 10 chars
    const digitsOnly = convertArabicToEnglish(value).replace(/\D/g, "").substring(0, 10);
    setCrNumber(digitsOnly);
    setError("");
    
    // Update state
    dispatch({ type: 'SET_CR_NUMBER', payload: digitsOnly });
  };

  const handleNext = async () => {
    console.log('🚀 CR handleNext called with:', crNumber);
    
    const validationResult = validateCRNumber(crNumber);
    console.log('🔍 CR validation result:', validationResult);
    
    if (validationResult) {
      console.log('❌ CR validation failed:', validationResult);
      setError(validationResult);
      return;
    }

    console.log('✅ CR validation passed, starting verification...');
    setIsLoading(true);
    setError("");

    try {
      // Verify CR via API
      const cleanCR = crNumber.replace(/\D/g, '');
      console.log('📞 Calling verifyCR with:', cleanCR);
      
      const result = await verifyCR(cleanCR);
      console.log('📋 CR verification result:', result);
      
      if (result.valid) {
        console.log('✅ CR verification successful, navigating...');
        // Save CR number and mark as verified
        dispatch({ type: 'SET_CR_NUMBER', payload: crNumber });
        dispatch({ type: 'VERIFY_CR_SUCCESS' });
        navigate("/onboarding/id-number");
      }
    } catch (err) {
      console.log('🚨 CR verification error:', err);
      if (err instanceof CRVerificationError) {
        setShowFailureModal(true);
      } else {
        setError(isFreelancer 
          ? "Failed to verify Freelancer License Number. Please try again."
          : "Failed to verify CR Number. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
              isFreelancer ? "Freelancer ID" : "CR Number",
              "ID Number",
              "Nafath",
              "KYB"
            ]} 
            activeIndex={2} 
            logoSrc={WhiteLogo} 
          />

          {/* Right content */}
          <main className="flex-1 bg-white rounded-tl-[40px] relative flex flex-col">
            <div className="text-center pt-12 pb-8">
              <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto" />
            </div>

            <div className="flex-1 flex items-start justify-center pt-16">
              <div className="max-w-md w-full px-8">
                <div className="flex flex-col items-center justify-center mb-6">
                  <img src={isFreelancer ? FreelancerIcon : CRIcon} alt="" className={isFreelancer ? "h-20 w-20 mb-4" : "h-12 w-12"} />
                  <h1 className="text-4xl font-bold text-gray-800">
                    {isFreelancer ? "Freelancer License No" : "CR Number"}
                  </h1>
                </div>

                <p className="text-gray-600 text-center mb-12">
                  {isFreelancer 
                    ? "Enter Freelancer License Number to Sign up."
                    : "Enter your CR Number"}
                </p>

                {/* Inline error display as shown in Figma - only show after user interaction */}
                {(error || shouldShowValidationError) && (
                  <div className="mb-4 text-center">
                    <p className="text-red-500 text-sm font-medium">
                      {isFreelancer 
                        ? "The Freelancer License Number you entered is incorrect\nPlease check and try again."
                        : "The CR you entered is incorrect\nPlease check and try again."}
                    </p>
                  </div>
                )}

                <div className="mb-8">
                  <SignupInput
                    id="crNumber"
                    label={isFreelancer ? "Freelancer Number" : "CR Number"}
                    placeholder={isFreelancer ? "Enter your Freelancer Number" : "Enter your CR Number"}
                    value={crNumber}
                    onChange={(e) => handleCRChange(e.target.value)}
                    hasError={!!(error || shouldShowValidationError)}
                    maxLength={10}
                    autoComplete="off"
                    error={error || shouldShowValidationError || undefined}
                    addLeftPadding={false}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                  />
                </div>

                <SignupButton
                  onClick={handleNext}
                  disabled={!isValid}
                  isLoading={isLoading}
                  loadingText="Verifying..."
                >
                  Next
                </SignupButton>
              </div>
            </div>
            <OnboardingFooter />
          </main>
        </div>
      </div>

      {/* CR/Freelancer License Verification Failed Modal */}
      <AlertModal
        isOpen={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        title={isFreelancer ? "Freelancer License Verification Failed" : "CR Verification Failed"}
        message="Something went wrong. Please try again later."
        buttonLabel="Close"
        variant="danger"
        icon={
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
    </>
  );
}
