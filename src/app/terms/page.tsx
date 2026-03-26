import { LegalPageLayout, LegalSection } from "@/components/landing/legal-page-layout";
import { Shield } from "lucide-react";

export default function TermsPage() {
    const sections: LegalSection[] = [
        {
            id: "introduction",
            title: "Introduction",
            legalText: (
                <>
                    <p>By accessing or using Aletheia, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
                </>
            ),
            summary: (
                <>Read these rules. If you use our service, you agree to follow them.</>
            )
        },
        {
            id: "ethical-use",
            title: "1. Ethical Use Policy",
            legalText: (
                <>
                    <p>Aletheia is designed for legitimate cybersecurity research, investigative journalism, and digital asset protection. You agree not to use Aletheia for:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-400">
                        <li>Stalking, harassment, or unlawful surveillance of individuals.</li>
                        <li>Violating any laws or regulations in your jurisdiction.</li>
                        <li>Attempting to gain unauthorized access to private platforms.</li>
                        <li>Reselling the SaaS platform without explicit written permission.</li>
                    </ul>
                </>
            ),
            summary: (
                <>Don't use Aletheia for illegal stuff, stalking, or hacking. We build tools for defense and journalism, not for bad actors.</>
            )
        },
        {
            id: "subscription-billing",
            title: "2. Subscription & Billing",
            legalText: (
                <>
                    <p>Paid plans are billed on a monthly basis. You may cancel at any time from your account settings. Upon cancellation, you retain access until the end of your current billing period. No refunds are issued for partial months of service.</p>
                    <p className="mt-3">A 7-day free trial is available on the Tactical Pro plan. You will not be charged until the trial period ends.</p>
                </>
            ),
            summary: (
                <>You pay monthly. Cancel anytime. 7-day free trial on Pro. No partial refunds.</>
            )
        },
        {
            id: "open-source-license",
            title: "3. Open Source Core License",
            legalText: (
                <>
                    <p>The core engine of Aletheia is licensed under the MIT License. You are free to self-host, modify, and distribute the open-source version in accordance with the license terms. Our cloud infrastructure and proprietary UI components are closed-source.</p>
                </>
            ),
            summary: (
                <>The core engine is free and open-source (MIT). You can host it yourself. Our pretty cloud platform is not open-source.</>
            )
        },
        {
            id: "limitation-liability",
            title: "4. Limitation of Liability",
            legalText: (
                <>
                    <p>Aletheia provides tools for data aggregation. We are not mathematically or legally responsible for the accuracy of information retrieved from third-party sources or for any decisions made based on investigative findings. Proceed with cryptographic caution.</p>
                </>
            ),
            summary: (
                <>We gather public data. If that data is wrong, it's not our fault. Double-check your intel before making decisions.</>
            )
        },
        {
            id: "termination",
            title: "5. Termination",
            legalText: (
                <>
                    <p>We reserve the right to administratively terminate or suspend your SaaS account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Ethical Use Policy.</p>
                </>
            ),
            summary: (
                <>If you break the rules, we can ban you.</>
            )
        },
        {
            id: "refund-policy",
            title: "6. Refund Policy",
            legalText: (
                <>
                    <p>Due to the digital and computationally expensive nature of the product, all sales are categorically final. However, refunds may be granted solely within 7 days of purchase if no programmatic usage (e.g., creating investigations or executing node scans) has occurred on the account.</p>
                </>
            ),
            summary: (
                <>No refunds if you've already run scans, because that costs us money. If you haven't touched it, you have 7 days to ask for a refund.</>
            )
        },
        {
            id: "governing-law",
            title: "7. Governing Law",
            legalText: (
                <>
                    <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company officially operates, without regard to its conflict of law provisions.</p>
                </>
            ),
            summary: (
                <>Any legal disputes follow the laws of our corporate jurisdiction.</>
            )
        }
    ];

    return (
        <LegalPageLayout 
            title="Terms of Service"
            lastUpdated="March 3, 2026"
            sections={sections}
        />
    );
}
