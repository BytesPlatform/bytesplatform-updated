/** Service routes, shared by the menu, the home page cards and the sitemap. */
export const serviceLinks = [
  { slug: "ai-automation", label: "AI Automation & Agents" },
  { slug: "saas-product-development", label: "Custom SaaS Products" },
  { slug: "web-mobile-app-development", label: "Web & Mobile Apps" },
  { slug: "crm-erp-systems", label: "CRM & ERP Systems" },
  { slug: "government-proposal-technology", label: "Government Proposals" },
  { slug: "e-invoicing-integration", label: "E-Invoicing Integration" },
  { slug: "web", label: "Web Development" },
  { slug: "seo", label: "SEO" },
  { slug: "app", label: "App Development" },
  { slug: "marketing", label: "Marketing" },
  { slug: "advanced-services", label: "Advanced Services" },
] as const;

export type ServiceSlug = (typeof serviceLinks)[number]["slug"];
