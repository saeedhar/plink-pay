import Logo from "../../../assets/logo-mark.svg";
import heroLogoMini from "../../../assets/hero-logo-mini.svg";
import bubbles from "../../../assets/Bubbles.svg";
import { Button } from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Splash() {
  const navigate = useNavigate();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // User is authenticated, redirect to dashboard
      navigate('/app/dashboard', { replace: true });
    }
  }, [navigate]);
  
  const handleRegisterClick = () => {
    navigate("/onboarding/business-type");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-white">
        {/* Gradient overlays for depth */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00BDFF]/20 via-transparent to-[#022466]/10"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#00BDFF]/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-[#022466]/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Bubbles in bottom right */}
      <div className="absolute bottom-0 right-0 z-10">
        <img src={bubbles}  />
      </div>

      {/* Main content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-8 flex items-center">
          {/* Left side - Card with content */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-12 border border-blue-200/30 shadow-2xl">
              {/* Hero logo mini */}
              <div className="text-center mb-8">
                <img src={heroLogoMini} alt="" className="h-12 w-12 mx-auto" />
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold text-[#022466] text-center mb-6">
                Create Collects, Timeless Artworks
              </h1>

              {/* Description */}
              <p className="text-lg text-[#022466]/80 text-center mb-10">
                Browse and build your collection of the world's most digital art.
              </p>

              {/* Buttons */}
              <div className="space-y-4 flex flex-col items-center">
                <Button onClick={handleRegisterClick}>
                  Register
                </Button>
                <Button onClick={handleLoginClick}>
                  Login
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Logo */}
          <div className="flex-1 flex items-center justify-center">
           
              <div className="flex items-center justify-center mb-4">
                <img src={Logo} alt=""  className="text-center"
              style={{
                width: '448px',
                height: '162.51px',
                top: '431px',
                left: '885px',
                opacity: 1
              }} />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
