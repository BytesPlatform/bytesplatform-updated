/**
 * UAE e-invoicing landing page copy.
 *
 * Regulatory facts below come from Ministerial Decisions 243 & 244 of 2025,
 * Cabinet Decision 106 of 2025 and the MoF Electronic Invoicing Guidelines
 * (v1.1, June 2026), as reported by the sources in `sources`. Re-check them
 * before each campaign: the Phase 1 ASP date already moved once (31 Jul → 30 Oct 2026).
 */

/** Dates are UTC+4 (Gulf Standard Time) midnight, so countdowns flip on UAE time. */
export const milestones = [
  { id: "pilot", date: "2026-07-01T00:00:00+04:00", label: "Pilot with the Taxpayer Working Group" },
  { id: "p1-asp", date: "2026-10-30T23:59:59+04:00", label: "Phase 1: appoint your ASP" },
  { id: "p1-live", date: "2027-01-01T00:00:00+04:00", label: "Phase 1: mandatory go-live" },
  { id: "p2-asp", date: "2027-03-31T23:59:59+04:00", label: "Phase 2: appoint your ASP" },
  { id: "p2-live", date: "2027-07-01T00:00:00+04:00", label: "Phase 2: mandatory go-live" },
] as const;

export const phases = [
  {
    name: "Phase 1",
    who: "Annual revenue of AED 50 million or more",
    asp: "Appoint an ASP by 30 October 2026",
    live: "Live from 1 January 2027",
  },
  {
    name: "Phase 2",
    who: "Annual revenue below AED 50 million",
    asp: "Appoint an ASP by 31 March 2027",
    live: "Live from 1 July 2027",
  },
] as const;

export const penalties = [
  { amount: "AED 5,000", per: "per month", what: "for not implementing e-invoicing or not appointing an ASP on time" },
  { amount: "AED 100", per: "per invoice", what: "issued or sent late, capped at AED 5,000 a month" },
] as const;

export const capabilities = ["PINT AE validation", "Works with any accredited ASP", "No ERP replacement", "Peppol-ready data"] as const;

export const problem = {
  heading: "An ASP is required. It isn't enough.",
  body:
    "Every business in scope must appoint an accredited service provider to exchange invoices over Peppol and report them to the FTA. But an ASP can only send what your ERP hands it. We work on that side of the line.",
  points: [
    {
      title: "The ASP is the legal step",
      body: "Appointing one is mandatory, and the choice is yours. We integrate with whichever accredited provider you pick.",
    },
    {
      title: "Bad data gets rejected",
      body: "A missing TRN, an empty electronic address or an unmapped tax code fails validation, and the rejection lands on your finance team.",
    },
    {
      title: "Clean-up takes weeks",
      body: "Fixing master data across customers, items and tax codes takes time, so it has to start before the ASP deadline, not after go-live.",
    },
  ],
};

/** No connector is claimed as pre-built: every ERP is scoped per project. */
export const erps = [
  { name: "SAP", editions: "S/4HANA · ECC · Business One" },
  { name: "Oracle", editions: "Fusion · E-Business Suite · NetSuite" },
  { name: "Microsoft Dynamics", editions: "365 · Business Central · NAV" },
  { name: "Zoho", editions: "Zoho Books · Zoho ERP" },
  { name: "Odoo", editions: "Accounting · Invoicing" },
  { name: "Tally", editions: "TallyPrime · Tally ERP" },
  { name: "QuickBooks", editions: "Online · Desktop" },
  { name: "Custom ERP", editions: "In-house and legacy systems" },
] as const;

export const steps = [
  { title: "Audit your ERP data", body: "We test customer, item and tax master data against PINT AE and hand you a written gap report: TRNs, tax codes, electronic addresses." },
  { title: "Fix it at the source", body: "Fields, tax-code mappings, electronic addresses and Arabic descriptions are corrected inside the ERP, not patched in a spreadsheet." },
  { title: "Validate before submission", body: "Every mandatory field, tax rule and total is checked against PINT AE before the invoice reaches your ASP." },
  { title: "Monitor where you work", body: "Status, rejections and an audit trail show up inside your ERP, so finance never has to chase a portal." },
] as const;

export const faqs = [
  {
    q: "Do we need an accredited service provider (ASP)?",
    a: "Yes. Every business in scope must appoint an ASP. Only an accredited provider can exchange your e-invoices over Peppol and report them to the FTA.",
  },
  {
    q: "Is BytesPlatform an ASP?",
    a: "No. We prepare and integrate your ERP so that whatever it sends to your ASP passes validation. You keep the ASP you choose, and switching providers later doesn't change the ERP side.",
  },
  {
    q: "What is PINT AE?",
    a: "The UAE's national e-invoice specification, based on Peppol. It defines the mandatory fields, tax category codes and the structured XML format. A PDF sent by email is not a valid e-invoice.",
  },
  {
    q: "Which ERPs can you work with?",
    a: "SAP, Oracle, Microsoft Dynamics, Zoho, Odoo, Tally, QuickBooks and custom or legacy systems. Each integration is scoped to your exact version and modules, and confirmed in writing before work starts.",
  },
  {
    q: "We've already appointed an ASP. Do we still need this?",
    a: "Usually, yes. Your ASP transmits what it receives. If master data is incomplete or tax codes aren't mapped, invoices are rejected. We fix the ERP side without touching your ASP contract.",
  },
  {
    q: "Are B2C invoices included?",
    a: "Not for now. Business-to-consumer transactions are excluded from the mandate until further notice; the rollout covers B2B and B2G invoicing.",
  },
] as const;

export const roles = ["Finance / CFO", "Tax", "IT / ERP", "Operations", "Founder / Owner", "Other"] as const;

export const sources = [
  { label: "MoF Electronic Invoicing Guidelines v1.1", href: "https://mof.gov.ae/wp-content/uploads/2026/06/UAE-Electronic-Invoicing-Guidelines_V-1.1-01June2026.pdf" },
  { label: "Cabinet Decision 106 of 2025 (penalties)", href: "https://alsuwaidi.ae/uae-introduces-new-penalty-framework-for-electronic-invoicing-compliance/" },
] as const;
