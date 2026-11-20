export type Polarity = "dark" | "frost";

export type PhotoSlot = {
  id: string;
  file: string;
  src: string;
  ratio: string;
  width: number;
  height: number;
  hint: string;
  alt: string;
  caption: string;
  usedIn: string;
};

export type PhotoRef = string;

export type LinkItem = {
  label: string;
  href: string;
};

export type ProjectScene = "qa" | "bpmn" | "numeral";

export type Project = {
  id: string;
  number: string;
  title: string;
  year: string;
  stack: string[];
  bullets: string[];
  phrase: string;
  month: string;
  cover: PhotoRef;
  details: PhotoRef[];
  links: LinkItem[];
  scene: ProjectScene;
};

export type ExperienceRole = {
  id: string;
  role: string;
  org: string;
  dates: string;
  start: string;
  end: string;
  blocks: { label: string; value: string }[];
  bullets: string[];
  cover: PhotoRef;
  details: PhotoRef[];
};

export type Organization = {
  id: string;
  role: string;
  org: string;
  dates: string;
  scene: "ramadan" | "schematics" | "hmtc";
  stats: string[];
  bullets: string[];
  cover: PhotoRef;
  details: PhotoRef[];
};

export type SkillGroup =
  | "Languages"
  | "Data Science & AI"
  | "Data & Tools"
  | "Other";

export type SkillLink = {
  kind: "project" | "experience" | "org";
  id: string;
};

export type Skill = {
  id: string;
  label: string;
  group: SkillGroup;
  links: SkillLink[];
};

export type EducationEntry = {
  id: string;
  school: string;
  level: string;
  dates: string;
  scoreLabel: string;
  score: string;
  location: string;
  note: string;
};

const photo = (
  id: string,
  ratio: string,
  width: number,
  height: number,
  hint: string,
  alt: string,
  usedIn: string,
  caption = "",
): PhotoSlot => ({
  id,
  file: `images/${id}.jpg`,
  src: `/images/${id}.jpg`,
  ratio,
  width,
  height,
  hint,
  alt,
  caption,
  usedIn,
});

