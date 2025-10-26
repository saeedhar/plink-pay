import React from "react";
import { BiRefresh } from "react-icons/bi";

export interface StepSidebarProps {
  steps: string[];
  activeIndex: number; // 0-based
  logoSrc: string;
  showReloadButton?: boolean;
  onReload?: () => void;
}

export default function StepSidebar({ steps, activeIndex, logoSrc, showReloadButton = false, onReload }: StepSidebarProps) {
  return (
    <aside className="relative w-80 text-white overflow-visible">
      {/* Background with gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160.08deg, #023A66 38.35%, #0475CC 91.81%)'
        }}
      />
      
      {/* Subtle bubble pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300 rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-blue-200 rounded-full blur-xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Logo */}
        <div className="mb-12">
          <div 
            className="flex items-center gap-3 mb-2"
            style={{
              width: '278px',
              height: '101px',
              top: '22px',
              left: '81px',
              opacity: 1
            }}
          >
            <img src={logoSrc} alt="Tyaseer Pay" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Steps */}
        <div className="relative flex-1">
          {/* Vertical connector lines between circles */}
          {steps.slice(0, -1).map((_, index) => (
            <div 
              key={index}
              className="absolute w-px bg-white/30"
              style={{
                left: '16px',
                top: `${40 + (index * 60)}px`,
                height: '20px'
              }}
            />
          ))}

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-center">
                {/* Circle */}
                <span className={`absolute left-0 w-8 h-8 rounded-full grid place-items-center text-sm font-semibold ${
                  index === activeIndex 
                    ? 'text-white border-2 border-white' 
                    : 'border-2 border-white text-white'
                }`}>
                  {index + 1}
                </span>
              
                {index === activeIndex ? (
                  /* Active step banner */
                  <div className="relative ml-12">
                    <div 
                      className="text-white rounded-xl shadow-sm flex items-center"
                      style={{
                        width: '220px',
                        height: '46px',
                        top: '154px',
                        left: '89px',
                        opacity: 1,
                        paddingTop: '10px',
                        paddingRight: '13px',
                        paddingBottom: '10px',
                        paddingLeft: '13px',
                        gap: '10px',
                        backgroundColor: '#00BDFFB2'
                      }}
                    >
                      <span className="text-base font-semibold whitespace-nowrap">{step}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-base ml-12 text-white">{step}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reload Button - Only show on password setup screen */}
        {showReloadButton && (
          <div className="flex justify-center pb-16">
            <button
              onClick={onReload}
              className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10 transition-all duration-200"
              title="Reset to beginning"
            >
              <BiRefresh className="w-80 h-80 text-white" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
