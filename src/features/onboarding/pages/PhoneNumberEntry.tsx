import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import SignupIcon from "../../../assets/signup.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { CustomInput } from "../components/CustomInput";
import { validateSaudiMobile, normalizeSaudiMobile, formatters, cleanInput } from "../../../utils/validation";

export default function PhoneNumberEntry() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  // Enhanced Saudi phone number validation
  const validatePhoneNumber = (value: string): string | undefined => {
    return validateSaudiMobile(value);
  };

  const handleNext = () => {
    const error = validatePhoneNumber(phoneNumber);
    if (error) {
      setShowError(true);
      return;
    }
    
    // Store in E.164 format
    const normalizedPhone = normalizeSaudiMobile(phoneNumber);
    console.log("Phone number (E.164):", normalizedPhone);
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
              <CustomInput
                id="phone"
                label="Phone Number"
                placeholder="555 123 456 or 05 1234 5678"
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value);
                  setShowError(false); // Clear error when user types
                }}
                type="tel"
                formatter={formatters.phone}
                maxLength={15} // Support longer formats
                validation={validatePhoneNumber}
                showError={showError}
                realTimeValidation={true}
                autoComplete="tel"
              />
              {/* Helper text for multiple formats */}
              <p className="text-sm text-gray-500 mt-2">
                Accepts: +966 5XXXX XXXX, 05XXXX XXXX, or 5XXXX XXXX
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={handleNext}
                disabled={!phoneNumber || !!validatePhoneNumber(phoneNumber)}
                className={`px-12 py-4 rounded-lg font-semibold transition-colors text-lg w-full ${
                  !phoneNumber || !!validatePhoneNumber(phoneNumber)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#2E248F] text-white hover:bg-[#1a1a5a]"
                }`}
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
