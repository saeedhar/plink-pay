import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiHide, BiShow, BiCheck } from "react-icons/bi";
import { useOnboarding } from "../../../store/OnboardingContext";
import { SignupInput } from "../../../components/ui/SignupInput";
import { SignupButton } from "../../../components/ui/SignupButton";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import PasswordIcon from "../../../assets/password.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import StepSidebar from "../components/StepSidebar";
import { validatePassword, validatePasswordConfirmation, getPasswordRequirements } from "../../../utils/validators";
import { setPassword as setPasswordAPI } from "../../../services/onboardingAPI";

export default function PasswordSetup() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();

  // Get password requirements status for live checklist
  const requirements = getPasswordRequirements(password);
  const passwordError = validatePassword(password);
  const confirmPasswordError = validatePasswordConfirmation(password, confirmPassword);
  
  const isFormValid = !passwordError && !confirmPasswordError && password.length > 0 && confirmPassword.length > 0;
  
  // Debug logging
  console.log('🔍 Password validation debug:');
  console.log('Password:', password);
  console.log('Confirm Password:', confirmPassword);
  console.log('Password Error:', passwordError);
  console.log('Confirm Password Error:', confirmPasswordError);
  console.log('Requirements:', requirements);
  console.log('Is Form Valid:', isFormValid);

  const handleReset = () => {
    // Reset the onboarding state to the beginning
    dispatch({ type: 'RESET_STATE' });
    // Navigate to the first step
    navigate('/onboarding/business-type');
  };

  const handleNext = async () => {
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }

    setIsLoading(true);

    try {
      // Use state.data.userId (correct path in OnboardingState)
      console.log('🔍 Current state:', state);
      console.log('🔍 State.data:', state.data);
      console.log('🔍 State.data.userId:', state.data.userId);
      
      const userId = state.data.userId;
      
      if (!userId) {
        console.error("❌ No user ID found in state:", state);
        throw new Error("User ID not found. Please restart the onboarding process.");
      }
      
      console.log('✅ Setting password for user:', userId);
      await setPasswordAPI(userId, password);
      
      // Mark password as set
      dispatch({ type: 'SET_PASSWORD_SUCCESS' });
      
      // Navigate directly to login page
      navigate('/login');
      
    } catch (error) {
      console.error("Password setup failed:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      <BiCheck className={`w-4 h-4 ${met ? 'text-green-600' : 'text-gray-300'}`} />
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        className="flex min-h-screen"
        style={{
          background: 'linear-gradient(160.08deg, #023A66 38.35%, #0475CC 91.81%)'
        }}
      >
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
           activeIndex={-1} 
           logoSrc={WhiteLogo}
         />

        {/* Right content */}
        <main className="flex-1 bg-white rounded-tl-[40px] relative flex flex-col">
          <div className="text-center pt-12 pb-8">
            <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto" />
          </div>

          <div className="flex-1 flex items-start justify-center pt-6">
            <div className="max-w-md w-full px-8">
              {/* Header Section */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img src={PasswordIcon} alt="" className="h-12 w-12" />
                  <h1 className="text-4xl font-bold text-gray-800">
                    Set Your Password
                  </h1>
                </div>
                <p className="text-gray-600">
                  Create a strong password to secure your account.
                </p>
              </div>

              {/* Password Form */}
              <div className="space-y-6 mb-8">
                {/* Password Field */}
                <SignupInput
                  id="password"
                  label="Password"
                  placeholder="Create Your Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowErrors(false);
                  }}
                  hasError={!!(showErrors && passwordError)}
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                   error={showErrors ? passwordError || undefined : undefined}
                  addLeftPadding={false}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <BiHide size={20} /> : <BiShow size={20} />}
                    </button>
                  }
                />

                {/* Confirm Password Field */}
                <SignupInput
                  id="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm Your Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setShowErrors(false);
                  }}
                  hasError={!!(showErrors && confirmPasswordError)}
                  autoComplete="new-password"
                  type={showConfirmPassword ? "text" : "password"}
                   error={showErrors ? confirmPasswordError || undefined : undefined}
                  addLeftPadding={false}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <BiHide size={20} /> : <BiShow size={20} />}
                    </button>
                  }
                />
              </div>

              {/* Password Requirements */}
              <div className="mb-8 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Your password should contain at least:
                </h3>
                <div className="space-y-2">
                  <RequirementItem met={requirements.minLength} text="8 characters" />
                  <RequirementItem met={requirements.hasLetters} text="One letter (uppercase or lowercase)" />
                  <RequirementItem met={requirements.hasNumbers} text="One number" />
                  <RequirementItem met={requirements.hasSymbols} text="One special character (!@#$..)" />
                </div>
              </div>

              {/* Submit Button */}
              <SignupButton
                onClick={handleNext}
                disabled={!isFormValid}
                isLoading={isLoading}
                loadingText="Setting Password..."
              >
                Next
              </SignupButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}