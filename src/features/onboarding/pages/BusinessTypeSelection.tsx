import Logo from "../../../assets/logo-mark.svg";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import SoleProprietorshipIcon from "../../../assets/select your buisness type assets/Vector.svg";
import IndividualOwnerIcon from "../../../assets/select your buisness type assets/Vector-1.svg";
import MultiOwnerIcon from "../../../assets/select your buisness type assets/Vector-2.svg";
import FreelancerIcon from "../../../assets/select your buisness type assets/Vector-3.svg";
import { useState } from "react";
import { BusinessTypeOption } from "../components/BusinessTypeOption";

interface BusinessType {
  id: string;
  name: string;
  icon: string;
}

const businessTypes: BusinessType[] = [
  { id: "sole-proprietorship", name: "Sole Proprietorship", icon: SoleProprietorshipIcon },
  { id: "individual-owner-company", name: "Individual Owner Company", icon: IndividualOwnerIcon },
  { id: "multi-owner-company", name: "Multi-Owner Company", icon: MultiOwnerIcon },
  { id: "freelancer", name: "Freelancer", icon: FreelancerIcon },
];

function StepDot({ n }: { n: number }) {
  return (
    <div className="shrink-0 w-7 h-7 rounded-full border border-white/80 text-white flex items-center justify-center text-[13px] font-semibold">
      {n}
    </div>
  );
}

function SelectedStepPill({ children }: { children: React.ReactNode }) {
  // White pill with the curved connector (the notch) into the timeline
  return (
    <div className="relative inline-block">
      {/* the circular connector */}
      <span className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white" />
      {/* the pill */}
      <div className="bg-white text-[#2E248F] px-5 py-3 rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
        <span className="text-base font-semibold">{children}</span>
      </div>
    </div>
  );
}

export default function BusinessTypeSelection() {
  const [selectedType, setSelectedType] = useState<string>("sole-proprietorship");

  return (
    <div className="min-h-screen flex bg-[#F6F7F8]">
{/* LEFT SIDEBAR (clean + accurate) */}
<aside className="relative w-80 text-white overflow-visible">
  {/* base purple with convex rounded top-right */}
  <div className="absolute inset-0 bg-[#2E248F] rounded-tr-[88px]" />

  <div className="relative z-10 p-8 h-full flex flex-col">
    {/* logo */}
    <img src={WhiteLogo} alt="Plink Pay" className="h-12 mb-10" />

    {/* steps container */}
    <div className="relative flex-1">
      {/* vertical line — centered under the dots, not full height */}
      <div className="absolute left-10 top-2 bottom-6 w-px bg-white/35" />

      <div className="space-y-7">
        {/* STEP helper */}
        {[
          "Select Your Business Type",
          "phone number",
          "Freelancer License No.",
          "ID Number",
          "Nafath",
          "KYB",
        ].map((label, idx) => {
          const selected = idx === 0; // step 1 selected
          return (
            <div key={label} className="relative pl-16">
              {/* circle number — perfectly centered on the line */}
              <div className="absolute left-10 -translate-x-1/2 top-0 w-7 h-7 rounded-full border border-white/80 text-white flex items-center justify-center text-[13px] font-semibold">
                {idx + 1}
              </div>

              {/* label */}
              {selected ? (
                <div className="relative inline-block">
                  {/* small connector bubble (subtle) */}
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white" />
                  <div className="bg-white text-[#2E248F] px-5 py-3 rounded-[18px] shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                    <span className="text-base font-semibold">{label}</span>
                  </div>
                </div>
              ) : (
                <div className="text-base">{label}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
</aside>


      {/* RIGHT CONTENT */}
      <main className="flex-1 bg-white p-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <img src={Logo} alt="Logo" className="h-12 w-12 mx-auto" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Select Your Business Type
          </h1>

          <div className="space-y-4 mb-8">
            {businessTypes.map((type) => (
              <BusinessTypeOption
                key={type.id}
                id={type.id}
                name={type.name}
                icon={type.icon}
                isSelected={selectedType === type.id}
                onSelect={setSelectedType}
              />
            ))}
          </div>

          <div className="text-sm text-gray-600 mb-8">
            <p className="mb-3">Please choose the type of business that best represents you:</p>
            <ul className="space-y-1">
              <li>• Sole Proprietorship - Owned and managed by a single individual.</li>
              <li>• Individual Owner Company - A registered company owned by one person.</li>
              <li>• Freelancer - Independent professional offering services.</li>
              <li>• Multi-Owner Company - A business owned by two or more partners.</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={() => console.log("Selected business type:", selectedType)}
              className="bg-[#2E248F] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1a1a5a] transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
