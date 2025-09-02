import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import CRIcon from "../../../assets/CR-Num.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { CustomInput } from "../components/CustomInput";

export default function CRNumberEntry() {
  const [crNumber, setCrNumber] = useState("");
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  // CR Number validation function
  const validateCRNumber = (value: string): string | undefined => {
    if (!value.trim()) {
      return "CR Number is required";
    }
    if (value.length < 10) {
      return "Invalid CR number. Please enter a valid format";
    }
    return undefined;
  };

  const handleNext = () => {
    const error = validateCRNumber(crNumber);
    if (error) {
      setShowError(true);
      return;
    }
    
    console.log("CR Number:", crNumber);
    navigate("/onboarding/id-number");
  };

  const steps = [
    "Select Your Business Type",
    "phone number",
    "CR Number",
    "ID Number",
    "Nafath",
    "KYB",
  ];
  const activeStep = 2; // CR Number step is active

  return (
    <div className="min-h-screen flex bg-[#2E248F]">
      {/* Sidebar */}
      <StepSidebar steps={steps} activeIndex={activeStep} logoSrc={WhiteLogo} />

      {/* Right content */}
      <main className="flex-1 bg-white rounded-tl-[88px] relative flex flex-col">
        <div className="text-center pt-12 pb-8">
          <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto" />
        </div>

        <div className="flex-1 flex items-start justify-center pt-16">
          <div className="max-w-md w-full px-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src={CRIcon} alt="" className="h-12 w-12" />
              <h1 className="text-4xl font-bold text-gray-800">
                CR Number
              </h1>
            </div>

            <p className="text-gray-600 text-center mb-12">
              Enter your CR Number
            </p>

            <div className="mb-8">
              <CustomInput
                id="crNumber"
                label="CR Number"
                placeholder="Enter your CR Number"
                value={crNumber}
                onChange={(value) => {
                  setCrNumber(value);
                  setShowError(false); // Clear error when user types
                }}
                type="text"
                validation={validateCRNumber}
                showError={showError}
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleNext}
                className="bg-[#2E248F] text-white px-12 py-4 rounded-lg font-semibold hover:bg-[#1a1a5a] transition-colors text-lg w-full"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
