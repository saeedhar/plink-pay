import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { CustomInput } from "../components/CustomInput";
import { validateSaudiNationalID, formatters, cleanInput, getIdType } from "../../../utils/validation";

export default function IDNumberEntry() {
  const [idNumber, setIdNumber] = useState("");
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  // Enhanced Saudi ID Number validation
  const validateIDNumber = (value: string): string | undefined => {
    // Clean the input (remove formatting)
    const cleanID = cleanInput(value);
    return validateSaudiNationalID(cleanID);
  };

  const handleNext = () => {
    const error = validateIDNumber(idNumber);
    if (error) {
      setShowError(true);
      return;
    }
    
    console.log("ID Number:", cleanInput(idNumber));
    console.log("ID Type:", getIdType(cleanInput(idNumber)));
    navigate("/onboarding/nafath");
  };

  // Get the ID type for display
  const idType = getIdType(cleanInput(idNumber));

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
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                ID Number
              </h1>
            </div>

            <p className="text-gray-600 text-center mb-12 leading-relaxed">
              Enter the ID number of the<br />
              company owner or authorized<br />
              person.
            </p>

            <div className="mb-8">
              <CustomInput
                id="idNumber"
                label="ID Number"
                placeholder="1234 567 890"
                value={idNumber}
                onChange={(value) => {
                  setIdNumber(value);
                  setShowError(false); // Clear error when user types
                }}
                type="text"
                formatter={formatters.nationalId}
                maxLength={12} // 10 digits + 2 spaces
                validation={validateIDNumber}
                showError={showError}
                realTimeValidation={true}
                autoComplete="off"
              />
              
              {/* ID Type Indicator */}
              {idNumber && cleanInput(idNumber).length >= 1 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      idType === 'Saudi National' 
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : idType === 'Resident (Iqama)'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {idType === 'Saudi National' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {idType === 'Resident (Iqama)' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span>{idType}</span>
                    </div>
                  </div>
                </div>
              )}
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
