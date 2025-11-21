import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { createProfile } from "../../../services/onboardingAPI";
import HeroLogo from "../../../assets/hero-logo-mini.svg";

export default function OnboardingComplete() {
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    createUserProfile();
  }, []);

  const createUserProfile = async () => {
    try {
      console.log('🏗️ Creating user profile with state:', state.data);
      console.log('🔍 KYB Data in State:', JSON.stringify(state.data.kybData, null, 2));
      
      // Validate required fields
      if (!state.data.userId) {
        throw new Error('User ID is missing. Please restart the onboarding process.');
      }
      
      if (!state.data.idNumber) {
        throw new Error('National ID is missing. Please go back and enter your ID number.');
      }
      
      if (!state.data.kybData) {
        throw new Error('KYB information is missing. Please go back and complete the KYB form.');
      }
      
      // Check if sourceOfFunds is missing
      if (!state.data.kybData.sourceOfFunds || state.data.kybData.sourceOfFunds.trim() === '') {
        console.warn('⚠️ WARNING: sourceOfFunds is empty or missing in state!', {
          sourceOfFunds: state.data.kybData.sourceOfFunds,
          sourceOfFundsOther: state.data.kybData.sourceOfFundsOther,
          fullKybData: state.data.kybData
        });
      }
      
      // Prepare profile data from onboarding state
      // Handle sourceOfFunds - check if it's 'other' and use the other text, otherwise use the selected value
      let sourceOfFundsValue: string | undefined = undefined;
      
      console.log('🔍 Checking sourceOfFunds in state:', {
        sourceOfFunds: state.data.kybData?.sourceOfFunds,
        sourceOfFundsOther: state.data.kybData?.sourceOfFundsOther,
        isOther: state.data.kybData?.sourceOfFunds === 'other'
      });
      
      if (state.data.kybData?.sourceOfFunds) {
        if (state.data.kybData.sourceOfFunds === 'other') {
          sourceOfFundsValue = state.data.kybData.sourceOfFundsOther || undefined;
          console.log('📝 Using "other" value:', sourceOfFundsValue);
        } else {
          sourceOfFundsValue = state.data.kybData.sourceOfFunds;
          console.log('📝 Using selected value:', sourceOfFundsValue);
        }
      } else {
        console.warn('⚠️ sourceOfFunds is missing or empty in state!');
      }
      
      // Safely construct accountPurpose with null checks
      let accountPurpose = '';
      if (state.data.kybData?.purposeOfAccount && Array.isArray(state.data.kybData.purposeOfAccount) && state.data.kybData.purposeOfAccount.length > 0) {
        accountPurpose = state.data.kybData.purposeOfAccount.join(', ');
        if (state.data.kybData.purposeOfAccount.includes('other') && state.data.kybData.purposeOther) {
          accountPurpose += `, ${state.data.kybData.purposeOther}`;
        }
      }
      
      const profileData: any = {
        userId: state.data.userId,
        businessType: state.data.businessType?.toUpperCase() as 'COMPANY' | 'FREELANCER',
        businessName: state.data.kybData?.businessActivity || 'Business Name',
        businessNameArabic: undefined, // Could be added later
        crNumber: state.data.crNumber,
        freelancerLicense: state.data.businessType === 'freelancer' ? state.data.crNumber : undefined,
        nationalId: state.data.idNumber,
        phoneE164: state.data.phone || '',
        // KYB Fields - include all fields explicitly
        annualRevenue: state.data.kybData?.annualRevenue || undefined,
        businessActivity: state.data.kybData?.businessActivity || undefined,
        accountPurpose: accountPurpose || undefined
      };
      
      // Add sourceOfFunds only if it has a value (don't send empty string or null)
      if (sourceOfFundsValue && sourceOfFundsValue.trim() !== '') {
        profileData.sourceOfFunds = sourceOfFundsValue;
      }

      // Comprehensive logging to verify all KYB data
      console.log('📋 Full Profile Data Being Sent:', JSON.stringify(profileData, null, 2));
      console.log('📋 National ID:', profileData.nationalId);
      console.log('📋 KYB Data Verification:', {
        sourceOfFunds: {
          value: profileData.sourceOfFunds,
          fromState: state.data.kybData?.sourceOfFunds,
          isOther: state.data.kybData?.sourceOfFunds === 'other',
          otherValue: state.data.kybData?.sourceOfFundsOther,
          finalValue: sourceOfFundsValue
        },
        annualRevenue: {
          value: profileData.annualRevenue,
          fromState: state.data.kybData?.annualRevenue
        },
        businessActivity: {
          value: profileData.businessActivity,
          fromState: state.data.kybData?.businessActivity
        },
        accountPurpose: {
          value: profileData.accountPurpose,
          fromState: state.data.kybData?.purposeOfAccount,
          purposeOther: state.data.kybData?.purposeOther
        }
      });
      
      // Warn if sourceOfFunds is missing
      if (!profileData.sourceOfFunds) {
        console.warn('⚠️ WARNING: sourceOfFunds is missing from profile data!', {
          kybData: state.data.kybData,
          sourceOfFundsInState: state.data.kybData?.sourceOfFunds,
          sourceOfFundsOtherInState: state.data.kybData?.sourceOfFundsOther
        });
      }

      // Call the profile creation API
      const result = await createProfile(profileData);
      
      console.log('✅ Profile created successfully:', result);
      
      setSuccess(true);
      setIsCreating(false);
      
      // Mark onboarding as complete
      dispatch({ type: 'NEXT_STEP' });
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Profile creation failed:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
      setIsCreating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsCreating(true);
    createUserProfile();
  };

  const handleSkip = () => {
    // Navigate to login page - user can retry profile creation later
    navigate('/login');
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center">
              <img className="mx-auto h-12 w-auto" src={HeroLogo} alt="Plink" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Creating Your Profile
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we set up your account...
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
              <p className="mt-4 text-center text-sm text-gray-500">
                This may take a few moments
              </p>
            </div>
          </div>
        </div>

       
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center">
              <img className="mx-auto h-12 w-auto" src={HeroLogo} alt="Plink" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Welcome to Tyaseer! 🎉
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your profile has been created successfully. You're all set to start using Tyaseer.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-center">
                <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-gray-500">
                Redirecting you to your login page...
              </p>
            </div>
          </div>
        </div>

       
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <img className="mx-auto h-12 w-auto" src={HeroLogo} alt="Plink" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Profile Creation Failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We encountered an issue while creating your profile.
            </p>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={handleRetry}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
            
            <button
              onClick={handleSkip}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>

     
    </div>
  );
}
