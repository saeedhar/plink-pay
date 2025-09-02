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
        ${isSelected ? "bg-[#D9D9D9] border-gray-300" : "bg-[#F6F7F8] border-gray-300 hover:border-gray-400"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={icon} alt="" className="h-8 w-8" />
          <div className="font-semibold text-gray-800 text-lg">{name}</div>
        </div>
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center
            ${isSelected ? "border-[#2E248F] bg-[#2E248F]" : "border-gray-400 bg-white"}`}
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
