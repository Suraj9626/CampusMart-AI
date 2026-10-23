export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "CampusMart AI";
export const APP_TAGLINE = "Exclusive, Verified Marketplace & Auctions for College Students";

// Approved College Email Domains
export const DEFAULT_APPROVED_DOMAINS = [
  "stanford.edu",
  "mit.edu",
  "berkeley.edu",
  "harvard.edu",
  "columbia.edu",
  "cmu.edu",
  "nyu.edu",
  "utexas.edu",
  "ucla.edu",
  "campus.edu",
  "college.edu",
  "university.edu",
  "edu"
];

export function getApprovedDomains(): string[] {
  const envDomains = process.env.APPROVED_COLLEGE_DOMAINS || process.env.NEXT_PUBLIC_APPROVED_COLLEGE_DOMAINS;
  if (!envDomains) return DEFAULT_APPROVED_DOMAINS;
  return envDomains.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
}

export function isCollegeEmailApproved(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1].toLowerCase().trim();
  const approvedList = getApprovedDomains();
  
  if (approvedList.includes('*')) return true;
  
  // Exact domain or ends with approved domain (e.g., student.berkeley.edu ends with berkeley.edu or .edu)
  return approvedList.some(approved => domain === approved || domain.endsWith('.' + approved) || (approved === 'edu' && domain.endsWith('.edu')));
}

export function isValidStudentEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const clean = email.toLowerCase().trim();
  const domain = clean.split('@')[1];
  if (!domain) return false;
  
  // Gmail & Google Mail support
  if (domain === 'gmail.com' || domain === 'googlemail.com') return true;
  
  // Standard approved list (.edu, whitelisted domains)
  if (isCollegeEmailApproved(clean)) return true;
  
  // Broad academic TLDs
  if (domain.endsWith('.edu') || domain.endsWith('.ac.in') || domain.endsWith('.edu.in')) return true;
  
  return false;
}

export const COLLEGE_DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electrical & Computer Engineering",
  "Mechanical Engineering",
  "Biomedical Engineering",
  "Business & Economics",
  "Data Science & AI",
  "Physics & Mathematics",
  "Biological & Health Sciences",
  "Psychology & Social Sciences",
  "Architecture & Design",
  "Humanities & Arts",
  "Law & Public Policy",
  "Other / General Studies"
] as const;

export const ACADEMIC_YEARS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
  "Alumni"
] as const;

export const PRODUCT_CONDITIONS: Record<string, { label: string; description: string; badgeColor: string }> = {
  new: {
    label: "Brand New",
    description: "Unopened in original box or tags still attached",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  },
  like_new: {
    label: "Like New",
    description: "Flawless condition, used once or twice with no noticeable wear",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  },
  good: {
    label: "Good",
    description: "Minor cosmetic scratches or normal campus wear, fully functional",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
  },
  fair: {
    label: "Fair",
    description: "Visible wear or signs of heavy use, but works as intended",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
  }
};

export const COMMON_CAMPUS_PICKUP_LOCATIONS = [
  "Main Campus Library (Lobby / Entrance)",
  "Student Union / Campus Activity Center",
  "Engineering Quad / Science Building",
  "Central Dining Hall Courtyard",
  "Campus Police Station / Safe Exchange Zone",
  "Undergraduate Residence Hall Desk"
];

// Anti-phishing / Safe exchange patterns
export const CONTACT_LEAK_REGEX = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
