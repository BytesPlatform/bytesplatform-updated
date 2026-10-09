import type { ServiceSlug } from "./services";

/**
 * Service page copy, adapted from https://bytesplatform.com/services/*.
 * Typos are fixed, repeated sections merged, and unsourced or contradictory
 * stats from the old pages left out.
 */
export type ServiceContent = {
  slug: ServiceSlug;
  meta: { title: string; description: string };
  hero: { title: string[]; intro: string };
  statement: string;
  offer: { heading: string; body?: string; items: { title: string; body: string; tags?: string[] }[] };
  highlights?: { heading: string; body?: string; items: { title: string; body: string; points?: string[] }[] };
  process?: { heading: string; body?: string; steps: { title: string; body: string }[] };
  stack?: { label: string; items: string[] };
  faqs: { q: string; a: string }[];
  /** The heading is completed with a blue question mark. */
  cta: { heading: string; body: string };
};

export const serviceContent: Record<ServiceSlug, ServiceContent> = {
  web: {
    slug: "web",
    meta: {
      title: "Web Development Services",
      description:
        "Professional web development services across the US. BytesPlatform designs and builds fast, responsive, SEO-ready websites and web applications that drive traffic and sales.",
    },
    hero: {
      title: ["Web", "development"],
      intro:
        "Professional web development tailored to the unique needs of each client — combining creativity with modern technology to build custom solutions that drive business growth.",
    },
    statement: "Fast, responsive websites and web applications, engineered from the first wireframe to the last deploy.",
    offer: {
      heading: "What we build",
      body: "A full spectrum of web development, from interfaces your customers touch to the systems behind them.",
      items: [
        {
          title: "Frontend development",
          body: "Modern frameworks like React, Vue.js and Angular for responsive, user-friendly interfaces.",
          tags: ["React", "Vue.js", "Angular", "TypeScript"],
        },
        {
          title: "Backend development",
          body: "Scalable server-side solutions with robust APIs, databases and cloud integration.",
          tags: ["Node.js", "Python", "PHP", "MongoDB"],
        },
        {
          title: "Mobile-first design",
          body: "Responsive web applications that work flawlessly across every device and screen size.",
          tags: ["PWA", "Responsive", "Mobile UI"],
        },
        {
          title: "Full-stack solutions",
          body: "End-to-end development from concept to deployment, with modern DevOps practices.",
          tags: ["MERN", "MEAN", "JAMstack", "Serverless"],
        },
      ],
    },
    highlights: {
      heading: "CMS and e-commerce, done properly",
      body: "From content-driven websites to thriving online stores, built to grow with your business.",
      items: [
        {
          title: "Shopify stores",
          body: "High-conversion storefronts with custom apps, payment gateways and ERP integrations.",
          points: ["Custom Liquid templates & sections", "App & payment-gateway integrations", "Optimized checkout flows", "Analytics & sales automation"],
        },
        {
          title: "WordPress sites",
          body: "Custom themes, plugins and scalable WordPress builds optimized for performance and SEO.",
          points: ["Pixel-perfect custom themes", "WooCommerce storefronts", "Headless WordPress", "On-page SEO & performance tuning"],
        },
        {
          title: "MERN applications",
          body: "Full-stack JavaScript applications built with MongoDB, Express, React and Node.js.",
          points: ["REST & GraphQL APIs", "Scalable microservices", "Real-time features with WebSockets", "Cloud deployment & CI/CD"],
        },
        {
          title: "Website add-ons",
          body: "Integrations and features tailored to your workflow, added to new or existing sites.",
          points: ["CRM integration", "Chatbots & admin panels", "Sales analytics & tracking", "Payment gateways & newsletters"],
        },
      ],
    },
    process: {
      heading: "How a project runs",
      body: "A proven methodology that keeps quality, transparency and delivery dates in view the whole way through.",
      steps: [
        { title: "Discovery & planning", body: "Stakeholder workshops, competitive analysis and a technical feasibility study become a detailed project roadmap." },
        { title: "Design & prototyping", body: "User flows, high-fidelity mock-ups and interactive prototypes, validated before a line of production code." },
        { title: "Development", body: "Clean, maintainable code shipped in agile sprints, with code reviews and continuous integration." },
        { title: "Testing & QA", body: "Unit and integration tests, performance benchmarking and security audits." },
        { title: "Deployment & launch", body: "Automated CI/CD pipelines, cloud environment setup and zero-downtime rollouts." },
        { title: "Maintenance & support", body: "Monitoring, regular updates and feature iterations based on real user feedback." },
      ],
    },
    stack: {
      label: "Technology stack",
      items: ["React", "Next.js", "JavaScript", "Node.js", "Laravel", "WordPress", "Shopify", "Webflow", "Tailwind CSS"],
    },
    faqs: [
      { q: "Why is web development important for my business?", a: "A professional, responsive and user-friendly website is how most customers first meet your business. It drives engagement and online visibility." },
      { q: "How long does it take to build a website?", a: "It depends on the complexity and features involved. A standard website can be ready quickly, while larger custom projects take longer — we give you a clear timeline after discovery." },
      { q: "What types of websites can you create?", a: "Business sites, e-commerce stores, blogs, portfolios and more — on WordPress, Shopify, or fully custom full-stack builds, depending on your requirements." },
      { q: "Will my website be mobile-friendly?", a: "Absolutely. Every website we build is responsive and works smoothly across smartphones, tablets and desktops." },
    ],
    cta: {
      heading: "Ready to transform your digital presence",
      body: "We don't just build websites; we build professional websites that help your business thrive.",
    },
  },

  seo: {
    slug: "seo",
    meta: {
      title: "SEO Services",
      description:
        "SEO services that grow organic rankings, traffic and visibility — keyword strategy, technical SEO, on-page and off-page optimization, and local SEO from BytesPlatform.",
    },
    hero: {
      title: ["Search engine", "optimization"],
      intro:
        "If you're not ranking, you're bleeding revenue. We don't just improve your rankings — we drive targeted organic traffic that converts into real business growth.",
    },
    statement: "Every day, customers search for what you offer. If you're not on page one, those clicks go to your competitors.",
    offer: {
      heading: "Rank for what matters",
      body: "Search strategies built to lift your rankings and keep them growing.",
      items: [
        { title: "Keyword strategy", body: "Industry-specific research that finds the terms with real buying intent — competitor and SERP analysis, long-tail opportunities and intent mapping." },
        { title: "Technical SEO", body: "Full site audits that clear crawl errors, improve Core Web Vitals, fix mobile issues and add structured data for faster, healthier pages." },
        { title: "On-page & off-page", body: "Content aligned with search intent, conversion-focused meta titles and descriptions, and authority-building backlinks." },
        { title: "Local SEO", body: "Google Business Profile optimization, local keywords, citations and reviews, so you own searches in your city or region." },
      ],
    },
    highlights: {
      heading: "Ongoing, measured, reported",
      items: [
        {
          title: "Weekly reporting",
          body: "Real growth metrics, not vanity numbers.",
          points: ["Keyword ranking tracking", "Organic traffic growth", "Conversion rate & ROI", "Competitive monitoring"],
        },
        {
          title: "SEO-optimized content",
          body: "Content that ranks and converts.",
          points: ["Strategy aligned with search intent", "Blog & product page optimization", "Answer-focused content", "Conversion-focused copywriting"],
        },
        {
          title: "Ongoing management",
          body: "Content support and backlink building, month after month.",
          points: ["Continuous strategy optimization", "Regular content updates", "Algorithm change adaptation", "Long-term ranking focus"],
        },
      ],
    },
    faqs: [
      { q: "How long will it take to see results from SEO?", a: "SEO is a long-term strategy. Significant improvements typically take 3–6 months, though early results can appear within a few weeks — and weekly reports show you the progress as it happens." },
      { q: "Do I need to do anything to my website for SEO?", a: "We audit your site and optimize content, keywords and structure. You may need to approve some updates, but we handle the technical work." },
      { q: "Do you offer local SEO services?", a: "Yes. Local SEO helps your business rank in nearby searches and attract customers in your area." },
      { q: "Will SEO work for any type of business?", a: "SEO benefits businesses of every size and industry, from local stores to e-commerce platforms and service providers." },
    ],
    cta: {
      heading: "Ready to let search bring you business",
      body: "With SEO done right, your ideal clients find you every hour of every day. Start with a free SEO audit.",
    },
  },

  app: {
    slug: "app",
    meta: {
      title: "App Development Services",
      description:
        "Native and cross-platform mobile app development for iOS and Android — UX design, development, testing, launch and ongoing support from BytesPlatform.",
    },
    hero: {
      title: ["Mobile", "apps"],
      intro:
        "We turn your ideas into powerful mobile experiences — intuitive, user-friendly applications tailored to your business needs.",
    },
    statement: "Your app isn't just a tool. It's a direct line to your customers and an extension of your brand.",
    offer: {
      heading: "Development services",
      items: [
        { title: "Native iOS", body: "Swift and SwiftUI apps optimized for Apple's ecosystem — Face ID, Apple Pay, CloudKit sync and ARKit where it matters.", tags: ["Swift", "SwiftUI", "CloudKit", "TestFlight"] },
        { title: "Native Android", body: "Kotlin and Java apps that use the full Android platform, with Material Design and Google Play Services.", tags: ["Kotlin", "Java", "Material Design", "Firebase"] },
        { title: "Cross-platform", body: "React Native and Flutter apps that share one codebase across iOS and Android without giving up native feel.", tags: ["React Native", "Flutter"] },
        { title: "UI/UX design", body: "User research, wireframes, Figma prototypes and design systems for intuitive, accessible interfaces." },
        { title: "Backend integration", body: "REST and GraphQL APIs, real-time sync, secure authentication and third-party services on a scalable architecture." },
        { title: "App store deployment", body: "Store optimization, listings, submission to the App Store and Google Play, analytics and post-launch updates." },
      ],
    },
    highlights: {
      heading: "End-to-end ownership",
      body: "One team from the first prototype to version two.",
      items: [
        { title: "Pixel-perfect prototypes", body: "High-fidelity Figma prototypes that show the real experience before development starts." },
        { title: "Frontend to cloud", body: "We handle every layer of your app — interface, backend and cloud services." },
        { title: "Post-launch support", body: "Ongoing maintenance, security patches and version management to keep your app current." },
      ],
    },
    process: {
      heading: "Features users come back for",
      steps: [
        { title: "Seamless onboarding", body: "Guided setup, progressive disclosure and interactive tutorials that get users started fast." },
        { title: "Powerful dashboards", body: "Real-time analytics and customizable widgets with mobile-optimized charts." },
        { title: "Smart messaging", body: "Real-time chat, push notifications and media sharing that keep users engaged." },
        { title: "User profiles", body: "Profile customization, privacy controls and social integration." },
      ],
    },
    stack: {
      label: "Technology stack",
      items: ["React Native", "Flutter", "Swift", "SwiftUI", "Kotlin", "Node.js", "Firebase", "MongoDB", "AWS", "Azure"],
    },
    faqs: [
      { q: "What types of apps do you develop?", a: "Custom mobile applications for Android and iOS, including business apps, e-commerce apps and social apps." },
      { q: "How long does it take to develop an app?", a: "Anywhere from a few weeks to several months, depending on features, design and the platforms involved." },
      { q: "How do you ensure my app is secure?", a: "We follow security best practices, including data encryption, secure login and regular vulnerability testing." },
      { q: "Do you offer app maintenance and updates?", a: "Yes. We provide ongoing maintenance with new features, security patches and performance improvements." },
    ],
    cta: {
      heading: "Ready to elevate your mobile presence",
      body: "We craft custom mobile apps tailored to your business. Book a free app consultation and bring your vision to life.",
    },
  },

  marketing: {
    slug: "marketing",
    meta: {
      title: "Digital Marketing Services",
      description:
        "Social media marketing and PPC advertising from BytesPlatform — content, campaigns and paid media that build brand awareness and generate measurable ROI.",
    },
    hero: {
      title: ["Digital", "marketing"],
      intro:
        "Social media and paid campaigns designed to help businesses grow — creative that connects, backed by strategy that drives results.",
    },
    statement: "Great marketing is more than attractive posts. It's a connection with your audience and a brand they remember.",
    offer: {
      heading: "Social media marketing",
      body: "Highly engaging content that resonates with your audience, planned by people who know your industry.",
      items: [
        { title: "Custom posts & reels", body: "Tailored posts, stories and high-conversion short-form video, made in platform-native formats for every algorithm.", tags: ["Platform-native formats", "Motion graphics", "Caption frameworks"] },
        { title: "Strategic planning", body: "Senior strategists map every campaign to audience insights and market trends, with roadmaps that evolve alongside your business.", tags: ["Social audits", "Content calendars", "Real-time reporting"] },
        { title: "Multi-platform growth", body: "Campaigns that reach the right audience across Facebook, Instagram, Google and LinkedIn, and scale as you do." },
      ],
    },
    highlights: {
      heading: "Pay-per-click advertising",
      body: "Smart, scalable campaigns on Google, Bing, LinkedIn and YouTube, built for measurable ROI.",
      items: [
        { title: "Smart targeting", body: "Your ads reach the right audience, with engaging creative designed to convert." },
        { title: "Professional management", body: "A certified Google & Microsoft Ads team fine-tunes bids, keywords and ad copy in real time." },
        { title: "Full-funnel tracking", body: "GA4, Google Tag Manager and pixel tracking, so every marketing dollar is accounted for." },
      ],
    },
    faqs: [
      { q: "What types of marketing services do you offer?", a: "Social media marketing, pay-per-click advertising, content and email campaigns — all aimed at growing your brand's online presence." },
      { q: "How do you track the success of marketing campaigns?", a: "We track website traffic, conversions, social engagement and other metrics with analytics tools to measure what's working." },
      { q: "How do you create a marketing strategy for my business?", a: "We start with your business goals, target audience and competitors, then build a marketing plan that fits your needs." },
      { q: "How long will it take to see results?", a: "Paid campaigns can show results within a few weeks; organic growth efforts usually take a few months." },
    ],
    cta: {
      heading: "Ready to grow your audience",
      body: "Let's build campaigns that turn attention into customers.",
    },
  },

  "advanced-services": {
    slug: "advanced-services",
    meta: {
      title: "Advanced Services",
      description:
        "Data and analytics, cybersecurity and emerging technologies — advanced digital solutions from BytesPlatform, from AI automation to scalable tech integrations.",
    },
    hero: {
      title: ["Advanced", "services"],
      intro: "Transforming businesses through cutting-edge technology and data-driven innovation.",
    },
    statement: "Your data already holds the answers. We build the systems that find them, protect them and put them to work.",
    offer: {
      heading: "Data and analytics",
      body: "Advanced statistics, machine learning and visualization that turn raw data into strategic insight.",
      items: [
        { title: "Data modernization", body: "Legacy systems rebuilt as modern, scalable data architectures that support growth and efficiency." },
        { title: "Advanced analytics", body: "Machine learning and AI that extract actionable insights from complex datasets and predict future trends." },
        { title: "Connected intelligence", body: "IoT devices and sensors integrated into intelligent ecosystems that respond to real-time data." },
        { title: "Generative AI", body: "Generative models that automate content creation and sharpen decision-making." },
      ],
    },
    highlights: {
      heading: "Secure today, ready for tomorrow",
      items: [
        {
          title: "Cybersecurity",
          body: "A multi-layered approach that keeps your business resilient against evolving threats — from detection and incident response to compliance and security awareness training.",
        },
        {
          title: "Emerging technologies",
          body: "Strategic adoption of AI, IoT, blockchain and other transformative technology, focused on measurable business value.",
        },
      ],
    },
    faqs: [
      { q: "What are advanced services, and who are they for?", a: "Technologies like AI, machine learning, data analytics and blockchain, for businesses that want to innovate and stay ahead of the competition." },
      { q: "How do you integrate AI into my business processes?", a: "We implement AI to automate tasks, improve decision-making and enhance customer experiences, tailored to your industry." },
      { q: "Can I get custom solutions?", a: "Yes. Every solution is built around your business needs, from software development to process automation." },
      { q: "What industries benefit from advanced services?", a: "Healthcare, finance, retail and logistics benefit most, though automation, AI and analytics pay off almost anywhere." },
    ],
    cta: {
      heading: "Ready to transform your business",
      body: "Let's discuss how advanced services can accelerate your digital transformation.",
    },
  },
};
