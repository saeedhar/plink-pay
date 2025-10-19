import React from 'react';

interface SignupButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}

export function SignupButton({
  onClick,
  disabled = false,
  isLoading = false,
  loadingText = 'Loading...',
  children,
  className = ''
}: SignupButtonProps) {
  return (
    <div className="text-center">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`px-12 py-3 rounded-2xl font-semibold transition-colors text-lg w-full ${
          disabled || isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#023B67] text-white hover:bg-[#023B67]/90"
        } ${className}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {loadingText}
          </div>
        ) : (
          children
        )}
      </button>
    </div>
  );
}
