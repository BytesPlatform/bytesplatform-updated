import type { Metadata } from "next";
import EInvoicingPage from "@/components/einvoicing/EInvoicingPage";

export const metadata: Metadata = {
  title: "UAE E-Invoicing Readiness for Any ERP",
  description:
    "Get your ERP ready for UAE e-invoicing. BytesPlatform audits master data, maps tax codes to PINT AE and validates every invoice before it reaches your accredited service provider — any ASP, no ERP replacement.",
  alternates: { canonical: "/e-invoicing" },
  openGraph: {
    title: "UAE E-Invoicing Readiness · BytesPlatform",
    description: "PINT AE validation and ERP integration before your invoices reach your ASP.",
    url: "/e-invoicing",
  },
};

export default function Page() {
  return <EInvoicingPage />;
}
