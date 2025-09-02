import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import SignupIcon from "../../../assets/signup.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { CustomInput } from "../components/CustomInput";

export default function PhoneNumberEntry() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  // Phone number validation function
  const validatePhoneNumber = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Phone number is required";
    }
    if (value.length < 9) {
      return "Invalid phone number. Please enter a valid format";
    }
    if (!/^\d+$/.test(value)) {
      return "Phone number must contain only numbers";
    }
    return undefined;
  };

  const handleNext = () => {
    const error = validatePhoneNumber(phoneNumber);
    if (error) {
      setShowError(true);
      return;
    }
    
    console.log("Phone number:", phoneNumber);
    navigate("/onboarding/cr-number");
  };

  const steps = [
    "Select Your Business Type",
    "phone number",
    "CR Number",
    "ID Number",
    "Nafath",
    "KYB",
  ];
  const activeStep = 1; // Phone number step is active

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
              <img src={SignupIcon} alt="" className="h-12 w-12" />
              <h1 className="text-4xl font-bold text-gray-800">
                Sign Up
              </h1>
            </div>

            <p className="text-gray-600 text-center mb-12">
              Enter your phone number<br />
              to Sign up
            </p>

            <div className="mb-8">
              <label className={`block text-sm mb-2 transition-colors ${
                showError && validatePhoneNumber(phoneNumber) ? 
                "text-red-500 font-medium" : 
                !phoneNumber ? "text-gray-500" : "text-gray-700 font-medium"
              }`}>
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setShowError(false); // Clear error when user types
                  }}
                  placeholder="0555555555555555"
                  className={`w-full px-4 py-3 rounded-md focus:outline-none transition-all duration-200 pl-16 ${
                    showError && validatePhoneNumber(phoneNumber) ? 
                    "border-2 border-red-500 bg-white text-gray-900" :
                    !phoneNumber ? 
                    "border-2 border-gray-300 bg-gray-50 text-gray-400" : 
                    "border-2 border-[#2E248F] bg-white text-gray-900"
                  }`}
                  style={{
                    borderRadius: "20px"
                  }}
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 font-medium">
                  +966
                </span>
              </div>
              {showError && validatePhoneNumber(phoneNumber) && (
                <div className="mt-2">
                  <p className="text-sm text-red-500 font-medium">
                    {validatePhoneNumber(phoneNumber)}
                  </p>
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
