import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiRefresh } from "react-icons/bi";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import KYBIcon from "../../../assets/KYB.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { CustomInput } from "../components/CustomInput";

export default function KYBPage() {
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");
  const [purposeOfAccount, setPurposeOfAccount] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateAnnualRevenue = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Annual Revenue is required";
    }
    return undefined;
  };

  const validateBusinessActivity = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Business Activity is required";
    }
    return undefined;
  };

  const validatePurposeOfAccount = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Purpose of Opening the Account is required";
    }
    return undefined;
  };

  const handleNext = () => {
    const revenueError = validateAnnualRevenue(annualRevenue);
    const activityError = validateBusinessActivity(businessActivity);
    const purposeError = validatePurposeOfAccount(purposeOfAccount);

    if (revenueError || activityError || purposeError) {
      setShowErrors(true);
      return;
    }
    
    console.log("KYB Data:", { annualRevenue, businessActivity, purposeOfAccount });
    navigate("/onboarding/password");
  };

  const steps = [
    "Select Your Business Type",
    "phone number",
    "CR Number",
    "ID Number",
    "Nafath",
    "KYB",
  ];
  const activeStep = 5; // KYB step is active

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
          <div className="max-w-lg w-full px-8">
            <div className="flex items-start gap-6 mb-8">
              <img src={KYBIcon} alt="" className="h-20 w-20 flex-shrink-0" />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 whitespace-nowrap">
                  Business Verification <span style={{ color: '#CE2E81' }}>(KYB)</span>
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To meet regulations, please provide your business details for verification.
                </p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <CustomInput
                id="annualRevenue"
                label="Annual Revenue"
                placeholder="Less than $100K, $100K-$500K, etc."
                value={annualRevenue}
                onChange={(value) => {
                  setAnnualRevenue(value);
                  setShowErrors(false);
                }}
                type="text"
                validation={validateAnnualRevenue}
                showError={showErrors}
              />

              <CustomInput
                id="businessActivity"
                label="Business Activity"
                placeholder="Retail, IT Services, Construction"
                value={businessActivity}
                onChange={(value) => {
                  setBusinessActivity(value);
                  setShowErrors(false);
                }}
                type="text"
                validation={validateBusinessActivity}
                showError={showErrors}
              />

              <CustomInput
                id="purposeOfAccount"
                label="Purpose of Opening the Account"
                placeholder="Business Payments, Client Billing"
                value={purposeOfAccount}
                onChange={(value) => {
                  setPurposeOfAccount(value);
                  setShowErrors(false);
                }}
                type="text"
                validation={validatePurposeOfAccount}
                showError={showErrors}
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleNext}
                className="bg-[#2E248F] text-white px-12 py-4 rounded-lg font-semibold hover:bg-[#1a1a5a] transition-colors text-lg w-full"
              >
                Next
              </button>
              
              {/* Refresh/Cycle Icon */}
              <div className="mt-8 flex justify-center">
                <BiRefresh className="text-gray-400 text-6xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