export const photoSlots: Record<string, PhotoSlot> = Object.fromEntries(
  [
    photo(
      "profile/portrait-main",
      "4:5",
      1600,
      2000,
      "Your best portrait, shoulders up",
      "Hisyam Syafa Raditya",
      "Hero portrait capsule",
    ),
    photo(
      "profile/portrait-alt",
      "4:5",
      1600,
      2000,
      "Casual or candid alternate",
      "Hisyam Syafa Raditya, alternate portrait",
      "Hero portrait on hover or tap (optional)",
    ),
    photo(
      "profile/about-candid",
      "1:1",
      1200,
      1200,
      "Working or candid shot",
      "Hisyam Syafa Raditya at work",
      "About section tilted frame",
    ),
    photo(
      "projects/qa-agent/cover",
      "16:10",
      1920,
      1200,
      "Dashboard or UI",
      "Autonomous Web QA Agent",
      "Project 01 object and scene",
    ),
    photo(
      "projects/qa-agent/detail-1",
      "16:10",
      1920,
      1200,
      "A pipeline run",
      "Autonomous Web QA Agent detail 1",
      "Project 01 scene gallery",
    ),
    photo(
      "projects/qa-agent/detail-2",
      "16:10",
      1920,
      1200,
      "A draft PR on GitHub",
      "Autonomous Web QA Agent detail 2",
      "Project 01 scene gallery",
    ),
    photo(
      "projects/qa-agent/detail-3",
      "16:10",
      1920,
      1200,
      "Optional extra detail",
      "Autonomous Web QA Agent detail 3",
      "Project 01 scene gallery",
    ),
    photo(
      "projects/bpmn-agent/cover",
      "16:10",
      1920,
      1200,
      "The BPMN diagram",
      "Agentic AI for BPMN Code Change Planning",
      "Project 02 object and scene",
    ),
    photo(
      "projects/bpmn-agent/detail-1",
      "16:10",
      1920,
      1200,
      "Multi-agent output",
      "Agentic AI for BPMN Code Change Planning detail 1",
      "Project 02 scene gallery",
    ),
    photo(
      "projects/bpmn-agent/detail-2",
      "16:10",
      1920,
      1200,
      "The experiment setup",
      "Agentic AI for BPMN Code Change Planning detail 2",
      "Project 02 scene gallery",
    ),
    photo(
      "projects/bpmn-agent/detail-3",
      "16:10",
      1920,
      1200,
      "Optional extra detail",
      "Agentic AI for BPMN Code Change Planning detail 3",
      "Project 02 scene gallery",
    ),
    photo(
      "projects/numeral-classification/cover",
      "16:10",
      1920,
      1200,
      "Sample numeral grid",
      "Handwritten Chinese Numeral Classification",
      "Project 03 object and scene",
    ),
    photo(
      "projects/numeral-classification/detail-1",
      "16:10",
      1920,
      1200,
      "Training or evaluation plots",
      "Handwritten Chinese Numeral Classification detail 1",
      "Project 03 scene gallery",
    ),
    photo(
      "projects/numeral-classification/detail-2",
      "16:10",
      1920,
      1200,
      "Grad-CAM examples",
      "Handwritten Chinese Numeral Classification detail 2",
      "Project 03 scene gallery",
    ),
    photo(
      "projects/numeral-classification/detail-3",
      "16:10",
      1920,
      1200,
      "Optional extra detail",
      "Handwritten Chinese Numeral Classification detail 3",
      "Project 03 scene gallery",
    ),
    photo(
      "experience/ta-database/cover",
      "3:2",
      1800,
      1200,
      "Teaching session",
      "Teaching Assistant for Database Systems",
      "Experience knot and panel",
    ),
    photo(
      "experience/ta-database/1",
      "3:2",
      1800,
      1200,
      "SQL case study material",
      "Database Systems teaching detail 1",
      "Experience role gallery",
    ),
    photo(
      "experience/ta-database/2",
      "3:2",
      1800,
      1200,
      "Optional extra detail",
      "Database Systems teaching detail 2",
      "Experience role gallery",
    ),
    photo(
      "experience/robocon/cover",
      "3:2",
      1800,
      1200,
      "Robot or lab",
      "Programming Division Intern at ITS Robocon",
      "Experience knot and panel",
    ),
    photo(
      "experience/robocon/1",
      "3:2",
      1800,
      1200,
      "Team",
      "ITS Robocon internship detail 1",
      "Experience role gallery",
    ),
    photo(
      "experience/robocon/2",
      "3:2",
      1800,
      1200,
      "Optional extra detail",
      "ITS Robocon internship detail 2",
      "Experience role gallery",
    ),
    photo(
      "orgs/hmtc-external-affairs/cover",
      "3:2",
      1800,
      1200,
      "Company visit (Oracle or Telkom)",
      "External Affairs Staff at HMTC ITS",
      "Organization island and panel",
    ),
    photo(
      "orgs/hmtc-external-affairs/1",
      "3:2",
      1800,
      1200,
      "Program documentation",
      "HMTC External Affairs detail 1",
      "Organization gallery",
    ),
    photo(
      "orgs/hmtc-external-affairs/2",
      "3:2",
      1800,
      1200,
      "Optional extra detail",
      "HMTC External Affairs detail 2",
      "Organization gallery",
    ),
    photo(
      "orgs/schematics-data/cover",
      "3:2",
      1800,
      1200,
      "Looker Studio dashboard screenshot",
      "Vice Head of Data Management at Schematics 2026",
      "Organization island and panel",
    ),
    photo(
      "orgs/schematics-data/1",
      "3:2",
      1800,
      1200,
      "Team",
      "Schematics Data Management detail 1",
      "Organization gallery",
    ),
    photo(
      "orgs/schematics-data/2",
      "3:2",
      1800,
      1200,
      "Optional extra detail",
      "Schematics Data Management detail 2",
      "Organization gallery",
    ),
    photo(
      "orgs/ramadan-kampus/cover",
      "3:2",
      1800,
      1200,
      "Food distribution",
      "Head of Food & Nutrition at Ramadan di Kampus 1447H",
      "Organization island and panel",
    ),
    photo(
      "orgs/ramadan-kampus/1",
      "3:2",
      1800,
      1200,
      "Team",
      "Ramadan di Kampus detail 1",
      "Organization gallery",
    ),
    photo(
      "orgs/ramadan-kampus/2",
      "3:2",
      1800,
      1200,
      "Optional extra detail",
      "Ramadan di Kampus detail 2",
      "Organization gallery",
    ),
  ].map((slot) => [slot.id, slot]),
);

