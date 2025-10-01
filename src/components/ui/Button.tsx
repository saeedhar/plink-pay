import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  const baseClasses = 'rounded-full font-medium transition-all duration-200 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-[#022466] text-white hover:bg-[#022466]/90',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      style={{
        width: '327px',
        height: '48px',
        paddingTop: '12px',
        paddingRight: '20px',
        paddingBottom: '12px',
        paddingLeft: '20px',
        gap: '8px',
        opacity: 1
      }}
    >
      {children}
    </button>
  );
};
