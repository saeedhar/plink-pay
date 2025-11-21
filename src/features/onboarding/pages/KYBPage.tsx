import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiRefresh } from "react-icons/bi";
import { useOnboarding } from "../../../store/OnboardingContext";
import { Stepper } from "../../../components/ui/Stepper";
import { FormField, Input } from "../../../components/ui/FormField";
import { SignupButton } from "../../../components/ui/SignupButton";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import KYBIcon from "../../../assets/KYB.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { CustomSelect } from "../components/CustomSelect";
import { MultiSelect } from "../../../components/ui/MultiSelect";
import { validateKYBField, validateOtherText } from "../../../utils/validators";
import { submitKYB } from "../../../services/onboardingAPI";
import { DevScenarioBar } from "../../../dev/DevScenarioBar";
import { fetchAllKybOptions, type PublicKybOption } from "../api/kybPublicService";

export default function KYBPage() {
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [sourceOfFundsOther, setSourceOfFundsOther] = useState("");
  const [expectedTransactionType, setExpectedTransactionType] = useState("");
  const [expectedMonthlyVolume, setExpectedMonthlyVolume] = useState("");
  const [purposeOfAccount, setPurposeOfAccount] = useState<string[]>([]);
  const [purposeOther, setPurposeOther] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  // API options state
  const [kybOptions, setKybOptions] = useState<{
    sourceOfFunds: PublicKybOption[];
    purposeOfAccount: PublicKybOption[];
    businessActivity: PublicKybOption[];
    annualRevenue: PublicKybOption[];
  }>({
    sourceOfFunds: [],
    purposeOfAccount: [],
    businessActivity: [],
    annualRevenue: []
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { state, dispatch } = useOnboarding();

  // Fetch KYB options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoadingOptions(true);
        setOptionsError(null);
        const options = await fetchAllKybOptions();
        setKybOptions(options);
      } catch (error) {
        console.error('Failed to load KYB options:', error);
        setOptionsError(error instanceof Error ? error.message : 'Failed to load options');
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // Validation functions
  const validateSourceOfFunds = (value: string): string | undefined => {
    return validateKYBField(value, "Source of Funds") || undefined;
  };

  const validateExpectedTransactionType = (value: string): string | undefined => {
    return validateKYBField(value, "Expected Transaction Type") || undefined;
  };

  const validateExpectedMonthlyVolume = (value: string): string | undefined => {
    return validateKYBField(value, "Expected Monthly Volume") || undefined;
  };

  const validatePurposeOfAccount = (value: string[]): string | undefined => {
    return validateKYBField(value, "Purpose of Digital Wallet Account") || undefined;
  };

  const validatePurposeOtherText = (value: string): string | undefined => {
    if (purposeOfAccount.includes('other') && !value.trim()) {
      return validateOtherText(value) || undefined;
    }
    return undefined;
  };

  const validateSourceOfFundsOtherText = (value: string): string | undefined => {
    if (sourceOfFunds === 'other' && !value.trim()) {
      return validateOtherText(value) || undefined;
    }
    return undefined;
  };

  const isFormValid = () => {
    return (
      !isLoadingOptions &&
      !optionsError &&
      !validateSourceOfFunds(sourceOfFunds) &&
      !validateExpectedTransactionType(expectedTransactionType) &&
      !validateExpectedMonthlyVolume(expectedMonthlyVolume) &&
      !validatePurposeOfAccount(purposeOfAccount) &&
      (!purposeOfAccount.includes('other') || !validatePurposeOtherText(purposeOther)) &&
      (sourceOfFunds !== 'other' || !validateSourceOfFundsOtherText(sourceOfFundsOther))
    );
  };

  const handleNext = async () => {
    const sourceError = validateSourceOfFunds(sourceOfFunds);
    const transactionError = validateExpectedTransactionType(expectedTransactionType);
    const volumeError = validateExpectedMonthlyVolume(expectedMonthlyVolume);
    const purposeError = validatePurposeOfAccount(purposeOfAccount);
    const otherError = purposeOfAccount.includes('other') ? validatePurposeOtherText(purposeOther) : undefined;
    const sourceOtherError = sourceOfFunds === 'other' ? validateSourceOfFundsOtherText(sourceOfFundsOther) : undefined;

    if (sourceError || transactionError || volumeError || purposeError || otherError || sourceOtherError) {
      setShowErrors(true);
      return;
    }

    setIsLoading(true);

    try {
      const kybData = {
        // KYB Fields - ensure all are properly mapped
        sourceOfFunds: sourceOfFunds || '', // Source of funds (required)
        sourceOfFundsOther: sourceOfFunds === 'other' ? sourceOfFundsOther : undefined, // Other text if "other" selected
        annualRevenue: expectedMonthlyVolume || '', // Annual revenue (maps from expected monthly volume)
        businessActivity: expectedTransactionType || '', // Business activity (maps from expected transaction type)
        purposeOfAccount: purposeOfAccount || [], // Purpose of account (array)
        purposeOther: purposeOfAccount.includes('other') ? purposeOther : undefined, // Other purpose text if "other" selected
      };

      // Log KYB data before storing
      console.log('📋 KYB Data Being Stored:', JSON.stringify(kybData, null, 2));
      console.log('📋 KYB Data Fields:', {
        sourceOfFunds: kybData.sourceOfFunds,
        sourceOfFundsOther: kybData.sourceOfFundsOther,
        annualRevenue: kybData.annualRevenue,
        businessActivity: kybData.businessActivity,
        purposeOfAccount: kybData.purposeOfAccount,
        purposeOther: kybData.purposeOther
      });

      const result = await submitKYB(kybData);
      
      // Store KYB data and result
      dispatch({ type: 'SET_KYB_DATA', payload: kybData });
      console.log("✅ KYB Data Stored in State:", kybData);
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
        <div className="flex min-h-screen"
          style={{
            background: 'linear-gradient(160.08deg, #023A66 38.35%, #0475CC 91.81%)'
          }}
        >       
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
          <main className="flex-1 bg-white rounded-tl-[40px] relative flex flex-col">
            <div className="text-center pt-12 pb-8">
              <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto" />
            </div>
            
            <div className="flex-1 flex items-start justify-center pt-8">
              <div className="max-w-4xl w-full px-8">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <img src={KYBIcon} alt="" className="h-12 w-12" />
                    <h1 className="text-2xl font-bold text-gray-800">
                      Business Verification <span className="text-[#00BDFF]">(KYB)</span>
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    To meet regulations, please provide your business details for verification.
                  </p>
                </div>

                {/* Loading State */}
                {isLoadingOptions && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-600">Loading options...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {optionsError && (
                  <div className="mb-6 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{optionsError}</p>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-8 items-start mb-6">
                {/* Left Column - Independent */}
                <div className="space-y-4 p-6 rounded-3xl" style={{ backgroundColor: '#B9BEC01A' }}>
                  {/* Source of Funds */}
                  <div>
                    <label className="font-manrope block font-medium text-gray-700 mb-2">
                      Source of Funds
                    </label>
                    <div className="relative">
                      <select
                        value={sourceOfFunds}
                        onChange={(e) => {
                          setSourceOfFunds(e.target.value);
                          setShowErrors(false);
                          if (e.target.value !== 'other') {
                            setSourceOfFundsOther("");
                          }
                        }}
                        className="border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0475CC] focus:border-transparent transition-all appearance-none"
                        style={{
                          width: '350px',
                          height: '48px',
                          borderRadius: '15px',
                          paddingTop: '8px',
                          paddingRight: '40px',
                          paddingBottom: '8px',
                          paddingLeft: '12px',
                          fontFamily: 'Hanken Grotesk',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '145%',
                          color: '#98A2B3'
                        }}
                        disabled={isLoadingOptions}
                      >
                        <option value="">Select your Source of Funds</option>
                        {kybOptions.sourceOfFunds.map((option) => (
                          <option key={option.id} value={option.code || option.label.toLowerCase().replace(/\s+/g, '-')}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {showErrors && validateSourceOfFunds(sourceOfFunds) && (
                      <p className="mt-1 text-sm text-red-600">{validateSourceOfFunds(sourceOfFunds)}</p>
                    )}
                  </div>

                  {/* Source of Funds Other */}
                  {sourceOfFunds === 'other' && (
                    <div>
                        <label className="font-manrope block font-medium text-gray-700 mb-2">
                          Please specify
                        </label>
                      <textarea
                        value={sourceOfFundsOther}
                        onChange={(e) => {
                          setSourceOfFundsOther(e.target.value);
                          setShowErrors(false);
                        }}
                        placeholder="Please describe your source of funds"
                        className="border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0475CC] focus:border-transparent transition-all resize-none"
                        style={{
                          width: '350px',
                          height: '60px',
                          borderRadius: '15px',
                          paddingTop: '8px',
                          paddingRight: '12px',
                          paddingBottom: '8px',
                          paddingLeft: '12px',
                          fontFamily: 'Hanken Grotesk',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '145%',
                          color: '#98A2B3'
                        }}
                        rows={3}
                        maxLength={200}
                      />
                      {showErrors && validateSourceOfFundsOtherText(sourceOfFundsOther) && (
                        <p className="mt-1 text-sm text-red-600">{validateSourceOfFundsOtherText(sourceOfFundsOther)}</p>
                      )}
                    </div>
                  )}

                  {/* Expected Transaction Type */}
                  <div>
                    <label className="font-manrope block font-medium text-gray-700 mb-2">
                      Expected Transaction Type
                    </label>
                    <div className="relative">
                      <select
                        value={expectedTransactionType}
                        onChange={(e) => {
                          setExpectedTransactionType(e.target.value);
                          setShowErrors(false);
                        }}
                        className="border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0475CC] focus:border-transparent transition-all appearance-none"
                        style={{
                          width: '350px',
                          height: '48px',
                          borderRadius: '15px',
                          paddingTop: '8px',
                          paddingRight: '40px',
                          paddingBottom: '8px',
                          paddingLeft: '12px',
                          fontFamily: 'Hanken Grotesk',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '145%',
                          color: '#98A2B3'
                        }}
                        disabled={isLoadingOptions}
                      >
                        <option value="">Select Expected Transaction Type</option>
                        {kybOptions.businessActivity.map((option) => (
                          <option key={option.id} value={option.code || option.label.toLowerCase().replace(/\s+/g, '-')}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {showErrors && validateExpectedTransactionType(expectedTransactionType) && (
                      <p className="mt-1 text-sm text-red-600">{validateExpectedTransactionType(expectedTransactionType)}</p>
                    )}
                  </div>

                  {/* Expected Monthly Volume */}
                  <div>
                    <label className="font-manrope block font-medium text-gray-700 mb-2">
                      Expected monthly volume and value
                    </label>
                    <div className="relative">
                      <select
                        value={expectedMonthlyVolume}
                        onChange={(e) => {
                          setExpectedMonthlyVolume(e.target.value);
                          setShowErrors(false);
                        }}
                        className="border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0475CC] focus:border-transparent transition-all appearance-none"
                        style={{
                          width: '350px',
                          height: '48px',
                          borderRadius: '15px',
                          paddingTop: '8px',
                          paddingRight: '40px',
                          paddingBottom: '8px',
                          paddingLeft: '12px',
                          fontFamily: 'Hanken Grotesk',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '145%',
                          color: '#98A2B3'
                        }}
                        disabled={isLoadingOptions}
                      >
                        <option value="">Select expected monthly volume</option>
                        {kybOptions.annualRevenue.map((option) => (
                          <option key={option.id} value={option.code || option.label.toLowerCase().replace(/\s+/g, '-')}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {showErrors && validateExpectedMonthlyVolume(expectedMonthlyVolume) && (
                      <p className="mt-1 text-sm text-red-600">{validateExpectedMonthlyVolume(expectedMonthlyVolume)}</p>
                    )}
                  </div>
                </div>

                {/* Right Column with Button - Independent */}
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl" style={{ backgroundColor: '#B9BEC01A' }}>
                    <label className="font-manrope block font-medium text-gray-700 mb-3">
                      Purpose of the Digital Wallet Account
                    </label>
                    
                    <div className="space-y-2">
                      {kybOptions.purposeOfAccount.map((option) => {
                        const optionId = option.code || option.label.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={purposeOfAccount.includes(optionId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPurposeOfAccount([...purposeOfAccount, optionId]);
                                } else {
                                  setPurposeOfAccount(purposeOfAccount.filter(p => p !== optionId));
                                  if (optionId === 'other') {
                                    setPurposeOther("");
                                  }
                                }
                                setShowErrors(false);
                              }}
                              className="w-4 h-4 rounded focus:ring-2 focus:ring-[#00BDFF]"
                              disabled={isLoadingOptions}
                              style={{
                                accentColor: '#00BDFF',
                                border: purposeOfAccount.includes(optionId) ? 'none' : '1px solid #E5E5E5',
                                backgroundColor: purposeOfAccount.includes(optionId) ? '#00BDFF' : 'transparent'
                              }}
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    {showErrors && validatePurposeOfAccount(purposeOfAccount) && (
                      <p className="mt-2 text-sm text-red-600">{validatePurposeOfAccount(purposeOfAccount)}</p>
                    )}

                    {/* Other Purpose */}
                    {purposeOfAccount.includes('other') && (
                      <div className="mt-3">
                        <label className="font-manrope block font-medium text-gray-700 mb-2">
                          Other Purpose
                        </label>
                        <input
                          type="text"
                          value={purposeOther}
                          onChange={(e) => {
                            setPurposeOther(e.target.value);
                            setShowErrors(false);
                          }}
                          placeholder="Please Enter Other Purpose..."
                          className="border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0475CC] focus:border-transparent transition-all text-gray-700"
                          style={{
                            width: '350px',
                            height: '60px',
                            borderRadius: '15px',
                            paddingTop: '8px',
                            paddingRight: '12px',
                            paddingBottom: '8px',
                            paddingLeft: '12px',
                            fontFamily: 'Hanken Grotesk',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '145%',
                            color: '#98A2B3'
                          }}
                          maxLength={100}
                        />
                        {showErrors && validatePurposeOtherText(purposeOther) && (
                          <p className="mt-1 text-sm text-red-600">{validatePurposeOtherText(purposeOther)}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Next Button - Part of right column */}
                  <button
                    onClick={handleNext}
                    disabled={!isFormValid() || isLoading}
                    className="gradient-button w-full py-3 rounded-lg text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Next'
                    )}
                  </button>

                  {/* Footer Copyright */}
                  <div className="mt-8 text-center text-gray-500 text-sm">
                    © 2025 Tyaseer Pay. All rights reserved
                  </div>
                </div>
              </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}