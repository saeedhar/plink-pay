import React from "react";

export interface BusinessTypeOptionProps {
  id: string;
  name: string;
  icon: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function BusinessTypeOption({
  id,
  name,
  icon,
  isSelected,
  onSelect,
}: BusinessTypeOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`w-full text-left p-6 rounded-lg border-2 transition-all cursor-pointer
        ${isSelected ? "bg-blue-50 border-[#022466]" : "bg-white border-gray-300 hover:border-gray-400"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="h-8 w-8"
            style={{
              backgroundColor: '#312783',
              maskImage: `url(${icon})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: `url(${icon})`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            }}
          />
          <div className="font-semibold text-black text-lg">{name}</div>
        </div>
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center
            ${isSelected ? "border-[#022466] bg-[#022466]" : "border-gray-400 bg-white"}`}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
