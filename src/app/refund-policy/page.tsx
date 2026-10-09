import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import RefundContent, { subtitle } from "@/components/legal/RefundContent";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Review refund policy for digital services, subscriptions, and SEO projects. Learn about eligibility, non-refundable items, and cancellation terms.",
  alternates: { canonical: "/refund-policy" },
};

export default function Page() {
  return (
    <LegalPage title="Refund Policy" subtitle={subtitle}>
      <RefundContent />
    </LegalPage>
  );
}
