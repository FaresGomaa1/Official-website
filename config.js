/*
 * config.js — the single place to personalize the portfolio.
 *
 * Placeholders: any value containing "YOUR-", "your.email@example.com" or
 * "your-domain.example" is treated as a placeholder. Placeholder links are hidden
 * automatically, and the contact form stays disabled until a real email is set.
 *
 * Entries marked `example: true` are editable sample content. Verify every detail
 * and remove the flag (or the entry) before publishing.
 *
 * Nothing here is fetched from a server. Keep secrets (API keys, tokens) out of this file.
 */
window.PORTFOLIO_CONFIG = {
  /* ---------- Personal details ---------- */
  person: {
    name: "Fares Gomaa",
    initials: "FG",
    title: "Software Engineer",
    typedTitles: [
      "Backend Developer",
      "Full-Stack Developer",
      "Microsoft Dynamics 365 & Power Platform Developer",
    ],
    location: "Egypt",
    workArrangement: "Remote or hybrid", // e.g. "Remote or hybrid". Leave empty to hide.
    experienceSummary: "2+ years of professional software development experience",
    email: "fares.gomaa.work@gmail.com", // REQUIRED before publishing: enables the contact form
    tagline: "Backend engineering and Microsoft business solutions, built to last.",
    bio:
      "I design and build backend services, enterprise applications and Microsoft business solutions. My work runs from ASP.NET Core APIs and SQL Server data models to Dynamics 365 customizations and Power Platform automation.",
    cvPath: "assets/Fares_Abdelsttar_Gomaa_Resume.pdf", // Place your CV at this path. The Download CV button uses it.
  },

  /* Canonical site URL placeholder. Used for the copy-URL fallback and JSON-LD only when set. */
  siteUrl: "https://your-domain.example/",

  /* Availability badge. status: "available" | "limited" | "unavailable" */
  availability: {
    status: "available",
    text: "Available for backend & enterprise projects",
  },

  /* Optional banner. Set enabled: true to show it. Dismissal is remembered per id. */
  announcement: {
    enabled: true,
    id: "2026-10-open-to-work",
    text: "Open to new backend and Power Platform opportunities.",
    linkText: "Let's talk",
    linkHref: "#contact",
  },

  /* ---------- Links (placeholders are hidden automatically) ---------- */
  links: [
    { id: "github", label: "GitHub", url: "https://github.com/FaresGomaa1", icon: "fa-brands fa-github" },
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/fares-abdelsttar", icon: "fa-brands fa-linkedin-in" },
    { id: "email", label: "Email", url: "mailto:fares.gomaa.work@gmail.com", icon: "fa-solid fa-envelope" },
  ],

  /* ---------- Hero ---------- */
  heroStack: ["C#", "ASP.NET Core", "Entity Framework Core", "SQL Server", "Dataverse", "Power Automate", "Azure", "Angular"],

  /* ---------- Professional highlights (empty value = hidden) ---------- */
  highlights: [
    { value: "2+", label: "Years of professional software development" },
    { value: "Dynamics 365", label: "Customer Engagement & Dataverse development" },
    { value: "Power Platform", label: "Power Apps, Power Automate & Power Pages" },
    { value: "PL-200", label: "Microsoft Power Platform Functional Consultant Associate" },
    // Add a "projects completed" figure only when you can verify it, e.g. { value: "12", label: "..." }
  ],

  /* ---------- About ---------- */
  about: [
    "My background combines software engineering with an engineering degree, which shapes how I approach business problems: I look at the process, the data and the constraints before writing code.",
    "I work mainly in the Microsoft business applications ecosystem. Day to day, that means Dynamics 365 Customer Engagement, Dataverse, Power Apps and Power Automate, alongside ASP.NET Core services and SQL Server data models.",
    "I care about solutions that are easy to maintain: explicit data models, clear business rules, well-defined API contracts and code that the next engineer can read. I am currently deepening my computer science background through postgraduate studies.",
  ],
  values: [
    "Clean, readable code",
    "Reliability and maintainability",
    "Collaboration with technical and business stakeholders",
    "Continuous improvement",
  ],
  team: [
    { title: "Dependable delivery", text: "I break work into reviewable steps and keep the system working at every step." },
    { title: "Business context", text: "I ask what a process is for before deciding how to automate or build it." },
    { title: "Clear integration", text: "I document API contracts and integration assumptions so other teams can rely on them." },
  ],

  /* ---------- Skills (no proficiency percentages) ---------- */
  skills: [
    {
      id: "backend",
      label: "Backend Development",
      items: [
        { name: "C#", desc: "My primary language for backend services, business logic and enterprise integrations." },
        { name: "ASP.NET Core", desc: "Building REST APIs, middleware and background services with dependency injection and clean layering." },
        { name: "ASP.NET MVC" },
        { name: "Entity Framework Core", desc: "Data access, migrations and LINQ-based queries against relational databases." },
        { name: "LINQ" },
        { name: "REST APIs", desc: "Designing endpoints, validating input and integrating external systems with authentication flows." },
      ],
    },
    {
      id: "frontend",
      label: "Frontend Development",
      items: [
        { name: "HTML5" },
        { name: "CSS3" },
        { name: "JavaScript (ES6+)" },
        { name: "TypeScript" },
        { name: "Angular" },
        { name: "Bootstrap" },
      ],
    },
    {
      id: "databases",
      label: "Databases",
      items: [
        { name: "Microsoft SQL Server", desc: "Relational schema design, queries, indexing and execution-plan analysis for performance." },
        { name: "SQL" },
        { name: "Relational database design", desc: "Normalized data models that reflect business rules and keep integrity enforceable." },
      ],
    },
    {
      id: "dynamics",
      label: "Dynamics 365 & Dataverse",
      items: [
        { name: "Dynamics 365 Customer Engagement", desc: "Customizing sales, service and case-management processes on the platform." },
        { name: "Dataverse", desc: "Tables, relationships, business rules and server-side logic that keep data consistent across apps." },
        { name: "Custom Dataverse plugins", desc: "Server-side C# plugins registered on pipeline events to enforce business logic." },
        { name: "Model-Driven Apps" },
        { name: "Unified Client Interface" },
      ],
    },
    {
      id: "power",
      label: "Power Platform",
      items: [
        { name: "Power Apps", desc: "Canvas and model-driven apps that give business users focused, governed interfaces." },
        { name: "Power Automate", desc: "Cloud flows that automate approvals, notifications and data movement between systems." },
        { name: "Power Pages" },
        { name: "Canvas Apps" },
        { name: "Microsoft SharePoint" },
      ],
    },
    {
      id: "cloud",
      label: "Cloud & DevOps",
      items: [
        { name: "Microsoft Azure" },
        { name: "Azure DevOps" },
        { name: "Git" },
        { name: "GitHub" },
      ],
    },
    {
      id: "fundamentals",
      label: "Software Engineering Fundamentals",
      items: [
        { name: "Object-Oriented Programming (OOP)" },
        { name: "SOLID principles" },
        { name: "Clean code" },
        { name: "API integration" },
        { name: "Performance optimization" },
        { name: "Software maintenance" },
      ],
    },
    {
      id: "tools",
      label: "Tools & Testing",
      items: [
        { name: "Visual Studio" },
        { name: "Visual Studio Code" },
        { name: "Postman" },
        { name: "Unit testing" },
        { name: "Debugging" },
      ],
    },
  ],

  /* ---------- Experience (newest first). start/end use YYYY-MM. end: null = present ---------- */
  experience: [
    {
      title: "Software Engineer",
      company: "Link Development",
      location: "Egypt",
      start: "2024-06",
      end: null,
      responsibilities: [
        "Working on Dynamics 365 and Power Platform solutions for enterprise business processes.",
        "Building and maintaining backend logic and integrations with ASP.NET Core, C# and SQL Server.",
        "Implementing and debugging REST API integrations and authentication flows.",
      ],
      technologies: ["Dynamics 365", "Dataverse", "Power Platform", "C#", "ASP.NET Core", "SQL Server", "Azure DevOps"],
      // Add verified accomplishments only, e.g. "Delivered X, which reduced Y". Empty = hidden.
      accomplishments: [],
      projectIds: ["gov-crm-modernization", "dataverse-plugins", "rest-api-auth"],
    },
  ],

  /* ---------- Featured projects ----------
   * confidential: true  -> labeled as confidential enterprise work; no implementation details shown
   * example: true        -> labeled "Example entry" until you verify and edit it
   * repo / demo         -> leave empty ("") when unavailable. Buttons are hidden automatically.
   */
  projects: [
    {
      id: "gov-crm-modernization",
      title: "Government CRM Modernization",
      category: "Dynamics 365",
      icon: "fa-solid fa-landmark",
      featured: true,
      confidential: true,
      example: true,
      summary: "Migration of a government-sector CRM from a legacy interface to the Unified Client Interface.",
      overview:
        "A government-sector CRM needed a modern, consistent user experience. The work covered moving the existing customizations onto the Unified Client Interface while keeping business processes intact.",
      problem:
        "The legacy interface made daily case work slow and hard to learn, and customizations were spread across screens that no longer matched how staff worked.",
      solution:
        "The approach was to review the existing customizations, keep the business rules that still applied, and rebuild the affected forms, views and processes against the modern client with tested, incremental changes.",
      contribution:
        "Edit this to describe the parts you personally built or reviewed (for example, specific forms, plugins or integrations).",
      challenges: [
        "Keeping existing business rules working while the UI changed.",
        "Validating behavior with stakeholders who relied on the old screens.",
      ],
      tech: ["Dynamics 365 Customer Engagement", "Unified Client Interface", "Dataverse", "Power Platform", "C#"],
      testing: "Edit: describe how changes were tested before release (manual test scripts, plugin unit tests, UAT).",
      repo: "",
      demo: "",
      image: null, // e.g. { src: "assets/projects/crm-architecture.png", alt: "...", width: 1280, height: 720 }
    },
    {
      id: "dataverse-plugins",
      title: "Custom Dataverse Plugins & Workflow Automation",
      category: "Dynamics 365",
      icon: "fa-solid fa-gears",
      featured: true,
      confidential: true,
      example: true,
      summary: "Server-side C# plugins and workflows that enforce business rules inside the Dataverse pipeline.",
      overview:
        "Business rules that cannot be expressed with declarative configuration alone are implemented as Dataverse plugins, registered on the right pipeline events.",
      problem:
        "Some validation and calculation rules had to run reliably regardless of which app or integration wrote the data.",
      solution:
        "Plugins are kept small and single-purpose, registered on the appropriate stage (PreValidation, PreOperation or PostOperation), and paired with workflows for work that can run asynchronously.",
      contribution: "Edit: list the plugins or workflows you designed, built or maintained.",
      challenges: [
        "Choosing the correct pipeline stage so that rules run once and at the right time.",
        "Avoiding recursive updates and keeping execution time low.",
      ],
      tech: ["C#", "Dataverse plugins", "Power Automate", "Dynamics 365"],
      testing: "Edit: unit testing approach and troubleshooting steps (plugin trace logs, pipeline inspection).",
      repo: "",
      demo: "",
      image: null,
    },
    {
      id: "rest-api-auth",
      title: "REST API Integrations & Authentication Flows",
      category: "Backend & APIs",
      icon: "fa-solid fa-plug",
      featured: true,
      confidential: true,
      example: true,
      summary: "ASP.NET Core and REST integrations between business systems, including token-based authentication.",
      overview:
        "Business systems exchange data through REST APIs. The work covered designing endpoints, handling authentication and making integrations observable and debuggable.",
      problem:
        "Integrations were fragile: unclear error contracts, inconsistent authentication handling and little visibility when calls failed.",
      solution:
        "Clear request and response contracts, token-based authentication, consistent error responses, and logging around each external call.",
      contribution: "Edit: the endpoints, integrations or authentication flows you worked on.",
      challenges: ["Handling token expiry and retries safely.", "Testing integrations without touching production data."],
      tech: ["ASP.NET Core", "C#", "REST APIs", "Postman", "SQL Server"],
      testing: "Edit: Postman collections, unit tests and troubleshooting approach.",
      repo: "",
      demo: "",
      image: null,
    },
    {
      id: "conflict-resolution-app",
      title: "Conflict Resolution Application",
      category: "Power Platform",
      icon: "fa-solid fa-scale-balanced",
      featured: false,
      confidential: true,
      example: true,
      summary: "A business application that tracks conflict-resolution cases through a defined, auditable workflow.",
      overview: "A Power Platform application for logging, assigning and tracking cases through defined stages.",
      problem: "Cases were tracked across spreadsheets and emails, which made ownership and status hard to see.",
      solution: "A structured data model with approval and notification flows built with Power Apps and Power Automate.",
      contribution: "Edit: the parts of the data model, app screens or flows you were responsible for.",
      challenges: ["Designing a data model that matches the real process.", "Keeping approvals auditable."],
      tech: ["Power Apps", "Power Automate", "Dataverse"],
      testing: "",
      repo: "",
      demo: "",
      image: null,
    },
    {
      id: "contract-submission-app",
      title: "Contract Submission Application",
      category: "Power Platform",
      icon: "fa-solid fa-file-signature",
      featured: false,
      confidential: true,
      example: true,
      summary: "A submission and review application for contracts, with structured data capture and status tracking.",
      overview: "A Power Platform solution where contract submissions are captured in structured forms and routed for review.",
      problem: "Submissions arrived in inconsistent formats, which slowed review and made follow-up difficult.",
      solution: "Structured forms with validation, plus automated routing and notifications.",
      contribution: "Edit: your specific contribution to the forms, validation or automation.",
      challenges: ["Validating inputs consistently across submissions.", "Routing reviews without manual handoffs."],
      tech: ["Power Apps", "Power Automate", "SharePoint", "Dataverse"],
      testing: "",
      repo: "",
      demo: "",
      image: null,
    },
    {
      id: "higher-ed-integrations",
      title: "Higher-Education Integrations & Payment Workflows",
      category: "Backend & APIs",
      icon: "fa-solid fa-graduation-cap",
      featured: false,
      confidential: true,
      example: true,
      summary: "Backend integrations and payment-related workflows for higher-education processes.",
      overview: "Integrations that connect student and administrative processes with payment-related workflows.",
      problem: "Payment and status information lived in separate systems, which required manual reconciliation.",
      solution: "API-based integrations with clear status handling and error reporting.",
      contribution: "Edit: the integration, workflow or data work you were responsible for.",
      challenges: ["Keeping status consistent across systems.", "Handling partial failures safely."],
      tech: ["ASP.NET Core", "C#", "REST APIs", "SQL Server"],
      testing: "",
      repo: "",
      demo: "",
      image: null,
    },
    {
      id: "portfolio-site",
      title: "Personal Portfolio Website",
      category: "Personal Projects",
      icon: "fa-solid fa-id-card",
      featured: false,
      confidential: false,
      example: false,
      summary: "This site: a static, framework-free portfolio built with HTML, CSS, vanilla JavaScript and Bootstrap.",
      overview:
        "A static portfolio with configurable content, a light and dark theme, accessible project details, and a contact form that works without a backend.",
      problem: "A single place to present verified work and make it easy for recruiters and clients to get in touch.",
      solution:
        "All content lives in config.js. Rendering is handled in script.js, and the site deploys to any static host.",
      contribution: "Designed and built end to end.",
      challenges: ["Keeping the contact form honest without a server.", "Making every interactive element keyboard-accessible."],
      tech: ["HTML5", "CSS3", "JavaScript (ES6+)", "Bootstrap 5"],
      testing: "",
      repo: "", // e.g. "https://github.com/YOUR-USERNAME/portfolio"
      demo: "", // e.g. "https://your-domain.example/"
      image: null,
    },
  ],

  /* ---------- Certifications (omit any field you cannot verify) ---------- */
  certifications: [
    {
      name: "Microsoft Power Platform Functional Consultant Associate (PL-200)",
      issuer: "Microsoft",
      issued: "2025-07", // e.g. "2025-03"
      expires: "2027-07",
      credentialId: "46DA9D126CA59A06",
      verifyUrl: "https://learn.microsoft.com/api/credentials/share/en-us/FaresGomaa/46DA9D126CA59A06?sharingId=46A27AEF0643946A", // Public verification URL, if available
      badge: "assets/certs/pl-200.png", // e.g. "assets/certs/pl-200.png"
    },
  ],

  /* ---------- Education ---------- */
  education: [
    {
      institution: "Cairo University",
      program: "Postgraduate Diploma in Computer Science",
      start: "2025",
      end: "2027",
      status: "in-progress", // "in-progress" | "completed"
      details: "Ongoing postgraduate studies in computer science.",
    },
    {
      institution: "Fayoum University",
      program: "Bachelor's degree in Engineering",
      start: "2018",
      end: "2022",
      status: "completed",
      details: "",
    },
  ],

  /* ---------- Services ---------- */
  services: [
    { title: "ASP.NET Core Backend Development", icon: "fa-solid fa-server", text: "Backend services and business logic in C#, ASP.NET Core, Entity Framework Core and LINQ.", inquiry: "Freelance project" },
    { title: "REST API Development & Integration", icon: "fa-solid fa-plug", text: "REST endpoints and integrations with external systems, including authentication flows.", inquiry: "Freelance project" },
    { title: "Dynamics 365 Customization", icon: "fa-solid fa-building", text: "Customizing Dynamics 365 Customer Engagement with Dataverse tables, business rules and model-driven apps.", inquiry: "Freelance project" },
    { title: "Dataverse Plugins & Automation", icon: "fa-solid fa-gears", text: "Server-side plugins and workflow automation that enforce business rules in Dataverse.", inquiry: "Freelance project" },
    { title: "Power Apps & Power Automate", icon: "fa-solid fa-bolt", text: "Canvas and model-driven apps plus cloud flows for approvals, notifications and data handoffs.", inquiry: "Freelance project" },
    { title: "SQL Server Data Modeling", icon: "fa-solid fa-database", text: "Relational schema design, query writing and performance review for SQL Server.", inquiry: "Collaboration" },
    { title: "Bug Fixing & Maintenance", icon: "fa-solid fa-screwdriver-wrench", text: "Debugging, refactoring and stabilizing existing applications.", inquiry: "Freelance project" },
    { title: "Frontend Development", icon: "fa-solid fa-code", text: "Responsive interfaces with HTML, CSS, JavaScript, Bootstrap and Angular.", inquiry: "Freelance project" },
  ],

  /* ---------- Development process ---------- */
  process: [
    { title: "Understand the business requirements", icon: "fa-solid fa-comments", text: "Start with the process, the people involved and the outcome they need." },
    { title: "Analyze the technical constraints", icon: "fa-solid fa-magnifying-glass-chart", text: "Check existing systems, data, integrations, licensing and security boundaries." },
    { title: "Design the solution and data model", icon: "fa-solid fa-diagram-project", text: "Model the data and rules first, then choose the components that implement them." },
    { title: "Implement maintainable code", icon: "fa-solid fa-code-branch", text: "Keep modules small, names clear and business rules in one place." },
    { title: "Test and debug", icon: "fa-solid fa-bug-slash", text: "Use unit tests, API collections and traces to verify behavior and find root causes." },
    { title: "Deploy or hand over", icon: "fa-solid fa-rocket", text: "Release carefully and document what the next person needs to operate the system." },
    { title: "Maintain and improve", icon: "fa-solid fa-arrows-rotate", text: "Use feedback and monitoring to improve the solution over time." },
  ],

  /* ---------- Technical insights (sample entries: customizable starting points, not published articles) ---------- */
  articles: [
    {
      id: "aspnet-di",
      title: "Keeping ASP.NET Core Services Testable with Dependency Injection",
      date: "2026-01-15",
      category: "C# & ASP.NET Core",
      readingMinutes: 6,
      summary: "How constructor injection and small interfaces make ASP.NET Core services easier to test and change.",
      url: "",
      sample: true,
    },
    {
      id: "dataverse-stages",
      title: "Dataverse Plugin Basics: Pipeline Stages and Execution Context",
      date: "2026-02-10",
      category: "Dynamics 365 & Dataverse",
      readingMinutes: 8,
      summary: "A practical look at where plugins run in the pipeline and how to choose a stage for each rule.",
      url: "",
      sample: true,
    },
    {
      id: "flow-maintainability",
      title: "Designing Power Automate Flows That Are Easy to Maintain",
      date: "2026-03-05",
      category: "Power Platform",
      readingMinutes: 5,
      summary: "Naming, error handling and environment variables that keep cloud flows understandable after handover.",
      url: "",
      sample: true,
    },
    {
      id: "sql-plans",
      title: "Reading SQL Server Execution Plans to Find Real Bottlenecks",
      date: "2026-04-02",
      category: "SQL Server",
      readingMinutes: 9,
      summary: "Which plan operators to check first, and how to confirm an index change actually helped.",
      url: "",
      sample: true,
    },
    {
      id: "js-fetch-timeouts",
      title: "Calling REST APIs from the Browser Safely: Timeouts, Errors and AbortController",
      date: "2026-05-12",
      category: "JavaScript & Browser APIs",
      readingMinutes: 6,
      summary: "Handling slow responses, failed requests and cancellation in browser-side API calls.",
      url: "",
      sample: true,
    },
  ],

  /* ---------- GitHub (optional). Live stars/languages appear only when a real username is set. ---------- */
  github: {
    username: "YOUR-USERNAME",
    // Optional curated repository names. Leave empty to show the most-starred public repositories.
    repos: [],
    maxRepos: 6,
  },

  /* ---------- Feature flags ---------- */
  features: {
    projectsPageSize: 6,
    githubCacheMinutes: 30,
    jsonLd: true, // Person structured data (included only when name and title are set)
  },

  /* Privacy-friendly analytics placeholder. Disabled by default: nothing loads unless enabled and configured. */
  analytics: {
    enabled: false,
    scriptUrl: "https://your-analytics.example/script.js",
    websiteId: "YOUR-WEBSITE-ID",
  },
};
