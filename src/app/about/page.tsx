import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet BytesPlatform, a Texas-based team of designers and engineers building websites, apps, AI automation and CRM platforms with full transparency.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About BytesPlatform",
    description: "Your full-spectrum digital transformation partner, engineering brands with solutions that scale.",
    url: "/about",
  },
};

export default function Page() {
  return <AboutPage />;
}
