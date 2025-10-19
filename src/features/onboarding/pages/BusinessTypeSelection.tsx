import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { Modal } from "../../../components/ui/Modal";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import heroLogo from "../../../assets/hero-logo-mini.svg";
import WarningIcon from "../../../assets/warning.svg";
// icons
import SoleProprietorshipIcon from "../../../assets/select your buisness type assets/Vector.svg";
import IndividualOwnerIcon from "../../../assets/select your buisness type assets/Vector-1.svg";
import MultiOwnerIcon from "../../../assets/select your buisness type assets/Vector-2.svg";
import FreelancerIcon from "../../../assets/select your buisness type assets/Vector-3.svg";
import StepSidebar from "../components/StepSidebar";
import { BusinessTypeOption } from "../components/BusinessTypeOption";


export default function BusinessTypeSelection() {
  const [selectedType, setSelectedType] = useState("");
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();

  // Handle business type selection
  const handleBusinessTypeSelect = (typeId: string) => {
    if (typeId === "multi-owner-company") {
      setShowBlockedModal(true);
      return;
    }
    
    setSelectedType(typeId);
    dispatch({ type: 'SET_BUSINESS_TYPE', payload: typeId });
    // Ensure we're on the correct step
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'businessType' });
  };

  // Handle form submission
  const handleNext = () => {
    if (!selectedType) {
      return;
    }
    
    // Update FSM to next step
    dispatch({ type: 'NEXT_STEP' });
    navigate("/onboarding/phone");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      
        <div 
          className="flex min-h-screen"
          style={{
            background: 'linear-gradient(160.08deg, #023A66 38.35%, #0475CC 91.81%)'
          }}
        >
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
            activeIndex={0} 
            logoSrc={WhiteLogo} 
          />

      {/* Right content */}
      <main className="flex-1 bg-white p-12 rounded-tl-[40px] relative">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <img src={heroLogo} alt="" className="h-12 w-12 mx-auto" />
          </div>

          <h1 className="text-3xl font-bold text-[#022466] text-center mb-12">
            Select Your Business Type
          </h1>

          <div className="space-y-4 mb-8">
            {[
              { id: "sole-proprietorship", name: "Sole Proprietorship", icon: SoleProprietorshipIcon },
              { id: "individual-owner-company", name: "Individual Owner Company", icon: IndividualOwnerIcon },
              { id: "multi-owner-company", name: "Multi-Owner Company", icon: MultiOwnerIcon },
              { id: "freelancer", name: "Freelancer", icon: FreelancerIcon },
            ].map((t) => (
              <BusinessTypeOption
                key={t.id}
                id={t.id}
                name={t.name}
                icon={t.icon}
                isSelected={selectedType === t.id}
                onSelect={handleBusinessTypeSelect}
              />
            ))}
          </div>

          <div className="text-sm text-gray-600 mb-10 text-center">
            <p className="mb-4 font-medium">Please choose the type of business that best represents you:</p>
            <ul className="space-y-1 text-left max-w-lg mx-auto">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Sole Proprietorship</strong> - Owned and managed by a single individual.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Individual Owner Company</strong> - A registered company owned by one person.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Freelancer</strong> - Independent professional offering services.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Multi-Owner Company</strong> - A business owned by two or more partners.</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={handleNext}
              className={`font-medium transition-all text-lg border ${
                selectedType
                  ? "bg-[#023A66] text-white hover:bg-[#023A66]/90 border-[#023A66]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
              }`}
              style={{
                width: '362px',
                height: '48px',
                borderRadius: '15px',
                paddingTop: '12px',
                paddingRight: '20px',
                paddingBottom: '12px',
                paddingLeft: '20px',
                gap: '8px'
              }}
              disabled={!selectedType}
            >
              Sign up
            </button>
          </div>
        </div>
      </main>
        </div>
      </div>

      {/* Account Cannot be Opened Modal */}
      <Modal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        title={
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src={WarningIcon} alt="Warning" className="w-16 h-16" />
            </div>
            <h2 className="text-black mb-4" style={{
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '40px',
              letterSpacing: '0%',
              textAlign: 'center'
            }}>
              Account Cannot be Opened
            </h2>
            <p className="text-gray-600" style={{
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '26px',
              letterSpacing: '0%',
              textAlign: 'center'
            }}>
              Your request could not be completed. Please verify your details and try again.
            </p>
          </div>
        }
        primaryButton={{
          label: "Close",
          onClick: () => setShowBlockedModal(false),
          variant: "primary"
        }}
        size="sm"
        className="max-w-sm"
      />
    </>
  );
}
