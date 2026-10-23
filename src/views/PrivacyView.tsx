import React from 'react';

export const PrivacyView: React.FC = () => {
  return (
    <div className="pt-8 w-full max-w-[720px] mx-auto px-5 sm:px-8 space-y-8">
      <h1 className="text-[32px] font-medium text-[#111111] tracking-tight font-['Jost']">
        Privacy policy
      </h1>

      <p className="text-[16px] leading-[1.7] text-[#333333]">
        At Nuvmed, we take your privacy seriously. This policy explains what information we collect, how we use it, and when it may be shared.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Information we collect
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            We collect information you provide when using Nuvmed, such as your name, contact details, and health information. We may also collect information generated through your use of the platform, including visit notes and device data.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            How we use your information
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            We use your information to coordinate your care, manage payments, respond to your questions, and maintain and improve our services. We also use it when necessary to meet our legal and regulatory obligations.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Health information and HIPAA
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            Nuvmed handles protected health information in accordance with applicable HIPAA requirements. This includes the HIPAA Privacy Rule and Security Rule, where applicable, which govern how health information is used, disclosed, and protected.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            How we protect your information
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            We use security measures designed to protect your information from unauthorized access, disclosure, or loss. These include encryption in transit and at rest, access controls based on user roles, and security practices supported by our infrastructure providers.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            When we share information
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            We may share your information with healthcare providers involved in your care, service providers that help us operate the platform, or other parties when permitted or required by law. We obtain your authorization when required. We do not sell your personal information.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Your privacy rights
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            Depending on applicable law, you may have the right to access or obtain a copy of your information, request corrections, or request that certain information be deleted. Some records may need to be retained for legal or healthcare-related reasons. To submit a request or ask a question about your information, email <a href="mailto:team@nuvmedhealth.com" className="text-[#111111] underline">team@nuvmedhealth.com</a> or contact us through your patient portal.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Cookies and analytics
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            Nuvmed uses cookies needed for core platform functions, including authentication. We may also use analytics tools to understand how the platform is used and identify areas for improvement. You can manage certain cookie settings through your browser.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-medium text-[#111111]">
            Contact us
          </h2>
          <p className="text-[16px] leading-[1.7] text-[#333333]">
            If you have questions about this Privacy Policy or how Nuvmed handles your information, contact us at: Email <a href="mailto:team@nuvmedhealth.com" className="text-[#111111] underline">team@nuvmedhealth.com</a>, Phone <a href="tel:2147718020" className="text-[#111111] underline">(214) 771-8020</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
