import type { Metadata } from "next";
import IndustriesPage from "@/components/industries/IndustriesPage";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "Secure, scalable, future-ready technology for government contractors, retail, banking and finance, and health, tailored solutions from BytesPlatform.",
  alternates: { canonical: "/industries" },
  openGraph: {
    title: "Industries We Serve · BytesPlatform",
    description: "Cutting-edge solutions across diverse industries, transforming businesses with innovative technology.",
    url: "/industries",
  },
};

export default function Page() {
  return <IndustriesPage />;
}
