import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { SignupInput } from "../../../components/ui/SignupInput";
import { SignupButton } from "../../../components/ui/SignupButton";
import { AlertModal } from "../../../components/ui/Modal";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import IDIcon from "../../../assets/IDNum.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import OnboardingFooter from "../components/OnboardingFooter";
import { validateSaudiId, formatIdNumber, getIdType } from "../../../utils/validators";
import { verifyID, IDVerificationError, IDMismatchError, localScreen, tahaquq } from "../../../services/onboardingAPI";
import { DevScenarioBar } from "../../../dev/DevScenarioBar";

export default function IDNumberEntry() {
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationFailedModal, setShowVerificationFailedModal] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [mockScenario, setMockScenario] = useState<any>({});
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();

  // Update mock scenario when it changes
  useEffect(() => {
    const updateScenario = () => {
      const currentScenario = (window as any).__MOCK_SCENARIO__ || {};
      setMockScenario(currentScenario);
    };
    
    // Initial update
    updateScenario();
    
    // Listen for scenario changes with a custom event
    const handleScenarioChange = () => updateScenario();
    window.addEventListener('mockScenarioChanged', handleScenarioChange);
    
    return () => {
      window.removeEventListener('mockScenarioChanged', handleScenarioChange);
    };
  }, []);
  
  // Debug logging
  console.log('IDNumberEntry - mockScenario:', mockScenario);
  
  // Real-time validation - respect mock scenario for idValid, only show errors after user interaction
  let validationError: string | null = null;
  
  if (mockScenario.idValid === false) {
    validationError = "Invalid ID format (mock scenario)";
  } else if (mockScenario.idValid === true) {
    // If mock scenario says ID is valid, always pass validation
    validationError = null;
  } else {
    validationError = validateSaudiId(idNumber);
  }
  
  const shouldShowValidationError = hasUserInteracted && validationError;
  const isValid = !validationError && (idNumber.length > 0 || mockScenario.idValid === true);

  // Get the ID type for display
  const idType = getIdType(idNumber.replace(/\s/g, ''));

  const handleIdChange = (value: string) => {
    // Mark that user has interacted
    setHasUserInteracted(true);
    
    // Format as user types and convert Arabic numerals
    const formatted = formatIdNumber(value);
    setIdNumber(formatted);
    setError("");
    
    // Update state with clean ID (no spaces) for backend
    const cleanId = formatted.replace(/\s/g, '');
    dispatch({ type: 'SET_ID_NUMBER', payload: cleanId });
  };

  const handleNext = async () => {
    console.log('🚀 handleNext START - mockScenario:', mockScenario);
    
    // Check mock scenario first
    if (mockScenario.idValid === false) {
      console.log('❌ Validation failed due to mock scenario');
      setError("Invalid ID format (mock scenario)");
      return;
    }
    
    // If mock scenario says ID is valid, skip validation completely
    if (mockScenario.idValid === true) {
      console.log('✅ Skipping validation due to mock scenario');
      // Skip validation, proceed with API calls
    } else {
      const validationResult = validateSaudiId(idNumber);
      if (validationResult) {
        console.log('❌ Normal validation failed:', validationResult);
        setError(validationResult);
        return;
      }
    }

    if (!state.data.phone) {
      console.log('handleNext - ERROR: No phone number found');
      setError("Phone number not found. Please restart the process.");
      return;
    }

    console.log('handleNext - Starting API calls...');
    setIsLoading(true);
    setError("");

    try {
      // Step 1: Local Screening
      const cleanId = idNumber.replace(/\s/g, '');
      const cleanPhone = state.data.phone.replace(/\s/g, '');
      
      console.log('handleNext - Starting local screening for ID:', cleanId);
      const screeningResult = await localScreen(cleanId);
      console.log('handleNext - Local screening result:', screeningResult);
      
      if (screeningResult.status === 'HIT') {
        setError("ID verification failed. Please contact support.");
        return;
      }
      
      // Step 2: Tahaquq (Phone-ID match verification)
      console.log('handleNext - Starting tahaquq verification...');
      const tahaquqResult = await tahaquq(cleanPhone, cleanId);
      console.log('handleNext - Tahaquq result:', tahaquqResult);
      
      if (!tahaquqResult.match) {
        console.log('handleNext - Tahaquq mismatch, showing modal');
        setShowMismatchModal(true);
        return;
      }
      
      // Step 3: ID verification successful - proceed to Nafath
      console.log('🎉 All checks passed, navigating to Nafath');
      
      try {
        // Save ID without spaces for backend
        const cleanId = idNumber.replace(/\s/g, '');
        dispatch({ type: 'SET_ID_NUMBER', payload: cleanId });
        dispatch({ type: 'VERIFY_ID_SUCCESS' });
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'nafath' });
        
        // Small delay to ensure state updates before navigation
        setTimeout(() => {
          navigate("/onboarding/nafath");
        }, 50);
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        throw navError;
      }
      
    } catch (err) {
      console.log('handleNext - ERROR caught:', err);
      if (err instanceof IDMismatchError) {
        console.log('handleNext - IDMismatchError, showing modal');
        setShowMismatchModal(true);
      } else if (err instanceof IDVerificationError) {
        console.log('handleNext - IDVerificationError, showing modal');
        setShowVerificationFailedModal(true);
      } else {
        console.log('handleNext - Generic error:', err);
        setError("Failed to verify ID Number. Please try again.");
      }
    } finally {
      console.log('handleNext - Finished, setting loading to false');
      setIsLoading(false);
    }
  };

  const steps = [
    "Select Your Business Type",
    "phone number",
    "CR Number",
    "ID Number",
    "Nafath",
    "KYB",
  ];
  const activeStep = 3; // ID Number step is active

  return (
    <>
      <div className="min-h-screen bg-gray-50">

        
        <div 
          className="flex min-h-screen"
          style={{
            background: 'linear-gradient(160.08deg, #023A66 38.35%, #0475CC 91.81%)'
          }}
        >          {/* Sidebar */}
          {/* Sidebar */}
          <StepSidebar 
            steps={[
              "Select Your Business Type",
              "phone number", 
              state.data.businessType === "freelancer" ? "Freelancer ID" : "CR Number",
              "ID Number",
              "Nafath",
              "KYB"
            ]} 
            activeIndex={3} 
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
                  <img src={IDIcon} alt="" className="h-12 w-12" />
                  <h1 className="text-4xl font-bold text-gray-800">
                    ID Number
                  </h1>
                </div>

                <p className="text-gray-600 text-center mb-12">
                  Enter the ID number of the<br />
                  company owner or authorized<br />
                  person.
                </p>

                {/* Inline error display as shown in Figma - only show after user interaction */}
                {(error || shouldShowValidationError) && (
                  <div className="mb-4 text-center">
                    <p className="text-red-500 text-sm font-medium">
                      Invalid ID Number. Please enter a valid format.
                    </p>
                  </div>
                )}

                {/* ID Type Indicator */}
                {idNumber && idType !== 'unknown' && !validationError && (
                  <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        idType === 'saudi' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-700">
                        {idType === 'saudi' ? 'Saudi National ID' : 'Iqama ID'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <SignupInput
                    id="idNumber"
                    label="ID Number"
                    placeholder="Enter ID Number"
                    value={idNumber}
                    onChange={(e) => handleIdChange(e.target.value)}
                    hasError={!!(error || shouldShowValidationError)}
                    maxLength={12}
                    autoComplete="off"
                    error={error || shouldShowValidationError || undefined}
                    addLeftPadding={false}
                    leftIcon={
                      <img src={IDIcon} alt="" className="w-5 h-5" />
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

      {/* ID Verification Failed Modal */}
      <AlertModal
        isOpen={showVerificationFailedModal}
        onClose={() => setShowVerificationFailedModal(false)}
        title="ID Verification Failed"
        message="The ID No. you entered is incorrect. Please check and try again."
        buttonLabel="Close"
        variant="danger"
        icon={
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />

      {/* Mobile Number Doesn't Match ID Modal */}
      <AlertModal
        isOpen={showMismatchModal}
        onClose={() => setShowMismatchModal(false)}
        title="Mobile Number Doesn't Match ID"
        message="The mobile number you entered does not match the records associated with this ID. Please check the information or contact support if you need help."
        buttonLabel="Close"
        variant="danger"
        icon={
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
      
      {/* <DevScenarioBar
        title="ID/Tahaquq Scenarios"
        items={[
          { label: 'Invalid ID format', patch: { idValid: false } },
          { label: 'Phone↔ID mismatch', patch: { idPhoneMismatch: true } },
          { label: 'All good',          patch: { idValid: true, idPhoneMismatch: false } },
        ]}
      /> */}
    </>
  );
}
