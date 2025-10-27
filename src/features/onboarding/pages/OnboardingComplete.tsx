import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../../store/OnboardingContext";
import { createProfile } from "../../../services/onboardingAPI";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import RightSectionImage from "../../../assets/right-section-password.png";

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
      
      // Prepare profile data from onboarding state
      const profileData = {
        userId: state.data.userId || 'temp_user',
        businessType: state.data.businessType?.toUpperCase() as 'COMPANY' | 'FREELANCER',
        businessName: state.data.kybData?.businessActivity || 'Business Name',
        businessNameArabic: undefined, // Could be added later
        crNumber: state.data.crNumber,
        freelancerLicense: state.data.businessType === 'freelancer' ? state.data.crNumber : undefined,
        nationalId: state.data.idNumber,
        phoneE164: state.data.phone || '',
        annualRevenue: state.data.kybData?.annualRevenue,
        businessActivity: state.data.kybData?.businessActivity,
        accountPurpose: state.data.kybData?.purposeOfAccount?.join(', ')
      };

      console.log('📋 Profile data to send:', profileData);

      // Call the profile creation API
      const result = await createProfile(profileData);
      
      console.log('✅ Profile created successfully:', result);
      
      setSuccess(true);
      setIsCreating(false);
      
      // Mark onboarding as complete
      dispatch({ type: 'NEXT_STEP' });
      
      // Navigate to success page or dashboard after a delay
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 3000);
      
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
    // Navigate to dashboard without creating profile
    navigate('/app/dashboard');
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

        {/* Right Section */}
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={RightSectionImage}
            alt="Onboarding"
          />
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
                Redirecting you to your dashboard...
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={RightSectionImage}
            alt="Onboarding"
          />
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

      {/* Right Section */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={RightSectionImage}
          alt="Onboarding"
        />
      </div>
    </div>
  );
}