export const getPhoto = (id: PhotoRef): PhotoSlot => {
  const slot = photoSlots[id];
  if (!slot) throw new Error(`Unknown photo slot: ${id}`);
  return slot;
};

export const site = {
  name: "Hisyam Syafa Raditya",
  firstName: "Hisyam",
  role: "Informatics Engineering student",
  institution: "Institut Teknologi Sepuluh Nopember",
  institutionShort: "ITS",
  location: "Surabaya, Indonesia",
  email: "hisyamsyafa2@gmail.com",
  phone: "+6285227763718",
  phoneDisplay: "+6285227763718",
  linkedin: {
    label: "linkedin.com/in/hisyam-syafa-raditya",
    href: "https://linkedin.com/in/hisyam-syafa-raditya",
  },
  github: {
    label: "github.com/hisyamssyr",
    href: "https://github.com/hisyamssyr",
  },
  summary:
    "Informatics Engineering student at Institut Teknologi Sepuluh Nopember with a strong foundation in Python, SQL, data analysis, and machine learning. Experienced in database instruction, data management, and team leadership, with a focus on applying analytical and technical skills to solve real-world problems and deliver meaningful insights.",
  monoLine: "Informatics Engineering · ITS · Surabaya, Indonesia",
  heroWords: [
    { word: "agents", projectId: "qa-agent" },
    { word: "data", projectId: "numeral-classification" },
    { word: "systems", projectId: "bpmn-agent" },
  ],
  keywords: [
    "Python",
    "SQL",
    "data analysis",
    "machine learning",
    "team leadership",
  ],
  imageTreatment: "graded" as "graded" | "raw",
  cvUrl: "",
  footer: "Hisyam Syafa Raditya · Surabaya · 2026",
};

export const education: EducationEntry[] = [
  {
    id: "its",
    school: "Institut Teknologi Sepuluh Nopember",
    level: "Bachelor of Informatics",
    dates: "Aug 2024 – Aug 2028 (Expected)",
    scoreLabel: "GPA",
    score: "3.49/4.00",
    location: "Surabaya, Indonesia",
    note: "Aug 2024 – Aug 2028 expected",
  },
  {
    id: "sman1",
    school: "SMA Negeri 1 Srengat",
    level: "Senior High School",
    dates: "Jul 2021 – May 2024",
    scoreLabel: "Score",
    score: "87.60/100.00",
    location: "Blitar, Indonesia",
    note: "Jul 2021 – May 2024",
  },
];

export const projects: Project[] = [
  {
    id: "qa-agent",
    number: "01",
    title: "Autonomous Web QA Agent",
    year: "2026",
    month: "PROJECT 01",
    stack: ["Laravel 13", "Livewire 4", "Node.js", "Playwright", "LLM"],
    bullets: [
      "Built an autonomous web QA agent using Laravel 13, Livewire 4, Node.js, and Playwright, integrating an OpenAI-compatible LLM with snapshot-based action validation.",
      "Designed a six-gate repair verification pipeline using isolated Docker sandboxes to validate regression failures, patched test success, and browser replays.",
      "Integrated GitHub Apps authentication and REST APIs to inspect repositories, commit bounded patches to restricted branches, and create idempotent draft PRs.",
      "Implemented application security controls for SSRF prevention, DNS rebinding mitigation, same-origin enforcement, and credential redaction.",
    ],
    phrase: "Every patch has to walk through six gates before it counts.",
    cover: "projects/qa-agent/cover",
    details: [
      "projects/qa-agent/detail-1",
      "projects/qa-agent/detail-2",
      "projects/qa-agent/detail-3",
    ],
    links: [],
    scene: "qa",
  },
  {
    id: "bpmn-agent",
    number: "02",
    title: "Agentic AI for BPMN Code Change Planning",
    year: "2026",
    month: "PROJECT 02",
    stack: ["Python", "Multi-Agent", "RAG"],
    bullets: [
      "Developed a collaborative multi-agent architecture featuring specialized roles (analyst, backend, frontend, CSS, reviewer) to orchestrate codebase modifications from BPMN updates.",
      "Integrated Retrieval-Augmented Generation (RAG) to dynamically fetch and leverage relevant implementation examples from an existing ERP codebase.",
      "Designed and executed comparative experiments across three setups (single-agent, single-agent with RAG, and multi-agent with RAG) to measure performance variations.",
      "Evaluated the impact of role decomposition and contextual retrieval in improving the accuracy and structural logic of automated architectural planning.",
    ],
    phrase: "Five roles, one shared memory of the codebase.",
    cover: "projects/bpmn-agent/cover",
    details: [
      "projects/bpmn-agent/detail-1",
      "projects/bpmn-agent/detail-2",
      "projects/bpmn-agent/detail-3",
    ],
    links: [],
    scene: "bpmn",
  },
  {
    id: "numeral-classification",
    number: "03",
    title: "Handwritten Chinese Numeral Classification",
    year: "2026",
    month: "PROJECT 03",
    stack: ["Python", "TensorFlow", "ResNet-18"],
    bullets: [
      "Developed an end-to-end handwritten Chinese numeral classification pipeline using TensorFlow/Keras for 15 classes and 10,500 images from 70 writers.",
      "Engineered reproducible image preprocessing, disk caching, and custom data augmentation to address handwriting variations.",
      "Implemented a custom ResNet-18 model with EMA, AdamW, learning-rate scheduling, label smoothing, and mixed-precision training.",
      "Built a leakage-free evaluation pipeline using writer-grouped cross-validation, multi-seed ensembling, test-time augmentation, and Grad-CAM diagnostics.",
    ],
    phrase: "Writers stay on one side of the split.",
    cover: "projects/numeral-classification/cover",
    details: [
      "projects/numeral-classification/detail-1",
      "projects/numeral-classification/detail-2",
      "projects/numeral-classification/detail-3",
    ],
    links: [],
    scene: "numeral",
  },
];

