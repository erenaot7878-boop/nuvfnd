import React from 'react';

export const ProvidersView: React.FC = () => {
  const standards = [
    {
      title: 'Qualified and credentialed',
      description: "Every provider is reviewed to ensure they meet Nuvmed's professional and licensing requirements.",
    },
    {
      title: 'Board certification',
      description: 'Providers hold board certifications relevant to their specialty, where applicable.',
    },
    {
      title: 'State licensure',
      description: 'Providers must hold an active license in the states where they practice. DEA registration is verified when required for their role.',
    },
    {
      title: 'Ongoing education',
      description: 'Providers are expected to keep their knowledge current through continuing education and training focused on clinical practice and patient safety.',
    },
  ];

  return (
    <div className="pt-8 w-full max-w-[720px] mx-auto px-5 sm:px-8 space-y-8">
      {/* Title */}
      <div className="space-y-3">
        <h1 className="text-[32px] font-medium text-[#111111] tracking-tight font-['Jost']">
          Our providers
        </h1>
        <p className="text-[20px] font-medium text-[#111111]">
          Qualified professionals. Care built around you.
        </p>
      </div>

      {/* Intro Text */}
      <p className="text-[16px] leading-[1.7] text-[#333333]">
        Our providers bring the training, credentials, and clinical experience needed to support your care. We verify their qualifications and licensure before they join Nuvmed.
      </p>

      {/* Section: Provider standards */}
      <div className="pt-4 space-y-6">
        <h2 className="text-[20px] font-medium text-[#111111]">
          Provider standards
        </h2>

        {/* List: bold label, then text underneath, hairline between items */}
        <div className="divide-y divide-[#E6E6E6] border-t border-b border-[#E6E6E6]">
          {standards.map((s) => (
            <div key={s.title} className="py-5 space-y-1.5">
              <span className="block font-semibold text-[#111111] text-[16px]">
                {s.title}
              </span>
              <p className="text-[16px] leading-[1.7] text-[#333333]">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
