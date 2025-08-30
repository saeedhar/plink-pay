import Logo from "../../../assets/logo-mark.svg";
import leftChevrons from "../../../assets/left-chevrons.svg";
import heroLogoMini from "../../../assets/hero-logo-mini.svg";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();
  const BG_TOP = "70%";
  const BG_BOTTOM = "40%";
  const CARD_TOP = "70%";
  const CARD_BOTTOM = "41.57%";
  
  const handleRegisterClick = () => {
    navigate("/onboarding/business-type");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* FULL-PAGE BACKGROUND GRAY SHAPE (behind everything) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
      <div
  className="absolute inset-0 -z-10 bg-[#D9D9D9]"
  style={{ clipPath: `polygon(${BG_TOP} 0, 100% 0, 100% 100%, ${BG_BOTTOM} 100%)` }}
/>
</div>

      {/* Background chevrons - top left */}
      <div className="absolute top-0 left-0 z-0">
        <img src={leftChevrons} alt="" className="h-80 w-60" />
      </div>

      {/* MAIN CARD */}
      <div className="relative w-[1300px] max-w-[95vw] h-[600px] shadow-[0_24px_60px_-20px_rgba(23,23,23,0.25)] overflow-hidden z-10 bg-white rounded-sm">

        {/* RIGHT GRAY SHAPE INSIDE CARD (same cut as background) */}
        <div
  className="absolute inset-0 bg-[#D9D9D9]"
  style={{ clipPath: `polygon(${CARD_TOP} 0, 100% 0, 100% 100%, ${CARD_BOTTOM} 100%)` }}
/>

        {/* CONTENT */}
        <div className="relative z-10 h-full flex">
          {/* LEFT SECTION */}
          <div className="w-[65%] h-full flex items-center justify-center">
            <div className="text-center max-w-[480px] px-8">
              <div className="mb-6">
                <img src={heroLogoMini} alt="" className="h-10 w-10 mx-auto" />
              </div>

              <h1 className="font-extrabold text-4xl leading-tight mb-4">
                <span className="block text-[#E83E99]">Create Collects,</span>
                <span className="block text-[#2E248F]">Timeless Artworks</span>
              </h1>

              <p className="text-[#514F5B] text-lg mb-8 max-w-[400px] mx-auto">
                Browse and build your collection of the world's most digital art.
              </p>

              <div className="space-y-4 mb-6">
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="w-[320px] h-12 rounded-full bg-[#2E248F] text-white font-medium shadow-lg hover:bg-[#1a1a5a] transition-colors"
                >
                  Register
                </button>
                <button
                  type="button"
                  className="w-[320px] h-12 rounded-full bg-[#2E248F] text-white font-medium shadow-lg hover:bg-[#1a1a5a] transition-colors"
                >
                  Login
                </button>
              </div>

              <div className="w-24 h-1 bg-[#D1D5DB] rounded-full mx-auto"></div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="w-[35%] h-full flex items-center justify-center">
            <img src={Logo} alt="Plink" className="h-80 w-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
