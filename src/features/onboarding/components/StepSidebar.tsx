import React from "react";

export interface StepSidebarProps {
  steps: string[];
  activeIndex: number; // 0-based
  logoSrc: string;
}

export default function StepSidebar({ steps, activeIndex, logoSrc }: StepSidebarProps) {
  return (
    <aside className="relative w-80 text-white overflow-visible">
      {/* Purple background */}
      <div className="absolute inset-0 bg-[#2E248F]" />

      {/* Content */}
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Logo */}
        <img src={logoSrc} alt="Plink Pay" className="h-12 mb-12" />

        {/* Steps */}
        <div className="relative flex-1">
          {/* Vertical connector - ends at the last step */}
          <div 
            className="absolute w-px bg-white/40"
            style={{
              left: '16px', // Center of the 32px circle (left-4 = 16px)
              top: '16px',  // Center of first circle
              height: `${(steps.length - 1) *74}px` // Distance to center of last circle
            }}
          />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-center">
                {/* Circle positioned to center on the vertical line */}
                <span className={`absolute left-0 w-8 h-8 rounded-full grid place-items-center text-sm font-semibold ${
                  index === activeIndex 
                    ? 'bg-white text-[#2E248F] border-2 border-white' 
                    : 'border-2 border-white text-white bg-transparent'
                }`}>
                  {index + 1}
                </span>
              
              {index === activeIndex ? (
                /* Horizontal banner with curved notches on the right */
                <div className="relative ml-12">
                  {/* Banner with rounded corners and small curve on right */}
                  <div 
                    className="bg-white text-[#2E248F] px-6 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)] relative h-[52px] w-[320px] flex items-center overflow-visible"
                    style={{
                      borderRadius: '22px 22px 22px 22px',
                      clipPath: `polygon(
                        0% 0%, 
                        88% 0%, 
                        92% 8%, 
                        88% 16%, 
                        96% 50%, 
                        88% 84%, 
                        92% 92%, 
                        88% 100%, 
                        0% 100%
                      )`
                    }}
                  >
                    <span className="text-base font-semibold whit   espace-nowrap pr-6">{step}</span>
                  </div>
                </div>
                ) : (
                  <span className="text-base ml-12">{step}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
