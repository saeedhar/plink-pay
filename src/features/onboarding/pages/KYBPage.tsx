import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiRefresh } from "react-icons/bi";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import KYBIcon from "../../../assets/KYB.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { CustomSelect } from "../components/CustomSelect";
import { validateKYBField } from "../../../utils/validation";

export default function KYBPage() {
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");
  const [purposeOfAccount, setPurposeOfAccount] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const navigate = useNavigate();

  // Dropdown options
  const annualRevenueOptions = [
    { value: "", label: "Select Annual Revenue" },
    { value: "less-than-100k", label: "Less than SAR 100,000" },
    { value: "100k-500k", label: "SAR 100,000 - 500,000" },
    { value: "500k-1m", label: "SAR 500,000 - 1,000,000" },
    { value: "1m-5m", label: "SAR 1,000,000 - 5,000,000" },
    { value: "5m-10m", label: "SAR 5,000,000 - 10,000,000" },
    { value: "above-10m", label: "Above SAR 10,000,000" }
  ];

  const businessActivityOptions = [
    { value: "", label: "Select Business Activity" },
    { value: "retail", label: "Retail Trade" },
    { value: "wholesale", label: "Wholesale Trade" },
    { value: "it-services", label: "Information Technology Services" },
    { value: "construction", label: "Construction & Engineering" },
    { value: "food-beverage", label: "Food & Beverage" },
    { value: "professional-services", label: "Professional Services" },
    { value: "healthcare", label: "Healthcare Services" },
    { value: "education", label: "Education & Training" },
    { value: "transportation", label: "Transportation & Logistics" },
    { value: "real-estate", label: "Real Estate" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "agriculture", label: "Agriculture" },
    { value: "tourism", label: "Tourism & Hospitality" },
    { value: "financial", label: "Financial Services" },
    { value: "other", label: "Other" }
  ];

  const purposeOptions = [
    { value: "", label: "Select Purpose" },
    { value: "business-payments", label: "Business Payments" },
    { value: "client-billing", label: "Client Billing & Invoicing" },
    { value: "supplier-payments", label: "Supplier Payments" },
    { value: "payroll", label: "Payroll Management" },
    { value: "online-sales", label: "Online Sales & E-commerce" },
    { value: "subscription-billing", label: "Subscription Billing" },
    { value: "international-payments", label: "International Payments" },
    { value: "general-business", label: "General Business Operations" },
    { value: "other", label: "Other" }
  ];

  // Validation functions
  const validateAnnualRevenue = (value: string): string | undefined => {
    return validateKYBField(value, "Annual Revenue");
  };

  const validateBusinessActivity = (value: string): string | undefined => {
    return validateKYBField(value, "Business Activity");
  };

  const validatePurposeOfAccount = (value: string): string | undefined => {
    return validateKYBField(value, "Purpose of Opening the Account");
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
              <CustomSelect
                id="annualRevenue"
                label="Annual Revenue"
                placeholder="Select your annual revenue range"
                value={annualRevenue}
                onChange={(value) => {
                  setAnnualRevenue(value);
                  setShowErrors(false);
                }}
                options={annualRevenueOptions}
                validation={validateAnnualRevenue}
                showError={showErrors}
              />

              <CustomSelect
                id="businessActivity"
                label="Business Activity"
                placeholder="Select your primary business activity"
                value={businessActivity}
                onChange={(value) => {
                  setBusinessActivity(value);
                  setShowErrors(false);
                }}
                options={businessActivityOptions}
                validation={validateBusinessActivity}
                showError={showErrors}
              />

              <CustomSelect
                id="purposeOfAccount"
                label="Purpose of Opening the Account"
                placeholder="Select the main purpose of your account"
                value={purposeOfAccount}
                onChange={(value) => {
                  setPurposeOfAccount(value);
                  setShowErrors(false);
                }}
                options={purposeOptions}
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
