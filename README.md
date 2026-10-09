# Fares Gomaa — Portfolio

A static, framework-free portfolio for a software engineer working on backend systems and Microsoft Dynamics 365 / Power Platform solutions.

It runs by opening `index.html` directly in a browser. There is no server, no npm, and no build step.

---

## Contents

```
fares-portfolio/
├── index.html    Semantic structure and all sections
├── styles.css    Design tokens, layout, components, light/dark themes, print styles
├── script.js     Rendering, interactions, validation and optional integrations
├── config.js     ALL personal content: details, links, skills, projects, experience, etc.
├── README.md     This file
└── assets/
    ├── favicon.svg          FG monogram favicon
    └── Fares-Gomaa-CV.pdf   ← add your CV here (not included)
```

---

## Quick start

1. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari). Double-clicking the file is enough.
2. Edit `config.js` to match your details (see *Customization* below).
3. Add your CV at `assets/Fares-Gomaa-CV.pdf`, or change `person.cvPath`.
4. Set your real email in `person.email`. The contact form stays disabled until you do.

The page uses CDN assets (Bootstrap, Font Awesome, Google Fonts). An internet connection is needed the first time, and the browser caches them afterwards.

---

## Features

| Area | What it does |
| --- | --- |
| Theme | Dark by default, full light theme, follows the system preference until the visitor chooses. The choice is saved in `localStorage`. |
| Navigation | Sticky header with a scrolled state, active-section tracking (IntersectionObserver), smooth scrolling, accessible mobile menu (Esc closes it and returns focus to the toggle). |
| Command palette | `Ctrl+K` / `Cmd+K` opens quick navigation for sections and actions (theme, CV, print, copy URL). Arrow keys and Enter work, and Esc closes it. |
| Hero | Availability badge (configurable), rotating typed titles (off with reduced motion), CV download, social links. |
| Skills | Category filters, debounced search, descriptions for key technologies, JSON export generated from `config.js`. No proficiency percentages. |
| Experience | Timeline built from config. Linked project buttons open the matching project details. |
| Projects | Filter by category, debounced search, sort, "Show more" pagination, accessible `<dialog>` details with focus restoration, copy-link (also deep-linkable as `#project=id`), a 404-style message for unknown IDs, and an empty state. Confidential work is labeled. |
| Certifications / Education | Config-driven cards. Postgraduate study is shown as *In progress*. Missing fields are omitted, not faked. |
| Services / Process | Config-driven. Service "Discuss" links pre-select the inquiry type in the contact form. |
| Insights | Sample entries with category filters and search. They are labeled as a starting point, not published articles. Read-more links appear only when a URL is configured. |
| GitHub (optional) | Shows curated repositories without any API call. With a username set, it loads public repos from the GitHub REST API with a timeout, caching (sessionStorage), and graceful handling of rate limits and network errors. Stars and languages come only from GitHub. |
| Contact | Validation with per-field errors and `aria-invalid`, character counter, "Prepare email" opens your email client with a pre-filled message, "Copy message", copy-email button, privacy notice. No data is sent to any server. |
| Print CV | "Print CV" builds a clean printable CV from config. |
| SEO | Title, meta description, canonical placeholder, Open Graph and Twitter tags, theme-color, JSON-LD `Person` (only when name and title are set). |
| Privacy | Analytics placeholder, disabled by default. |
| Motion | IntersectionObserver reveal animations. Everything respects `prefers-reduced-motion`. |

---

## Customization

All personal content lives in **`config.js`**. Edit it in any text editor. You should not need to touch `script.js` or `index.html` for content changes.

### Personal details and availability
- `person.name`, `person.initials`, `person.title`, `person.location`, `person.bio`, `person.tagline`.
- `person.typedTitles`: the rotating titles in the hero.
- `person.email`: **set this before publishing.** While it is a placeholder, the contact form is disabled and a notice appears.
- `person.cvPath`: path to the CV file.
- `availability.status` (`"available"`, `"limited"` or `"unavailable"`) and `availability.text`.
- `announcement`: set `enabled: true` to show a dismissible banner. Change `id` to show it again after someone dismisses it.

### Links
- `links`: GitHub, LinkedIn and email. **Entries with placeholder URLs (containing `YOUR-`) are hidden automatically**, so nothing broken is shown.

### Skills
- `skills`: an array of categories, each with `id`, `label` and `items`. Add `desc` to an item to show a short description.

### Experience
- `experience`: newest first. Dates use `YYYY-MM`. Set `end: null` for a current role.
- `accomplishments`: leave empty unless you can verify each one.
- `projectIds`: links to entries in `projects`.

### Projects
- `projects`: each record supports the fields in the file's comments. Use `confidential: true` for client or enterprise work. Use `example: true` while content is still a draft; it shows an *Example entry* badge.
- `repo` and `demo`: leave as `""` when unavailable. The buttons are hidden.
- `image`: optional `{ src, alt, width, height, caption }`. Missing images are removed without breaking the layout.
- To add a project, copy an existing object and give it a unique `id`.

### Certifications, education, services, process
- Add an object to `certifications`, `education`, `services` or `process`. Leave fields empty to omit them.

### Insights and GitHub
- `articles`: sample entries. Replace them with your own, set `sample: false`, and add a `url` when you have one.
- `github.username`: your GitHub username. Leave the placeholder to use curated data only.
- `github.repos`: optional list of repository names to show, in order. Leave empty to show the most-starred public repos.

