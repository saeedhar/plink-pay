import { useEffect } from "react";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { DevScenarioBar } from "../../../dev/DevScenarioBar";

export default function NafathPage() {
  const { state, dispatch } = useOnboarding();

  useEffect(() => {
    // Set current step in FSM
    dispatch({ type: 'SET_CURRENT_STEP', payload: 'nafath' });
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
     
      
     <div 
          className="flex min-h-screen"
          style={{
            background: 'linear-gradient(160.08deg, #023A66 38.35%, #0475CC 91.81%)'
          }}
        >        {/* Sidebar */}
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
        <main className="flex-1 bg-white rounded-tl-[40px] relative flex items-center justify-center">
          <div className="text-center">
            <img src={HeroLogo} alt="" className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-gray-400">Processing Nafath verification...</p>
          </div>
        </main>
      </div>
      
      {/* <DevScenarioBar
        title="Nafath Scenarios"
        items={[
          { label: 'Happy: RECEIVED', patch: { nafathSeq: ['SENT','UNDER_REVIEW','RECEIVED'] } },
          { label: 'Rejected',        patch: { nafathSeq: ['REJECTED'] } },
          { label: 'Failed',          patch: { nafathSeq: ['FAILED'] } },
        ]}
      /> */}
    </div>
  );
}