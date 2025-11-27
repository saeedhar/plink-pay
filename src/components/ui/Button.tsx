import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

const baseStyle: React.CSSProperties = {
  width: '327px',
  height: '48px',
  paddingTop: '12px',
  paddingRight: '20px',
  paddingBottom: '12px',
  paddingLeft: '20px',
  gap: '8px',
  borderRadius: '15px',
};


export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  const baseClasses =
    'font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClass =
    variant === 'primary'
      ? disabled
        ? 'bg-gray-300 text-gray-500'
        : 'bg-[#023A66] text-white'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';

  const hoverClasses =
    variant === 'primary' && !disabled ? 'hover:shadow-lg' : '';

  const isRoundedFull = className.includes('rounded-full');
  
  const style: React.CSSProperties = {
    ...baseStyle,
    ...(variant === 'primary' && !disabled
      ? { border: 'none' }
      : {}),
    ...(isRoundedFull ? { borderRadius: '9999px' } : {}),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClass} ${hoverClasses} ${disabledClasses} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};