### Features and analytics
- `features.projectsPageSize`: projects per page (default 6).
- `features.githubCacheMinutes`: how long live GitHub data is cached.
- `features.jsonLd`: switch the JSON-LD block on or off.
- `analytics`: set `enabled: true` and fill in `scriptUrl` and `websiteId` to load a privacy-friendly analytics script. Nothing loads by default.

### Placeholder detection
Values containing `YOUR-`, `your.email@example.com` or `your-domain.example` are treated as placeholders. Links with placeholder URLs are hidden. Entries that depend on a real email (the form, copy-email) stay disabled until a real address is set.

---

## Changing colors, typography and spacing

Design tokens are CSS variables at the top of **`styles.css`**:

- `:root` holds the dark theme (default). `:root[data-theme="light"]` holds the light theme.
- Colors: `--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-2`, `--gradient`, and the status colors.
- Type: `--font-sans` and `--font-mono`. To change fonts, edit the Google Fonts `<link>` in `index.html` and update these variables.
- Shape and spacing: `--radius-sm`, `--radius`, `--radius-lg`, `--space-section`, `--nav-h`.
- Motion: `--transition`.

---

## Adding your CV

1. Export your CV as PDF.
2. Save it as `assets/Fares-Gomaa-CV.pdf`, or set `person.cvPath` to the new path.
3. Every "Download CV" button uses this path. Buttons are hidden if `cvPath` is empty.

---

## Connecting a real contact form later

The form currently builds a `mailto:` link. To send messages through a service:

1. Choose a form service (for example Formspree, Netlify Forms, or your own endpoint).
2. In `script.js`, find `form.addEventListener("submit", …)` inside `initContact()`.
3. Replace the `window.location.href = buildMailto(...)` line with a `fetch` POST to your endpoint. Only show the success message after the response is OK.
4. Never put API secrets in client-side code. Use the service's public form endpoint, or a server you control.

---

## Accessibility notes

- One `<h1>`, a logical heading order, landmarks (`header`, `nav`, `main`, `section[aria-label]`, `footer`).
- Skip link, visible focus styles, keyboard support across menus, filters, the palette and dialogs.
- Projects use native `<dialog>` with `showModal()`, which traps focus and returns it to the opener on close.
- Status messages (copy, filters, form state) use `aria-live` regions.
- External links open in a new tab and say so to screen readers.
- Works at 200% zoom and at widths from 320px upwards. Motion is reduced for `prefers-reduced-motion`.

---

## Browser support

Current versions of Chrome, Edge, Firefox and Safari. Older browsers receive the content without the enhancements. The page does not depend on JavaScript for its main content, though the rendered sections are built by `script.js`.

---

## Deployment

The site is static, so any static host works.

### GitHub Pages
1. Create a repository, for example `portfolio`, and push these files to the root of the default branch.
2. Go to **Settings → Pages**, choose *Deploy from a branch*, select the default branch and `/ (root)`, then save.
3. Your site is available at `https://YOUR-USERNAME.github.io/portfolio/`.

### Netlify
1. Drag the `fares-portfolio` folder into the Netlify dashboard (*Add new site → Deploy manually*), or connect the repository.
2. No build command is needed. Set the publish directory to the folder root.

### Cloudflare Pages
1. Create a project and connect the repository, or upload the folder with Direct Upload.
2. Leave the build command empty and set the output directory to `/`.

### Custom domain
Add the domain in your host's settings and point DNS as instructed. Then update these placeholders to the real URL:
- `<link rel="canonical">`, `og:url` and `og:image` in `index.html`
- `siteUrl` in `config.js`

Create `assets/og-image.png` (1200×630) so social previews work.

### Before publishing checklist
- [ ] `person.email` is a real address.
- [ ] Links with placeholder URLs are replaced or intentionally removed.
- [ ] `assets/Fares-Gomaa-CV.pdf` is in place.
- [ ] Every entry with `example: true` has been verified and edited, and the flag is removed.
- [ ] Certifications include only verified issue dates, IDs and verification URLs.
- [ ] Canonical URL, Open Graph URL and image point to the real domain.
- [ ] Insights entries are real articles, or the section is hidden (`#insights` in `index.html`).

---

## Dependencies (all via CDN)

| Library | Version | Purpose |
| --- | --- | --- |
| Bootstrap | 5.3.3 | Grid, base components (CSS only; no Bootstrap JS needed) |
| Font Awesome Free | 6.5.2 | Icons |
| Google Fonts (Inter, JetBrains Mono) | Current | Typography |

No JavaScript libraries are loaded. The site uses vanilla ES6+.

Optional: to add a syntax-highlighting library for code snippets, load Prism from `cdnjs.cloudflare.com` with `defer` in `index.html`. It is not included by default.

### Subresource integrity (optional)
For extra safety, add `integrity` and `crossorigin="anonymous"` attributes to the CDN `<link>` tags, using hashes you generate for the exact versions you use. The site works without them.

---

## Project structure notes

- `config.js` holds data only. It defines `window.PORTFOLIO_CONFIG`.
- `script.js` is one IIFE with small, named functions (`initTheme`, `renderSkills`, `renderProjects`, `openProject`, `initContact`, `initGitHub`, `initCommandPalette`, and so on). Each init step runs inside `run()`, so an error in one feature does not stop the rest.
- User-supplied text is always inserted with `textContent` or DOM APIs. No `innerHTML` is used for content, and no `eval`.
- Print CV is generated from config into `#print-cv`, which is only visible when printing.

---

## Licence and content

Replace the sample content with your own before publishing. Don't present sample or example entries as your work. Remove `example: true` only after verification.
