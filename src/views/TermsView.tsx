import React from 'react';

export const TermsView: React.FC = () => {
  return (
    <div className="pt-8 w-full max-w-[720px] mx-auto px-5 sm:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-[32px] font-medium text-[#111111] tracking-tight font-['Jost']">
          Terms of service
        </h1>
        <p className="text-[14px] text-[#666666]">
          Last updated: March 2026
        </p>
      </div>

      <p className="text-[16px] leading-[1.7] text-[#333333]">
        These Terms of Service explain the rules for using Nuvmed's platform and services. By accessing or using Nuvmed, you agree to these terms and our Privacy Policy. If you do not agree, please do not use the platform.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Using Nuvmed
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            Nuvmed provides access to healthcare services through its platform, including virtual visits with licensed healthcare providers. The services available to you may depend on your location and individual needs. Nuvmed is not intended for medical emergencies. If you are experiencing a medical emergency, call 911 or go to the nearest emergency department.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Your account
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            You are responsible for providing accurate, up-to-date information when creating and using your account. Keep your login details secure and do not share access to your account with others. If you believe someone has accessed your account without permission, contact us promptly.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Payments and billing
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            You agree to pay the fees displayed for the visits, services, or programs you choose. Where insurance coverage is available, we may verify your benefits before billing. Benefit verification does not guarantee coverage or payment by your insurer. You may be responsible for charges not covered by your plan.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Cancellations and rescheduling
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            You may cancel or reschedule an appointment up to one hour before its scheduled start time. Cancellations made after that window may be subject to a fee. Any applicable cancellation charges will be communicated to you through our booking process or other relevant service information.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Limitation of liability
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            To the extent permitted by applicable law, Nuvmed's liability arising from a particular service is limited to the amount you paid for that service. This limitation does not apply where it would be prohibited by law.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Intellectual property
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            The Nuvmed platform and its content, including its text, design, branding, and software, are owned by Nuvmed or its licensors unless otherwise stated. You may not copy, distribute, modify, or reuse this material without permission, except where permitted by law.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Governing law
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            These Terms are governed by the laws of the State of California, without regard to its conflict-of-law principles, except where applicable law requires otherwise.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Contact us
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            If you have questions about these Terms of Service, contact us: Email <a href="mailto:team@nuvmedhealth.com" className="text-[#111111] underline">team@nuvmedhealth.com</a>, Phone <a href="tel:2147718020" className="text-[#111111] underline">(214) 771-8020</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
