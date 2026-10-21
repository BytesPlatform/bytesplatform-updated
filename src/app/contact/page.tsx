import type { Metadata } from "next";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with BytesPlatform in Denton, Texas. Tell us about your website, app, SEO, marketing or AI project. Call 833-323-0371 or send us a message.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact · BytesPlatform", url: "/contact" },
};

export default function Page() {
  return <ContactPage />;
}