export const experience: ExperienceRole[] = [
  {
    id: "ta-database",
    role: "Teaching Assistant for Database Systems",
    org: "Institut Teknologi Sepuluh Nopember",
    dates: "Aug 2025 – Dec 2025",
    start: "2025-08",
    end: "2025-12",
    blocks: [
      { label: "13", value: "students guided" },
      { label: "7", value: "sessions evaluated" },
    ],
    bullets: [
      "Guided 13 students through hands-on database design and SQL exercises.",
      "Explained CDM/PDM, DDL, and DML concepts through practical demonstrations.",
      "Developed SQL case studies to support applied query-solving practice.",
      "Evaluated assignments and quizzes across 7 sessions to assess student understanding.",
    ],
    cover: "experience/ta-database/cover",
    details: ["experience/ta-database/1", "experience/ta-database/2"],
  },
  {
    id: "robocon",
    role: "Programming Division Intern",
    org: "ITS Robocon",
    dates: "Sep 2024 – Oct 2024",
    start: "2024-09",
    end: "2024-10",
    blocks: [],
    bullets: [
      "Explored microcontroller systems and their robotics applications.",
      "Practiced embedded programming using C++ and Python.",
      "Studied ROS fundamentals for robot navigation and control.",
      "Learned basic robotics programming workflows during the internship program.",
    ],
    cover: "experience/robocon/cover",
    details: ["experience/robocon/1", "experience/robocon/2"],
  },
];

export const organizations: Organization[] = [
  {
    id: "hmtc",
    role: "External Affairs Staff",
    org: "Himpunan Mahasiswa Teknik Computer-Informatika ITS",
    dates: "Mar 2026 – Present",
    scene: "hmtc",
    stats: ["Siapin Karirmu", "Oracle + Telkom", "60 participants"],
    bullets: [
      "Led the Siapin Karirmu Instagram content program as Person in Charge.",
      "Coordinated 60 participants as Liaison Officer during Oracle and Telkom company visits.",
      "Led the planning and execution of the Benchmarking program.",
      "Managed program coordination and task delegation within the organizing team.",
    ],
    cover: "orgs/hmtc-external-affairs/cover",
    details: ["orgs/hmtc-external-affairs/1", "orgs/hmtc-external-affairs/2"],
  },
  {
    id: "schematics",
    role: "Vice Head of Data Management",
    org: "Schematics 2026",
    dates: "Mar 2026 – Present",
    scene: "schematics",
    stats: ["Registration", "SQL automation", "Looker Studio"],
    bullets: [
      "Designed SOPs for website-based and offline registration data management.",
      "Automated SQL query generation using spreadsheets for registration data processing.",
      "Built Looker Studio dashboards to track participant registrations.",
      "Automated bulk messaging and email distribution for participant communications.",
    ],
    cover: "orgs/schematics-data/cover",
    details: ["orgs/schematics-data/1", "orgs/schematics-data/2"],
  },
  {
    id: "ramadan",
    role: "Head of Food & Nutrition",
    org: "Ramadan di Kampus 1447H",
    dates: "Aug 2025 – Mar 2026",
    scene: "ramadan",
    stats: ["25+ staff", "15+ vendors", "700+ daily participants"],
    bullets: [
      "Led 25+ staff and coordinated cross-division operations.",
      "Designed food distribution systems serving 700+ participants daily.",
      "Coordinated with 15+ vendors on procurement, pricing, and MoU agreements.",
      "Established SOPs for food quality control, vendor selection, and distribution logistics.",
    ],
    cover: "orgs/ramadan-kampus/cover",
    details: ["orgs/ramadan-kampus/1", "orgs/ramadan-kampus/2"],
  },
];

