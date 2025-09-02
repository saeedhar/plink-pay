import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import StepSidebar from "../components/StepSidebar";

export default function NafathPage() {
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds countdown
  const showModal = true; // Always show modal
  const navigate = useNavigate();

  const steps = [
    "Select Your Business Type",
    "phone number",
    "CR Number",
    "ID Number",
    "Nafath",
    "KYB",
  ];
  const activeStep = 4; // Nafath step is active

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && showModal) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showModal]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Note: handleCloseModal removed since close button was removed from modal

  const handleGoToNafath = () => {
    // In a real app, this would redirect to Nafath portal
    console.log("Redirecting to Nafath portal...");
    // For demo, we'll simulate completion and go to KYB
    setTimeout(() => {
      navigate("/onboarding/kyb");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-[#2E248F] relative">
      {/* Sidebar */}
      <StepSidebar steps={steps} activeIndex={activeStep} logoSrc={WhiteLogo} />

      {/* Right content - Empty for modal-only view */}
      <main className="flex-1 bg-white rounded-tl-[88px] relative">
      </main>

      {/* Nafath Modal Overlay - Positioned on Nafath Step */}
      {showModal && (
        <div 
          className="fixed top-0 left-0 w-full h-full z-50 pointer-events-none"
          style={{ backgroundColor: '#D9D9D980' }}
        >
          <div 
            className="absolute bg-white rounded-2xl p-12 shadow-2xl border-2 border-gray-200 pointer-events-auto flex flex-col justify-center"
            style={{
              width: '700px',
              height: '500px',
              top: '240px',
              left: '320px',
              opacity: 1
            }}
          >
            {/* Nafath number circle */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#2E248F] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">77</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-center mb-8" style={{ color: '#CE2E81' }}>
              Nafath Redirection
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-8 text-xl leading-relaxed">
              Go to Nafath portal to verify your<br />
              registration
            </p>

            {/* Timer */}
            <p className="text-center mb-12 text-xl font-medium" style={{ color: '#CE2E81' }}>
              Code will Expired in {formatTime(timeLeft)}
            </p>

            {/* Go to Nafath button */}
            <div className="flex justify-center">
              <button
                onClick={handleGoToNafath}
                className="bg-[#2E248F] text-white px-16 py-4 rounded-xl font-semibold hover:bg-[#1a1a5a] transition-colors text-lg"
              >
                Go to Nafath
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
