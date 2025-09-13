import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiRefresh } from "react-icons/bi";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { FormField, Input } from "../../../components/ui/FormField";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import KYBIcon from "../../../assets/KYB.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { CustomSelect } from "../components/CustomSelect";
import { MultiSelect } from "../../../components/ui/MultiSelect";
import { validateKYBField, validateOtherText, KYB_OPTIONS } from "../../../utils/validators";
import { submitKYB } from "../../../services/onboardingAPI";

export default function KYBPage() {
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");
  const [purposeOfAccount, setPurposeOfAccount] = useState<string[]>([]);
  const [purposeOther, setPurposeOther] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();

  // Validation functions
  const validateAnnualRevenue = (value: string): string | undefined => {
    return validateKYBField(value, "Annual Revenue") || undefined;
  };

  const validateBusinessActivity = (value: string): string | undefined => {
    return validateKYBField(value, "Business Activity") || undefined;
  };

  const validatePurposeOfAccount = (value: string[]): string | undefined => {
    return validateKYBField(value, "Purpose of Opening the Account") || undefined;
  };

  const validatePurposeOtherText = (value: string): string | undefined => {
    if (purposeOfAccount.includes('other') && !value.trim()) {
      return validateOtherText(value) || undefined;
    }
    return undefined;
  };

  const isFormValid = () => {
    return (
      !validateAnnualRevenue(annualRevenue) &&
      !validateBusinessActivity(businessActivity) &&
      !validatePurposeOfAccount(purposeOfAccount) &&
      (!purposeOfAccount.includes('other') || !validatePurposeOtherText(purposeOther))
    );
  };

  const handleNext = async () => {
    const revenueError = validateAnnualRevenue(annualRevenue);
    const activityError = validateBusinessActivity(businessActivity);
    const purposeError = validatePurposeOfAccount(purposeOfAccount);
    const otherError = purposeOfAccount.includes('other') ? validatePurposeOtherText(purposeOther) : undefined;

    if (revenueError || activityError || purposeError || otherError) {
      setShowErrors(true);
      return;
    }

    setIsLoading(true);

    try {
      const kybData = {
        annualRevenue,
        businessActivity,
        purposeOfAccount,
        purposeOther: purposeOfAccount.includes('other') ? purposeOther : undefined,
      };

      const result = await submitKYB(kybData);
      
      // Store KYB data and result
      dispatch({ type: 'SET_KYB_DATA', payload: kybData });
      console.log("KYB Result:", result);
      
      navigate("/onboarding/password");
    } catch (error) {
      console.error("KYB submission failed:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
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
            activeIndex={5} 
            logoSrc={WhiteLogo} 
          />

          {/* Right content */}
          <main className="flex-1 bg-white rounded-tl-[88px] relative flex flex-col">
            <div className="text-center pt-12 pb-8">
              <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto" />
            </div>
            
            <div className="flex-1 flex items-start justify-center pt-16">
              <div className="max-w-md w-full px-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <img src={KYBIcon} alt="" className="h-12 w-12" />
                  <h1 className="text-4xl font-bold text-gray-800">
                    KYB
                  </h1>
                </div>
                
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <BiRefresh className="w-5 h-5 text-blue-500" />
                    <p className="text-sm text-blue-700 font-medium">
                      To meet regulations, please provide your business details for verification.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  {/* Annual Revenue */}
                  <CustomSelect
                    id="annualRevenue"
                    label="Annual Revenue"
                    placeholder="Less than $100K, $100K–$500K, etc."
                    value={annualRevenue}
                    onChange={(value) => {
                      setAnnualRevenue(value);
                      setShowErrors(false);
                    }}
                    options={[
                      { value: "", label: "Select Annual Revenue" },
                      ...KYB_OPTIONS.annualRevenue
                    ]}
                    validation={validateAnnualRevenue}
                    showError={showErrors}
                  />

                  {/* Business Activity */}
                  <CustomSelect
                    id="businessActivity"
                    label="Business Activity"
                    placeholder="Retail, IT Services, Construction"
                    value={businessActivity}
                    onChange={(value) => {
                      setBusinessActivity(value);
                      setShowErrors(false);
                    }}
                    options={[
                      { value: "", label: "Select Business Activity" },
                      ...KYB_OPTIONS.businessActivity
                    ]}
                    validation={validateBusinessActivity}
                    showError={showErrors}
                  />

                  {/* Purpose of Opening the Account - Multi-Select */}
                  <MultiSelect
                    id="purposeOfAccount"
                    label="Purpose of Opening the Account"
                    placeholder="Business Payments, Client Billing"
                    value={purposeOfAccount}
                    onChange={(value) => {
                      setPurposeOfAccount(value);
                      setShowErrors(false);
                      // Clear "other" text if "other" is deselected
                      if (!value.includes('other')) {
                        setPurposeOther("");
                      }
                    }}
                    options={[...KYB_OPTIONS.purposeOfAccount]}
                    validation={validatePurposeOfAccount}
                    showError={showErrors}
                    required
                  />

                  {/* Other Purpose Text Input */}
                  {purposeOfAccount.includes('other') && (
                    <FormField
                      id="purposeOther"
                      label="Please specify"
                      error={showErrors ? validatePurposeOtherText(purposeOther) : undefined}
                    >
                      <Input
                        id="purposeOther"
                        type="text"
                        placeholder="Describe your business purpose..."
                        value={purposeOther}
                        onChange={(e) => {
                          setPurposeOther(e.target.value);
                          setShowErrors(false);
                        }}
                        hasError={!!(showErrors && validatePurposeOtherText(purposeOther))}
                        maxLength={100}
                      />
                    </FormField>
                  )}
                </div>

                <div className="text-center">
                  <button
                    onClick={handleNext}
                    disabled={!isFormValid() || isLoading}
                    className={`px-12 py-4 rounded-lg font-semibold transition-colors text-lg w-full ${
                      !isFormValid() || isLoading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#2E248F] text-white hover:bg-[#1a1a5a]"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}