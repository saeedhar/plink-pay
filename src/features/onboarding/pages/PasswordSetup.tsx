import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordIcon from "../../../assets/password.svg";
import HeroLogo from "../../../assets/hero-logo-mini.svg";
import RightSectionImage from "../../../assets/right-section-password.png";
import { CustomInput } from "../components/CustomInput";

export default function PasswordSetup() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validatePassword = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Password is required";
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(value)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) {
      return "Password must contain at least one special character";
    }
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Please confirm your password";
    }
    if (value !== password) {
      return "Passwords do not match";
    }
    return undefined;
  };

  const handleNext = () => {
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    if (passwordError || confirmPasswordError) {
      setShowErrors(true);
      return;
    }
    
    console.log("Password data:", { password, confirmPassword });
    // navigate to next step when implemented
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-6xl w-full flex bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Section - Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="text-center mb-12">
            <img src={HeroLogo} alt="" className="h-12 w-12 mx-auto" />
          </div>

          {/* Header with Icon and Title */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={PasswordIcon} alt="" className="h-16 w-16 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Set Your Password</h1>
              <p className="text-gray-600 text-sm mt-1">
                Create a strong password to<br />
                secure your account.
              </p>
            </div>
          </div>

          {/* Password Fields */}
          <div className="space-y-4 mb-6">
            <CustomInput
              id="password"
              label="Password"
              placeholder="Create Your Password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setShowErrors(false);
              }}
              type="password"
              validation={validatePassword}
              showError={showErrors}
            />
            
            <CustomInput
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm Your Password"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setShowErrors(false);
              }}
              type="password"
              validation={validateConfirmPassword}
              showError={showErrors}
            />
          </div>

          {/* Password Requirements */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-3">Your password should contain at least:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>8 characters</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>One uppercase letter</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>One lowercase letter</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>One number</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>One special character (!@#$...)</span>
              </li>
            </ul>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="w-full bg-[#2E248F] text-white py-3 rounded-lg font-semibold hover:bg-[#1a1a5a] transition-colors text-lg mb-6"
          >
            Next
          </button>

          {/* Progress Bar */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div className="w-8 h-1 bg-[#2E248F] rounded"></div>
              <div className="w-8 h-1 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        </div>

        {/* Right Section - Image */}
        <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#D9D9D954' }}>
          <img 
            src={RightSectionImage} 
            alt="Password Security Illustration" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
