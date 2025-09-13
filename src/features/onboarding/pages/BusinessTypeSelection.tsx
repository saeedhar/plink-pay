import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import heroLogo from "../../../assets/hero-logo-mini.svg";
import { validateBusinessType } from "../../../utils/validation";
// icons
import SoleProprietorshipIcon from "../../../assets/select your buisness type assets/Vector.svg";
import IndividualOwnerIcon from "../../../assets/select your buisness type assets/Vector-1.svg";
import MultiOwnerIcon from "../../../assets/select your buisness type assets/Vector-2.svg";
import FreelancerIcon from "../../../assets/select your buisness type assets/Vector-3.svg";
import StepSidebar from "../components/StepSidebar";
import { BusinessTypeOption } from "../components/BusinessTypeOption";


export default function BusinessTypeSelection() {
  const [selectedType, setSelectedType] = useState("");
  const [validationError, setValidationError] = useState<string>("");
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const steps = [
    "Select Your Business Type",
    "phone number",
    "CR Number",
    "ID Number",
    "Nafath",
    "KYB",
  ];
  const activeStep = 0; // later: tie this to form progress

  // Handle business type selection
  const handleBusinessTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setValidationError("");
    setShowError(false);
  };

  // Handle form submission with validation
  const handleNext = () => {
    const error = validateBusinessType(selectedType);
    if (error) {
      setValidationError(error);
      setShowError(true);
      return;
    }
    
    console.log("Selected type:", selectedType);
    navigate("/onboarding/phone-number");
  };

  return (
    <div className="min-h-screen flex bg-[#2E248F]">
      {/* Sidebar */}
      <StepSidebar steps={steps} activeIndex={activeStep} logoSrc={WhiteLogo} />

      {/* Right content */}
      <main className="flex-1 bg-white p-12 rounded-tl-[88px] relative">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <img src={heroLogo} alt="" className="h-12 w-12 mx-auto" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-12">
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

          {/* Validation Error Message */}
          {showError && validationError && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{validationError}</p>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleNext}
              className={`px-12 py-4 rounded-lg font-semibold transition-all text-lg ${
                selectedType
                  ? "bg-[#2E248F] text-white hover:bg-[#1a1a5a] hover:shadow-lg transform hover:-translate-y-0.5"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!selectedType}
            >
              Sign up
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
