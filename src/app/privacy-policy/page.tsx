import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import PrivacyContent, { subtitle } from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Our Privacy Policy governs how Bytes Platform collects, uses, maintains, and discloses information collected from users.",
  alternates: { canonical: "/privacy-policy" },
};

export default function Page() {
  return (
    <LegalPage title="Privacy Policy" subtitle={subtitle}>
      <PrivacyContent />
    </LegalPage>
  );
}
