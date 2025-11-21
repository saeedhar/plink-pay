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
      <div className="flex items-center gap-4">
        <img 
          src={icon} 
          alt={`${name} icon`}
          className="h-8 w-8 flex-shrink-0 object-contain"
          onError={(e) => {
            // Fallback if icon fails to load
            console.error(`Failed to load icon for ${name}:`, icon);
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="font-semibold text-black text-lg">{name}</div>
      </div>
    </button>
  );
}
