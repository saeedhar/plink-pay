import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { FormField, Input } from "../../../components/ui/FormField";
import { AlertModal } from "../../../components/ui/Modal";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { validateSaudiId, formatIdNumber, getIdType } from "../../../utils/validators";
import { verifyID, IDVerificationError, IDMismatchError, localScreen, tahaquq } from "../../../services/onboardingAPI";

export default function IDNumberEntry() {
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationFailedModal, setShowVerificationFailedModal] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();

  // Real-time validation
  const validationError = validateSaudiId(idNumber);
  const isValid = !validationError && idNumber.length > 0;

  // Get the ID type for display
  const idType = getIdType(idNumber.replace(/\s/g, ''));

  const handleIdChange = (value: string) => {
    // Format as user types and convert Arabic numerals
    const formatted = formatIdNumber(value);
    setIdNumber(formatted);
    setError("");
    
    // Update state
    dispatch({ type: 'SET_ID_NUMBER', payload: formatted });
  };

  const handleNext = async () => {
    const validationResult = validateSaudiId(idNumber);
    if (validationResult) {
      setError(validationResult);
      return;
    }

    if (!state.data.phone) {
      setError("Phone number not found. Please restart the process.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Step 1: Local Screening
      const cleanId = idNumber.replace(/\s/g, '');
      const cleanPhone = state.data.phone.replace(/\s/g, '');
      
      console.log('Starting local screening...');
      const screeningResult = await localScreen(cleanId);
      
      if (screeningResult.status === 'HIT') {
        setError("ID verification failed. Please contact support.");
        return;
      }
      
      // Step 2: Tahaquq (Phone-ID match verification)
      console.log('Starting tahaquq verification...');
      const tahaquqResult = await tahaquq(cleanPhone, cleanId);
      
      if (!tahaquqResult.match) {
        setShowMismatchModal(true);
        return;
      }
      
      // Step 3: ID verification successful - proceed to Nafath
      dispatch({ type: 'VERIFY_ID_SUCCESS' });
      dispatch({ type: 'NEXT_STEP' });
      navigate("/onboarding/nafath");
      
    } catch (err) {
      if (err instanceof IDMismatchError) {
        setShowMismatchModal(true);
      } else if (err instanceof IDVerificationError) {
        setShowVerificationFailedModal(true);
      } else {
        setError("Failed to verify ID Number. Please try again.");
      }
    } finally {
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
            activeIndex={3} 
            logoSrc={WhiteLogo} 
          />

          {/* Right content */}
          <main className="flex-1 bg-white rounded-tl-[88px] relative flex flex-col">
            <div className="text-center pt-12 pb-8">
              <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto" />
            </div>

            <div className="flex-1 flex items-start justify-center pt-16">
              <div className="max-w-md w-full px-8">
                <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">
                  ID Number
                </h1>

                <p className="text-gray-600 text-center mb-12">
                  Enter the ID number of the<br />
                  company owner or authorized<br />
                  person.
                </p>

                {/* Inline error display as shown in Figma */}
                {(error || validationError) && (
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
                  <FormField
                    id="idNumber"
                    label="ID Number"
                    error={error || validationError}
                  >
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="Enter ID Number"
                      value={idNumber}
                      onChange={(e) => handleIdChange(e.target.value)}
                      hasError={!!(error || validationError)}
                      maxLength={12} // Formatted length
                      autoComplete="off"
                      leftIcon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      }
                    />
                  </FormField>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleNext}
                    disabled={!isValid || isLoading}
                    className={`px-12 py-4 rounded-lg font-semibold transition-colors text-lg w-full ${
                      !isValid || isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#2E248F] text-white hover:bg-[#1a1a5a]"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
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
    </>
  );
}
