/**
 * Stepper component matching Figma design
 * Shows progress through onboarding with pill shape and rail highlight
 */

import React from 'react';
import type { OnboardingStep } from '../../store/onboardingFSM';
import { STEP_LABELS } from '../../store/onboardingFSM';

export interface StepperProps {
  /** Current active step */
  currentStep: OnboardingStep;
  /** Set of completed steps */
  completedSteps: Set<OnboardingStep>;
  /** Custom class names */
  className?: string;
}

// Ordered steps for display (excluding 'done')
const DISPLAY_STEPS: OnboardingStep[] = [
  'businessType',
  'phone', 
  'cr',
  'id',
  'nafath',
  'kyb'
];

export function Stepper({ currentStep, completedSteps, className = '' }: StepperProps) {
  const currentIndex = DISPLAY_STEPS.indexOf(currentStep);
  
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Stepper - Shows only current step */}
      <div className="md:hidden bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2E248F] text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {currentIndex + 1}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {STEP_LABELS[currentStep] || currentStep}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {currentIndex + 1} of {DISPLAY_STEPS.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#2E248F] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / DISPLAY_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper - Shows all steps */}
      <div className="hidden md:block bg-white p-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Background Rail */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-px bg-[#2E248F] -translate-y-1/2 transition-all duration-500"
              style={{ 
                width: currentIndex > 0 ? `${(currentIndex / (DISPLAY_STEPS.length - 1)) * 100}%` : '0%' 
              }}
            />
            
            {DISPLAY_STEPS.map((step, index) => {
              const isActive = step === currentStep;
              const isCompleted = completedSteps.has(step);
              const isPast = index < currentIndex;
              
              return (
                <div key={step} className="relative flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 bg-white z-10
                    ${isActive || isCompleted || isPast
                      ? 'border-[#2E248F] bg-[#2E248F] text-white' 
                      : 'border-gray-300 text-gray-500'
                    }
                  `}>
                    {isCompleted && !isActive ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    {isActive ? (
                      // Active step with pill background
                      <div className="bg-[#2E248F] text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
                        {STEP_LABELS[step] || step}
                      </div>
                    ) : (
                      // Inactive step
                      <span className={`text-sm whitespace-nowrap ${
                        isCompleted || isPast ? 'text-gray-700 font-medium' : 'text-gray-500'
                      }`}>
                        {STEP_LABELS[step] || step}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
