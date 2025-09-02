import { useState } from "react";
import Logo from "../../../assets/logo-mark.svg";
import WhiteLogo from "../../../assets/select your buisness type assets/white-logo.svg";
import heroLogo from "../../../assets/hero-logo-mini.svg";
// icons
import SoleProprietorshipIcon from "../../../assets/select your buisness type assets/Vector.svg";
import IndividualOwnerIcon from "../../../assets/select your buisness type assets/Vector-1.svg";
import MultiOwnerIcon from "../../../assets/select your buisness type assets/Vector-2.svg";
import FreelancerIcon from "../../../assets/select your buisness type assets/Vector-3.svg";
import StepSidebar from "../components/StepSidebar";
import { BusinessTypeOption } from "../components/BusinessTypeOption";


export default function BusinessTypeSelection() {
  const [selectedType, setSelectedType] = useState("sole-proprietorship");

  const steps = [
    "Select Your Business Type",
    "phone number",
    "Freelancer License No.",
    "ID Number",
    "Nafath",
    "KYB",
  ];
  const activeStep = 0; // later: tie this to form progress

  return (
    <div className="min-h-screen flex bg-[#F6F7F8]">
      {/* Sidebar */}
      <StepSidebar steps={steps} activeIndex={activeStep} logoSrc={WhiteLogo} />

      {/* Right content */}
      <main className="flex-1 bg-white p-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <img src={heroLogo} alt="" className="h-12 w-12 mx-auto" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-12">
            Select Your Business Type
          </h1>

          <div className="space-y-4 mb-8">
            {[
              { id: "sole-proprietorship", name: "Sole Proprietorship", icon: SoleProprietorshipIcon },
              { id: "individual-owner-company", name: "Individual Owner Company", icon: IndividualOwnerIcon },
              { id: "multi-owner-company", name: "Multi-Owner Company", icon: MultiOwnerIcon },
              { id: "freelancer", name: "Freelancer", icon: FreelancerIcon },
            ].map((t) => (
              <BusinessTypeOption
                key={t.id}
                id={t.id}
                name={t.name}
                icon={t.icon}
                isSelected={selectedType === t.id}
                onSelect={setSelectedType}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => console.log("Selected type:", selectedType)}
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
