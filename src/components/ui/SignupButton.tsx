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
  const isDisabled = disabled || isLoading;

  return (
    <div className="text-center">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`px-12 py-3 rounded-2xl font-semibold text-lg w-full transition-all ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            : "gradient-button text-white shadow-sm hover:shadow-lg"
        } ${className}`}
        style={{
          border: isDisabled ? undefined : 'none'
        }}
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
