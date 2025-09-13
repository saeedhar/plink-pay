import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { AlertModal } from "../../../components/ui/Modal";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { nafathManager, type NafathSession } from "../../../services/nafathService";
import type { NafathStatus } from "../../../services/onboardingAPI";

export default function NafathPage() {
  const [session, setSession] = useState<NafathSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentModal, setCurrentModal] = useState<NafathStatus | 'REDIRECTION' | null>('REDIRECTION');
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();

  useEffect(() => {
    initializeNafath();
    
    // Cleanup on unmount
    return () => {
      nafathManager.cleanup();
    };
  }, []);

  useEffect(() => {
    // Update countdown timer
    const interval = setInterval(() => {
      if (session) {
        setTimeRemaining(nafathManager.getFormattedTimeRemaining());
        
        // Check if expired
        if (nafathManager.isExpired() && currentModal === 'REDIRECTION') {
          setCurrentModal('FAILED');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, currentModal]);

  const initializeNafath = async () => {
    if (!state.data.idNumber) {
      console.error("ID Number not found");
      navigate("/onboarding/id-number");
      return;
    }

    try {
      const cleanId = state.data.idNumber.replace(/\s/g, '');
      const nafathSession = await nafathManager.initiate(cleanId);
      setSession(nafathSession);
      setTimeRemaining(nafathManager.getFormattedTimeRemaining());
      
      // Subscribe to status changes
      nafathManager.onStatusChange((status) => {
        setCurrentModal(status);
        dispatch({ type: 'SET_NAFATH_STATUS', payload: status });
        
        // Navigate to KYB if successful
        if (status === 'RECEIVED') {
          setTimeout(() => {
            navigate("/onboarding/kyb");
          }, 2000);
        }
      });
      
      // Subscribe to expiry
      nafathManager.onExpiry(() => {
        setCurrentModal('FAILED');
      });
      
    } catch (error) {
      console.error("Failed to initialize Nafath:", error);
      setCurrentModal('FAILED');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleGoToNafath = () => {
    nafathManager.openNafath();
    // Update modal to show "Request sent to Nafath"
    setCurrentModal('SENT');
  };

  const handleResend = async () => {
    if (!state.data.idNumber) return;
    
    setIsInitializing(true);
    setCurrentModal('REDIRECTION');
    
    try {
      const cleanId = state.data.idNumber.replace(/\s/g, '');
      await nafathManager.resend(cleanId);
      setSession(nafathManager.getCurrentSession());
      setTimeRemaining(nafathManager.getFormattedTimeRemaining());
    } catch (error) {
      console.error("Failed to resend Nafath:", error);
      setCurrentModal('FAILED');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCloseModal = () => {
    // For most modals, go back to previous step
    if (currentModal === 'FAILED' || currentModal === 'REJECTED') {
      navigate("/onboarding/id-number");
    } else if (currentModal === 'RECEIVED') {
      navigate("/onboarding/kyb");
    }
    // For other statuses, stay on page
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
            activeIndex={4} 
            logoSrc={WhiteLogo} 
          />

          {/* Right content - Background for modals */}
          <main className="flex-1 bg-white rounded-tl-[88px] relative flex items-center justify-center">
            <div className="text-center">
              <img src={HeroLogo} alt="" className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-gray-400">Processing Nafath verification...</p>
            </div>
          </main>
        </div>
      </div>

      {/* Nafath Redirection Modal */}
      <AlertModal
        isOpen={currentModal === 'REDIRECTION'}
        onClose={() => {}} // No close for this modal
        title="Nafath Redirection"
        message={`Go to Nafath portal to verify your registration${timeRemaining ? `\n\nCode will expire in ${timeRemaining}` : ''}`}
        buttonLabel="Go to Nafath"
        variant="primary"
        icon={
          <div className="w-16 h-16 bg-[#2E248F] rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-2xl font-bold">77</span>
          </div>
        }
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#2E248F] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">77</span>
          </div>
          <h3 className="text-2xl font-bold text-[#CE2E81] mb-4">Nafath Redirection</h3>
          <p className="text-gray-600 mb-4">
            Go to Nafath portal to verify your registration
          </p>
          {timeRemaining && (
            <p className="text-[#CE2E81] font-medium mb-6">
              Code will expire in {timeRemaining}
            </p>
          )}
          <button
            onClick={handleGoToNafath}
            disabled={isInitializing}
            className="bg-[#2E248F] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1a1a5a] transition-colors"
          >
            {isInitializing ? 'Initializing...' : 'Go to Nafath'}
          </button>
        </div>
      </AlertModal>

      {/* Request Sent to Nafath Modal */}
      <AlertModal
        isOpen={currentModal === 'SENT'}
        onClose={() => {}} // No close for this modal
        title="نفاذ"
        message="Request sent to Nafath"
        buttonLabel="Done"
        variant="primary"
        icon={
          <div className="w-12 h-12 border-4 border-[#2E248F] border-t-transparent rounded-full animate-spin mx-auto"></div>
        }
      >
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-[#00B4A6] mb-4">نفاذ</h3>
          <div className="w-12 h-12 border-4 border-[#2E248F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 mb-6">Request sent to Nafath</p>
          <button
            onClick={() => setCurrentModal(null)}
            className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </AlertModal>

      {/* Request Under Review Modal */}
      <AlertModal
        isOpen={currentModal === 'UNDER_REVIEW'}
        onClose={handleCloseModal}
        title="Request Under Review"
        message="Your request has been received and is under review for compliance. We'll notify you once the process is complete."
        buttonLabel="Done"
        variant="info"
        icon={
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Request Received Modal */}
      <AlertModal
        isOpen={currentModal === 'RECEIVED'}
        onClose={handleCloseModal}
        title="Request Received"
        message="Thank you! Your request has been successfully submitted and is currently under compliance review. You will be notified through alerts once the process is complete."
        buttonLabel="Done"
        variant="success"
        icon={
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Request Failed Modal */}
      <AlertModal
        isOpen={currentModal === 'FAILED'}
        onClose={handleCloseModal}
        title="Request Failed"
        message="Your Nafath request was declined by you. Please restart the process if this was a mistake."
        buttonLabel="Done"
        variant="danger"
        icon={
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      >
        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            className="bg-[#CE2E81] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#a8246a] transition-colors"
          >
            Resend Code via Nafath
          </button>
        </div>
      </AlertModal>

      {/* Request Rejected Modal */}
      <AlertModal
        isOpen={currentModal === 'REJECTED'}
        onClose={handleCloseModal}
        title="Request Rejected"
        message="We're unable to process your request right now. Please try again later."
        buttonLabel="Done"
        variant="danger"
        icon={
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
    </>
  );
}