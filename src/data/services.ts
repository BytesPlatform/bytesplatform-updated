/** Service categories, in the order the menu lists them. */
export const serviceCategories = ["Digital", "Data & AI", "Cloud & Security", "Business Process Services"] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

/** Service routes, shared by the menu, the home page cards and the sitemap. */
export const serviceLinks = [
  { slug: "digital-consulting-strategy", label: "Digital Consulting & Strategy", category: "Digital" },
  { slug: "saas-product-development", label: "Custom SaaS Products", category: "Digital" },
  { slug: "web-mobile-app-development", label: "Web & Mobile Apps", category: "Digital" },
  { slug: "digital-commerce", label: "Digital Commerce", category: "Digital" },
  { slug: "crm-erp-systems", label: "CRM & ERP Systems", category: "Digital" },
  { slug: "government-proposal-technology", label: "Government Proposals", category: "Digital" },
  { slug: "e-invoicing-integration", label: "E-Invoicing Integration", category: "Digital" },
  { slug: "web", label: "Web Development", category: "Digital" },
  { slug: "app", label: "App Development", category: "Digital" },
  { slug: "seo", label: "SEO", category: "Digital" },
  { slug: "marketing", label: "Marketing", category: "Digital" },

  { slug: "ai-automation", label: "AI Automation & Agents", category: "Data & AI" },
  { slug: "generative-ai", label: "Generative AI", category: "Data & AI" },
  { slug: "data-modernization", label: "Data Modernization", category: "Data & AI" },
  { slug: "advanced-analytics", label: "Advanced Analytics", category: "Data & AI" },
  { slug: "data-management", label: "Data Management", category: "Data & AI" },
  { slug: "connected-intelligence", label: "Connected Intelligence", category: "Data & AI" },

  { slug: "cloud-operations-migration", label: "Cloud Operations & Migration", category: "Cloud & Security" },
  { slug: "cloud-application-development", label: "Cloud App Development & Integration", category: "Cloud & Security" },
  { slug: "managed-services", label: "Managed Services", category: "Cloud & Security" },
  { slug: "digital-infrastructure", label: "Digital Infrastructure", category: "Cloud & Security" },
  { slug: "cybersecurity", label: "Cybersecurity", category: "Cloud & Security" },
  { slug: "emerging-technologies", label: "Emerging Technologies", category: "Cloud & Security" },
  { slug: "advanced-services", label: "Advanced Services", category: "Cloud & Security" },

  { slug: "contact-center", label: "Contact Center", category: "Business Process Services" },
  { slug: "finance-accounting", label: "Finance & Accounting", category: "Business Process Services" },
  { slug: "staff-augmentation", label: "Staff Augmentation", category: "Business Process Services" },
  { slug: "legal-process-outsourcing", label: "Legal Process Outsourcing", category: "Business Process Services" },
  { slug: "recruitment-process-outsourcing", label: "Recruitment Process Outsourcing", category: "Business Process Services" },
] as const satisfies readonly { slug: string; label: string; category: ServiceCategory }[];

export type ServiceSlug = (typeof serviceLinks)[number]["slug"];
