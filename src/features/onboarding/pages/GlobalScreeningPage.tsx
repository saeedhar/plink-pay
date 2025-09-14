import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { AlertModal } from "../../../components/ui/Modal";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { globalScreening } from "../../../services/onboardingAPI";
import { DevScenarioBar } from "../../../dev/DevScenarioBar";

export default function GlobalScreeningPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();

  useEffect(() => {
    // Set current step in FSM
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'globalScreening' });
    
    // Perform global screening
    performGlobalScreening();
  }, [dispatch]);

  const performGlobalScreening = async () => {
    try {
      setIsLoading(true);
      
      // Get user data for screening
      const userData = {
        idNumber: state.data.idNumber,
        phoneNumber: state.data.phone,
        crNumber: state.data.crNumber,
        businessType: state.data.businessType
      };

      console.log('Starting global screening...');
      const screeningResult = await globalScreening(userData);
      
      if (screeningResult.status === 'CLEAR') {
        // Proceed to KYB
        console.log('Global screening passed, proceeding to KYB');
        dispatch({ type: 'NEXT_STEP' });
        navigate("/onboarding/kyb");
      } else {
        // Show compliance review modal
        console.log('Global screening hit, showing compliance review');
        setErrorMessage(screeningResult.reason || 'Your application requires additional compliance review.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Global screening failed:', error);
      setErrorMessage('Screening service is temporarily unavailable. Please try again later.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    // Go back to previous step
    navigate("/onboarding/nafath");
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
            activeIndex={5} 
            logoSrc={WhiteLogo} 
          />

          {/* Right content */}
          <main className="flex-1 bg-white rounded-tl-[88px] relative flex items-center justify-center">
            <div className="text-center">
              <img src={HeroLogo} alt="" className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-gray-400">
                {isLoading ? 'Performing global screening...' : 'Processing results...'}
              </p>
              {isLoading && (
                <div className="w-8 h-8 border-4 border-[#2E248F] border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        title="Compliance Review Required"
        message={errorMessage}
        buttonLabel="Close"
        variant="warning"
        icon={
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
      
      <DevScenarioBar
        title="Screening/Compliance"
        items={[
          { label: 'Hit → Approved', patch: { globalHit: true, complianceApproved: true } },
          { label: 'Hit → Rejected', patch: { globalHit: true, complianceApproved: false } },
          { label: 'No hit',         patch: { globalHit: false } },
        ]}
      />
    </>
  );
}
