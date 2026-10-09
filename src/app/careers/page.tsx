import type { Metadata } from "next";
import CareersPage from "@/components/careers/CareersPage";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join BytesPlatform in Denton, Texas. Open roles in engineering, design, marketing and project management — build the future with us.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers · BytesPlatform",
    description: "Innovate, collaborate and grow alongside a passionate team. See our open roles.",
    url: "/careers",
  },
};

export default function Page() {
  return <CareersPage />;
}
