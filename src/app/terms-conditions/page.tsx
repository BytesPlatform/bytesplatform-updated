import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import TermsContent, { subtitle } from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Review the official Terms & Conditions of Bytes Platform. Understand your rights, responsibilities, and our policies before using our services.",
  alternates: { canonical: "/terms-conditions" },
};

export default function Page() {
  return (
    <LegalPage title="Terms & Conditions" subtitle={subtitle}>
      <TermsContent />
    </LegalPage>
  );
}
