import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiHide, BiShow, BiCheck } from "react-icons/bi";
import { useOnboarding } from "../../../store/OnboardingContext";
import { FormField, Input } from "../../../components/ui/FormField";
import PasswordIcon from "../../../assets/password.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import RightSectionImage from "../../../assets/right-section-password.png";
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
      
      // Navigate to profile creation page
      navigate('/onboarding/complete');
      
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto mb-6" />
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src={PasswordIcon} alt="" className="h-12 w-12" />
              <h1 className="text-4xl font-bold text-gray-800">
                Set Your Password
              </h1>
            </div>
            
            <p className="text-gray-600 mb-8">
              Create a strong password to<br />
              secure your account.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Password Field */}
            <FormField
              id="password"
              label="Password"
              error={showErrors ? (passwordError || undefined) : undefined}
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Your Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setShowErrors(false);
                  }}
                  hasError={!!(showErrors && passwordError)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <BiHide className="w-5 h-5" /> : <BiShow className="w-5 h-5" />}
                </button>
              </div>
            </FormField>

            {/* Confirm Password Field */}
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              error={showErrors ? (confirmPasswordError || undefined) : undefined}
            >
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Your Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setShowErrors(false);
                  }}
                  hasError={!!(showErrors && confirmPasswordError)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <BiHide className="w-5 h-5" /> : <BiShow className="w-5 h-5" />}
                </button>
              </div>
            </FormField>

            {/* Live Password Requirements Checklist */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-3">Your password should contain at least:</p>
              <div className="space-y-2">
                <RequirementItem met={requirements.minLength} text="8 characters" />
                <RequirementItem met={requirements.hasLetters} text="One uppercase letter" />
                <RequirementItem met={requirements.hasLetters} text="One lowercase letter" />
                <RequirementItem met={requirements.hasNumbers} text="One number" />
                <RequirementItem met={requirements.hasSymbols} text="One special character (!@#$...)" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleNext}
              disabled={!isFormValid || isLoading}
              className={`px-12 py-4 rounded-lg font-semibold transition-colors text-lg w-full ${
                !isFormValid || isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#2E248F] text-white hover:bg-[#1a1a5a]"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </div>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Section with Illustration */}
      <div className="flex-1 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-8">
        <div className="max-w-lg">
          <img 
            src={RightSectionImage} 
            alt="Password Security Illustration" 
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}