import type { ServiceSlug } from "./services";

/** Industries page copy, adapted from https://bytesplatform.com/industries. */
export const industries = {
  intro: "We deliver cutting-edge solutions across diverse industries, transforming businesses with innovative technology.",
  chapterIntro: "Four sectors, each with its own rules. We build secure, scalable technology that works within them.",
  sectors: [
    {
      slug: "government",
      name: "Federal government contractors",
      word: "Government",
      intro: "Innovative digital solutions tailored specifically for federal and state government contractors.",
      points: [
        "Delivering secure, compliant technology for federal and state agencies",
        "Supporting digital modernization initiatives across public services",
        "Improving efficiency with workflow automation and cloud infrastructure",
        "Partnering with government contractors to meet mission-critical needs",
      ],
      services: ["web", "advanced-services"],
    },
    {
      slug: "retail",
      name: "Retail",
      word: "Retail",
      intro: "Comprehensive retail solutions that boost sales and elevate the customer experience.",
      points: [
        "Driving omnichannel retail strategies for better customer experiences",
        "Leveraging data analytics to optimize inventory and personalization",
        "Enhancing e-commerce platforms with fast, responsive interfaces",
        "Enabling supply chain visibility and operational efficiency",
      ],
      services: ["web", "marketing", "seo"],
    },
    {
      slug: "finance",
      name: "Banking & finance",
      word: "Finance",
      intro: "Secure, scalable digital solutions for modern banking and financial institutions.",
      points: [
        "Empowering banks, fintechs and investment firms with secure, scalable platforms",
        "Streamlining operations through intelligent automation and data-driven decisions",
        "Enhancing customer engagement with seamless digital experiences",
        "Ensuring compliance and risk mitigation through robust security architecture",
      ],
      services: ["app", "advanced-services"],
    },
    {
      slug: "health",
      name: "Health",
      word: "Health",
      intro: "Digital health solutions that enhance patient care and streamline medical operations.",
      points: [
        "Supporting patient-centric care through digital transformation",
        "Developing HIPAA-compliant solutions for clinics, hospitals and health systems",
        "Improving health outcomes with data interoperability and AI-driven insights",
        "Enhancing patient engagement via mobile apps and portals",
      ],
      services: ["app", "web", "advanced-services"],
    },
  ] satisfies { slug: string; name: string; word: string; intro: string; points: string[]; services: ServiceSlug[] }[],
  cta: { heading: "Ready to revolutionize your sector", body: "Tell us where your industry is heading. We'll build the technology that gets you there first." },
};
