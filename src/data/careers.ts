/** Careers page copy, adapted from https://bytesplatform.com/careers. */

export type Role = { title: string; team: string; requirements: string[] };

export const careers = {
  intro:
    "Innovate, collaborate and grow alongside a passionate team, where your ideas matter, your growth is prioritized, and your well-being is part of our mission.",
  statement: "Great products come from people who are trusted to do their best work. That's the team we're building.",
  perks: ["Competitive salary", "Health insurance", "Flexible working hours", "Professional development"],
  about:
    "Join our team and contribute to projects that shape the future of technology. We offer a collaborative environment where innovation thrives and your ideas make a real impact.",
  /** Empty for now; roles will come from a database. The page shows an empty state until then. */
  roles: [] as Role[],
  /** Every role is listed the same way on the current site. */
  location: "On-site · Denton, Texas",
  type: "Internship / Full-time",
};
