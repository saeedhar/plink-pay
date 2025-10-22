import React, { useState } from 'react';
import { Button } from '../ui/Button';
import limitsIcon from '../../assets/wallet-managment/limits.svg';

interface LimitsConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (limitType: 'overall' | 'specific') => void;
}

export default function LimitsConfigurationModal({ isOpen, onClose, onNext }: LimitsConfigurationModalProps) {
  const [selectedLimitType, setSelectedLimitType] = useState<'overall' | 'specific'>('overall');

  if (!isOpen) return null;

  const handleNext = () => {
    onNext(selectedLimitType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={limitsIcon} alt="Limits" className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#022466]">Limits Configuration</h2>
          </div>

          {/* Instruction */}
          <p className="text-[#022466] mb-6 font-medium">
            Choose the type of limit you want to set:
          </p>

          {/* Radio Options */}
          <div className="space-y-4 mb-8">
            {/* Overall Wallet Option */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="flex items-center mt-1">
                <input
                  type="radio"
                  name="limitType"
                  value="overall"
                  checked={selectedLimitType === 'overall'}
                  onChange={(e) => setSelectedLimitType(e.target.value as 'overall')}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <div className="text-[#022466] font-medium">Overall Wallet</div>
                <div className="text-gray-500 text-sm mt-1">Set a limit for your entire wallet</div>
              </div>
            </label>

            {/* Specific Transaction Option */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="flex items-center mt-1">
                <input
                  type="radio"
                  name="limitType"
                  value="specific"
                  checked={selectedLimitType === 'specific'}
                  onChange={(e) => setSelectedLimitType(e.target.value as 'specific')}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <div className="text-[#022466] font-medium">Specific Transaction</div>
                <div className="text-gray-500 text-sm mt-1">Set a limit for a specific transaction</div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-white text-[#022466] border-2 border-[#022466] hover:bg-gray-50"
            >
              Close
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-[#022466] text-white hover:bg-[#0475CC]"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