export const skills: Skill[] = [
  { id: "python", label: "Python", group: "Languages", links: [
    { kind: "project", id: "bpmn-agent" },
    { kind: "project", id: "numeral-classification" },
    { kind: "experience", id: "robocon" },
  ] },
  { id: "sql", label: "SQL", group: "Languages", links: [
    { kind: "experience", id: "ta-database" },
    { kind: "org", id: "schematics" },
  ] },
  { id: "go", label: "Go", group: "Languages", links: [] },
  { id: "cpp", label: "C++", group: "Languages", links: [
    { kind: "experience", id: "robocon" },
  ] },
  { id: "php", label: "PHP (Laravel)", group: "Languages", links: [
    { kind: "project", id: "qa-agent" },
  ] },
  { id: "node", label: "Node.js", group: "Languages", links: [
    { kind: "project", id: "qa-agent" },
  ] },
  { id: "tensorflow", label: "TensorFlow/Keras", group: "Data Science & AI", links: [
    { kind: "project", id: "numeral-classification" },
  ] },
  { id: "llm", label: "LLMs", group: "Data Science & AI", links: [
    { kind: "project", id: "qa-agent" },
  ] },
  { id: "multiagent", label: "Multi-Agent AI", group: "Data Science & AI", links: [
    { kind: "project", id: "bpmn-agent" },
  ] },
  { id: "rag", label: "RAG", group: "Data Science & AI", links: [
    { kind: "project", id: "bpmn-agent" },
  ] },
  { id: "cnn", label: "CNN (ResNet)", group: "Data Science & AI", links: [
    { kind: "project", id: "numeral-classification" },
  ] },
  { id: "crossval", label: "Cross-Validation", group: "Data Science & AI", links: [
    { kind: "project", id: "numeral-classification" },
  ] },
  { id: "playwright", label: "Playwright", group: "Data & Tools", links: [
    { kind: "project", id: "qa-agent" },
  ] },
  { id: "docker", label: "Docker", group: "Data & Tools", links: [
    { kind: "project", id: "qa-agent" },
  ] },
  { id: "looker", label: "Looker Studio", group: "Data & Tools", links: [
    { kind: "org", id: "schematics" },
  ] },
  { id: "dbeaver", label: "DBeaver", group: "Data & Tools", links: [] },
  { id: "tableplus", label: "TablePlus", group: "Data & Tools", links: [] },
  { id: "git", label: "Git/GitHub", group: "Data & Tools", links: [
    { kind: "project", id: "qa-agent" },
  ] },
  { id: "figma", label: "Figma", group: "Data & Tools", links: [] },
  { id: "bpmn", label: "Business Process Modeling (BPMN)", group: "Other", links: [
    { kind: "project", id: "bpmn-agent" },
  ] },
  { id: "security", label: "Application Security", group: "Other", links: [
    { kind: "project", id: "qa-agent" },
  ] },
  { id: "dbdesign", label: "Database Design (CDM/PDM)", group: "Other", links: [
    { kind: "experience", id: "ta-database" },
  ] },
];

export const skillGroups: SkillGroup[] = [
  "Languages",
  "Data Science & AI",
  "Data & Tools",
  "Other",
];

export const organizationsByStats = {
  ramadanVendors: 15,
  ramadanParticipants: 700,
  ramadanStaff: 25,
  hmtcParticipants: 60,
};

export const navSections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "organizations", label: "Organizations" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof navSections)[number]["id"];
