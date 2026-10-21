import type { ServiceContent } from "./serviceContent";
import type { ProductSlug } from "./products";

/**
 * Product page copy, adapted from https://bytesplatform.com/products/*.
 * One spelling per product name, repeated sections merged, and claims the old
 * pages made without backing (uptime guarantees, customer counts, compliance
 * certifications, free-trial terms) left out.
 */
export const productContent: Record<ProductSlug, ServiceContent> = {
  "byte-bots": {
    slug: "byte-bots",
    meta: {
      title: "Byte Bots, AI Chatbots for Sales & Support",
      description:
        "Byte Bots are custom AI chatbots trained on your business's own data. They answer in your brand's voice, qualify leads, automate support and turn conversations into insight.",
    },
    hero: {
      title: ["Byte Bots"],
      intro:
        "The future of conversation, powered by AI. Custom chatbots trained on your own business data. They answer accurately in your brand's voice, qualify leads and support customers around the clock.",
    },
    statement: "Every conversation is a chance to sell, support and learn. Byte Bots make sure none of them are wasted.",
    action: "Book a consultation",
    labels: { statement: "Why Byte Bots", offer: "Features", highlights: "The difference", faq: "FAQ" },
    offer: {
      heading: "What Byte Bots do",
      items: [
        {
          title: "Plug & play integrations",
          body: "Fits into the tools you already use, on your website, in your CRM and in the chat apps your customers and team live in.",
          tags: ["Website widget", "CRM & ERP connectors", "Slack, Teams, WhatsApp", "Webhooks & REST"],
        },
        {
          title: "Conversion engine",
          body: "Every interaction moves toward an outcome, with conversation paths shaped by real sales training.",
          tags: ["Lead qualification flows", "Dynamic CTAs & form fills", "Automated follow-ups", "A/B-tested paths"],
        },
        {
          title: "Data-driven intelligence",
          body: "Chat logs become actionable insight, real-time dashboards, alerts, trend forecasts and executive summaries on demand.",
        },
        {
          title: "Continuous learning",
          body: "Smarter over time: contextual memory, an evolving vocabulary and a tone that adapts to each audience segment.",
        },
      ],
    },
    highlights: {
      heading: "Built around your business",
      items: [
        { title: "Trained on your data", body: "Your products, policies and voice, not generic answers from the open web." },
        { title: "In your control", body: "An admin portal for prompts, overrides and ongoing training, so the bot stays on message." },
        { title: "Always on", body: "Customers get answers and leads get followed up, day and night, without adding headcount." },
      ],
    },
    faqs: [
      { q: "How do Byte Bots work?", a: "Each bot is trained on your business's own content and connected to your tools. It answers customer questions, qualifies leads and hands off to your team when a person is needed." },
      { q: "Can a Byte Bot be customized to my business?", a: "Yes. Every bot is built for your requirements, whether customer support, sales or internal processes, and speaks in your brand's voice." },
      { q: "Will it integrate with my existing systems?", a: "Byte Bots connect to websites, CRMs, ERPs and chat channels through ready integrations, webhooks and REST endpoints." },
      { q: "How do I get started?", a: "Book a free consultation. We'll scope your use case, then guide you through setup, training and customization." },
    ],
    cta: {
      heading: "Ready to transform your conversations",
      body: "Book a free Byte Bots consultation and see how AI can power your business.",
    },
  },

  "byte-suites": {
    slug: "byte-suites",
    meta: {
      title: "Byte Suites, Custom CRM & ERP Systems",
      description:
        "Byte Suites are custom CRM and ERP systems from BytesPlatform, lead management, AI assistance, invoicing, scheduling and analytics in one connected platform.",
    },
    hero: {
      title: ["Byte Suites"],
      intro:
        "The future of CRM. One connected platform for leads, communication, billing and analytics, with an AI assistant built in, and room to grow into a full ERP.",
    },
    statement: "Stop stitching tools together. Run customers, sales and operations from one place, built for the way you work.",
    action: "Book a consultation",
    labels: { statement: "Why Byte Suites", offer: "Features", highlights: "Who it's for", process: "Implementation & support", faq: "FAQ" },
    offer: {
      heading: "Everything in one suite",
      items: [
        {
          title: "Smart lead management",
          body: "Intelligent capture, AI-powered qualification and nurture, with sales pipelines shaped to your process.",
          tags: ["Lead capture", "AI qualification", "Custom pipelines"],
        },
        {
          title: "Byte Bot assistant",
          body: "An AI assistant that handles customer queries, automates follow-ups and surfaces real-time sales insights and next actions.",
        },
        {
          title: "Communication hub",
          body: "A unified inbox with calendar sync, reminders, team collaboration and mobile notifications.",
          tags: ["Unified inbox", "Calendar & reminders", "Team collaboration"],
        },
        {
          title: "Sales automation & analytics",
          body: "Deal-flow automation, AI sales forecasting and custom dashboards that move prospects through your pipeline faster.",
        },
        {
          title: "Built-in business tools",
          body: "Branded invoicing, appointment scheduling, inventory tracking and accounting. Native, no third-party add-ons needed.",
          tags: ["Invoicing", "Scheduling", "Inventory", "Accounting"],
        },
      ],
    },
    highlights: {
      heading: "Made for teams like yours",
      body: "How Byte Suites changes the day-to-day for different kinds of business.",
      items: [
        {
          title: "Consultants & service providers",
          body: "Run your practice from one place.",
          points: ["One platform instead of disconnected tools", "Automated client communication", "Invoicing with recurring billing"],
        },
        {
          title: "Sales teams & agencies",
          body: "Intelligent automation for every rep.",
          points: ["AI assistant for continuous follow-ups", "Team performance analytics", "Lead scoring and qualification"],
        },
        {
          title: "Small & medium businesses",
          body: "Enterprise features, without the complexity.",
          points: ["Scales as you grow", "Intuitive interface for fast adoption", "Role-based access control"],
        },
        {
          title: "E-commerce & retail",
          body: "The whole customer lifecycle, connected.",
          points: ["End-to-end customer management", "Inventory and sales in sync", "Automated customer support"],
        },
      ],
    },
    process: {
      heading: "Getting started, and growing",
      body: "We set Byte Suites up with you, move your data across and stay on hand as you scale.",
      steps: [
        { title: "Onboarding call", body: "A personal walkthrough to map your workflows and customize the suite." },
        { title: "Data migration", body: "Our team handles moving your existing customer data across from your current CRM." },
        { title: "Training", body: "Video tutorials and documentation so your team is productive from day one." },
        { title: "Ongoing support", body: "A help center, live support from real people and regular feature updates." },
        { title: "Grow into ERP", body: "When you need HR, finance, supply chain and operations, Byte Suites becomes the customer-facing hub of a custom ERP built for your industry." },
      ],
    },
    faqs: [
      { q: "What is Byte Suites?", a: "A business management platform that brings CRM, communication, billing and analytics together to streamline operations and improve collaboration." },
      { q: "Is it suitable for small businesses?", a: "Yes. Byte Suites scales with you, from small teams to multi-department organizations." },
      { q: "Does it integrate with other tools?", a: "Byte Suites is API-first, with custom integrations for tools like Google Workspace and Microsoft Office and workflow automation across your stack." },
      { q: "What if I need more than a CRM?", a: "We build custom ERP solutions covering HR, finance, supply chain and operations, with Byte Suites as the customer-facing hub." },
    ],
    cta: {
      heading: "Ready to transform your customer relationships",
      body: "Book a free Byte Suites consultation, or talk to us about a custom ERP.",
    },
  },
};
