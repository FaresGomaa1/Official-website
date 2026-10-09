/* script.js — rendering, interactions and optional integrations.
 * Loaded after config.js. Untrusted or configurable text is always inserted with
 * textContent (never innerHTML), so config values cannot inject markup.
 */
(function () {
  "use strict";

  const CFG = window.PORTFOLIO_CONFIG || {};
  const PERSON = CFG.person || {};
  const FEATURES = CFG.features || {};
  const PAGE_SIZE = FEATURES.projectsPageSize || 6;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  const PLACEHOLDER_RE = /YOUR-|your\.email@example\.com|your-domain\.example/i;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const THEME_KEY = "fg-theme";
  const ANNOUNCE_KEY = "fg-announce-dismissed";
  const MESSAGE_MAX = 1000;

  /* ---------- Generic helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const isPlaceholder = (value) => !value || PLACEHOLDER_RE.test(String(value));
  const usableUrl = (value) => (isPlaceholder(value) ? "" : String(value));
  const isHttp = (url) => /^https?:\/\//i.test(url);
  const externalAttrs = (url) => (isHttp(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});
  const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const currentBase = () => window.location.href.split("#")[0];

  function debounce(fn, wait = 200) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }
  function sessionGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function sessionSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }

  /** Small DOM builder. Strings become text nodes; `text` and `on*` props are handled safely. */
  function make(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    [].concat(children).forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  const icon = (cls) => make("i", { class: cls, "aria-hidden": "true" });
  const srOnly = (text) => make("span", { class: "visually-hidden", text });
  const newTabNote = () => srOnly(" (opens in a new tab)");

  function formatDate(value) {
    const s = String(value || "");
    if (/^\d{4}$/.test(s)) return s;
    const [y, m, d] = s.split("-").map(Number);
    if (!y) return s;
    const date = new Date(y, (m || 1) - 1, d || 1);
    const options = d
      ? { month: "short", day: "numeric", year: "numeric" }
      : { month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }
  const timeEl = (value) => make("time", { datetime: value, text: formatDate(value) });

  /** Polite screen-reader announcement. */
  function announce(message) {
    const region = $("#sr-status");
    if (!region) return;
    region.textContent = "";
    window.setTimeout(() => { region.textContent = message; }, 50);
  }

  /** Temporarily changes a button label (the [data-label] span, or the button itself). */
  function flash(button, message) {
    const label = button.querySelector("[data-label]") || button;
    if (!label.dataset.original) label.dataset.original = label.textContent;
    label.textContent = message;
    clearTimeout(button._flashTimer);
    button._flashTimer = setTimeout(() => { label.textContent = label.dataset.original; }, 2200);
    announce(message);
  }

  /** Clipboard with a textarea fallback for older or non-secure contexts. */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through to legacy copy */ }
    const area = make("textarea", { readonly: true, "aria-hidden": "true", style: "position:fixed;top:-1000px;left:-1000px;opacity:0" });
    area.value = text;
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }

  /** Chip-style single-select filter. Buttons are created once so focus is never lost. */
  function chipFilter(container, options, onSelect) {
    let current = options[0].id;
    const buttons = options.map((option) =>
      make("button", {
        type: "button",
        class: "chip",
        "aria-pressed": "false",
        text: option.label,
        dataset: { id: option.id },
        onclick: () => { current = option.id; sync(); onSelect(current); },
      })
    );
    container.replaceChildren(...buttons);
    function sync() {
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === current)));
    }
    sync();
    return {
      get value() { return current; },
      reset() { current = options[0].id; sync(); },
    };
  }

  /** Runs one init step so a failure elsewhere cannot break the rest of the page. */
  function run(fn) {
    try {
      const result = fn();
      if (result && typeof result.catch === "function") result.catch((err) => console.warn(`[portfolio] ${fn.name} failed`, err));
    } catch (err) {
      console.warn(`[portfolio] ${fn.name} failed`, err);
    }
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.setAttribute("data-bs-theme", theme);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b1020" : "#f6f8fc");
    const toggle = $("#theme-toggle");
    if (toggle) {
      const next = theme === "dark" ? "light" : "dark";
      toggle.setAttribute("aria-label", `Switch to ${next} theme`);
      toggle.title = `Switch to ${next} theme`;
      const glyph = toggle.querySelector("i");
      if (glyph) glyph.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }

  function initTheme() {
    const systemLight = window.matchMedia("(prefers-color-scheme: light)");
    applyTheme(storageGet(THEME_KEY) || (systemLight.matches ? "light" : "dark"));

    const toggle = $("#theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        storageSet(THEME_KEY, next);
        applyTheme(next);
        announce(`${next === "dark" ? "Dark" : "Light"} theme on`);
      });
    }

    // Follow the system preference until the visitor makes an explicit choice.
    if (systemLight.addEventListener) {
      systemLight.addEventListener("change", (event) => {
        if (!storageGet(THEME_KEY)) applyTheme(event.matches ? "light" : "dark");
      });
    }
  }

  /* ---------- Personal data binding ---------- */
  function bindPersonalData() {
    $$("[data-bind]").forEach((node) => {
      const value = PERSON[node.dataset.bind];
      if (value) node.textContent = value;
      else node.hidden = true;
    });
    // Rows that should disappear entirely when their value is empty.
    $$("[data-optional]").forEach((row) => {
      row.hidden = !PERSON[row.dataset.optional];
    });

    const email = usableUrl(PERSON.email);
    $$("[data-bind-email]").forEach((node) => {
      if (email) {
        node.setAttribute("href", `mailto:${email}`);
        node.textContent = email;
        node.hidden = false;
      } else {
        node.hidden = true;
      }
    });

    $$("[data-cv]").forEach((node) => {
      if (PERSON.cvPath) node.setAttribute("href", PERSON.cvPath);
      else node.hidden = true;
    });

    const availability = CFG.availability || {};
    const avText = $("#availability-text");
    const avWrap = $("#availability");
    if (avText && availability.text) avText.textContent = availability.text;
    if (avWrap) avWrap.dataset.status = availability.status || "available";
  }

  function socialLinks(variant) {
    return (CFG.links || [])
      .filter((link) => usableUrl(link.url))
      .map((link) => {
        const label = link.label;
        const text = variant === "text";
        return make("a", {
          class: `social-link${text ? " social-link--text" : ""}`,
          href: link.url,
          ...externalAttrs(link.url),
          title: label,
          "aria-label": isHttp(link.url) ? `${label} (opens in a new tab)` : label,
        }, [icon(link.icon), text ? make("span", { text: label }) : null]);
      });
  }

  function renderSocialLinks() {
    $$("[data-social]").forEach((container) => {
      container.replaceChildren(...socialLinks(container.dataset.social === "text" ? "text" : "icon"));
    });
  }

  function renderHero() {
    const stack = $("#hero-stack");
    if (stack) stack.replaceChildren(...(CFG.heroStack || []).map((t) => make("li", { class: "tag", text: t })));
  }

  function renderHighlights() {
    const grid = $("#highlights-grid");
    if (!grid) return;
    const items = (CFG.highlights || []).filter((h) => h.value && h.label);
    grid.replaceChildren(...items.map((h) =>
      make("li", { class: "reveal" }, [make("strong", { text: h.value }), make("span", { text: h.label })])
    ));
  }

  function renderAbout() {
    const paragraphs = $("#about-paragraphs");
    if (paragraphs) paragraphs.replaceChildren(...(CFG.about || []).map((p) => make("p", { text: p })));

    const values = $("#values-list");
    if (values) {
      values.replaceChildren(...(CFG.values || []).map((v) =>
        make("li", {}, [icon("fa-solid fa-circle-check"), make("span", { text: v })])
      ));
    }

    const team = $("#team-grid");
    if (team) {
      team.replaceChildren(...(CFG.team || []).map((t) =>
        make("div", { class: "col-md-4" }, [
          make("div", { class: "team-card" }, [make("h4", { text: t.title }), make("p", { text: t.text })]),
        ])
      ));
    }
  }

  /* ---------- Skills ---------- */
  const skillState = { category: "all", query: "" };

  function renderSkills() {
    const groups = CFG.skills || [];
    const filters = $("#skill-filters");
    const grid = $("#skills-grid");
    const search = $("#skill-search");
    const count = $("#skill-count");
    if (!grid || !filters) return;

    const draw = () => {
      const query = skillState.query.trim().toLowerCase();
      const matches = [];
      groups.forEach((group) => {
        if (skillState.category !== "all" && group.id !== skillState.category) return;
        group.items.forEach((item) => {
          const haystack = `${item.name} ${item.desc || ""} ${group.label}`.toLowerCase();
          if (!query || haystack.includes(query)) matches.push({ item, group: group.label });
        });
      });

      if (!matches.length) {
        grid.replaceChildren(make("div", { class: "col-12" }, [
          make("div", { class: "empty-state", role: "status" }, [
            make("p", { text: `No skills match “${skillState.query.trim()}”.` }),
            make("button", {
              type: "button", class: "btn-ghost btn-sm", text: "Clear search",
              onclick: () => { skillState.query = ""; search.value = ""; skillState.category = "all"; filterCtl.reset(); draw(); search.focus(); },
            }),
          ]),
        ]));
      } else {
        grid.replaceChildren(...matches.map(({ item, group }) =>
          make("div", { class: "col-sm-6 col-lg-4 col-xl-3" }, [
            make("article", { class: "skill-card" }, [
              make("span", { class: "skill-cat", text: group }),
              make("h3", { text: item.name }),
              item.desc ? make("p", { text: item.desc }) : null,
            ]),
          ])
        ));
      }
      count.textContent = `Showing ${matches.length} skill${matches.length === 1 ? "" : "s"}`;
    };

    const filterCtl = chipFilter(
      filters,
      [{ id: "all", label: "All" }, ...groups.map((g) => ({ id: g.id, label: g.label }))],
      (id) => { skillState.category = id; draw(); }
    );

    search.addEventListener("input", debounce(() => { skillState.query = search.value; draw(); }, 200));
    draw();
  }

  function downloadSkillsJson() {
    const payload = {
      name: PERSON.name,
      title: PERSON.title,
      categories: (CFG.skills || []).map((group) => ({
        category: group.label,
        skills: group.items.map((item) => ({ name: item.name, description: item.desc || undefined })),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = make("a", { href: url, download: `${slugify(PERSON.name) || "portfolio"}-skills.json` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce("Skills file downloaded");
  }

  /* ---------- Experience and education ---------- */
  function renderExperience() {
    const list = $("#experience-timeline");
    if (!list) return;
    const projects = CFG.projects || [];

    list.replaceChildren(...(CFG.experience || []).map((job) => {
      const range = [timeEl(job.start), " – ", job.end ? timeEl(job.end) : "Present"];
      const projectButtons = (job.projectIds || [])
        .map((id) => projects.find((p) => p.id === id))
        .filter(Boolean)
        .map((p) => make("button", {
          type: "button", class: "btn-ghost btn-sm", "aria-haspopup": "dialog",
          onclick: (event) => openProject(p.id, event.currentTarget),
        }, [icon("fa-solid fa-folder-open"), make("span", { text: ` ${p.title}` })]));

      return make("li", { class: "timeline-item reveal" }, [
        make("article", { class: "timeline-card" }, [
          make("header", { class: "timeline-card__head" }, [
            make("h3", { text: job.title }),
            make("p", { class: "timeline-card__company", text: job.location ? `${job.company} · ${job.location}` : job.company }),
            make("p", { class: "timeline-card__dates small" }, [icon("fa-regular fa-calendar"), " ", ...range]),
          ]),
          make("h4", { text: "Key responsibilities" }),
          make("ul", {}, (job.responsibilities || []).map((r) => make("li", { text: r }))),
          ...(job.accomplishments && job.accomplishments.length
            ? [make("h4", { text: "Major accomplishments" }), make("ul", {}, job.accomplishments.map((a) => make("li", { text: a })))]
            : []),
          make("h4", { text: "Technologies" }),
          make("ul", { class: "tag-list", "aria-label": "Technologies used" }, (job.technologies || []).map((t) => make("li", { class: "tag", text: t }))),
          projectButtons.length ? make("div", { class: "d-flex flex-wrap gap-2 mt-3" }, projectButtons) : null,
        ]),
      ]);
    }));
  }

  function renderEducation() {
    const list = $("#education-list");
    if (!list) return;
    list.replaceChildren(...(CFG.education || []).map((edu) => {
      const inProgress = edu.status === "in-progress";
      const range = [];
      if (edu.start) range.push(timeEl(edu.start), " – ");
      if (inProgress) range.push("Present");
      else if (edu.end) range.push(timeEl(edu.end));
      return make("li", { class: "timeline-item reveal" }, [
        make("article", { class: "timeline-card" }, [
          make("header", { class: "timeline-card__head" }, [
            make("h3", {}, [
              edu.program,
              make("span", { class: `badge-soft edu-card__status ${inProgress ? "badge-soft--accent" : "badge-soft--ok"}` }, [
                icon(inProgress ? "fa-solid fa-hourglass-half" : "fa-solid fa-circle-check"),
                inProgress ? " In progress" : " Completed",
              ]),
            ]),
            make("p", { class: "timeline-card__company", text: edu.institution }),
            range.length ? make("p", { class: "timeline-card__dates small" }, [icon("fa-regular fa-calendar"), " ", ...range]) : null,
          ]),
          edu.details ? make("p", { class: "mb-0", text: edu.details }) : null,
        ]),
      ]);
    }));
  }

  /* ---------- Certifications, services, process ---------- */
  function renderCertifications() {
    const grid = $("#certs-grid");
    const items = CFG.certifications || [];
    if (!grid) return;
    if (!items.length) {
      const section = $("#certifications");
      if (section) section.hidden = true;
      return;
    }
    grid.replaceChildren(...items.map((cert) => {
      const verify = usableUrl(cert.verifyUrl);
      const rows = [["Issued", cert.issued], ["Expires", cert.expires], ["Credential ID", cert.credentialId]]
        .filter(([, value]) => value);
      return make("div", { class: "col-md-6 col-xl-4 reveal" }, [
        make("article", { class: "cert-card" }, [
          cert.badge
            ? make("img", { class: "cert-card__badge", src: cert.badge, alt: `${cert.name} badge`, width: 64, height: 64, loading: "lazy", onerror: (e) => e.currentTarget.remove() })
            : icon("fa-solid fa-award text-accent mb-3"),
          make("h3", { text: cert.name }),
          cert.issuer ? make("p", { class: "small mb-0", text: `Issued by ${cert.issuer}` }) : null,
          rows.length ? make("dl", {}, rows.flatMap(([k, v]) => [make("dt", { text: k }), make("dd", { text: v })])) : null,
          verify ? externalLink(verify, "Verify credential", "fa-solid fa-circle-check") : null,
        ]),
      ]);
    }));
  }

  function renderServices() {
    const grid = $("#services-grid");
    if (!grid) return;
    grid.replaceChildren(...(CFG.services || []).map((s) =>
      make("div", { class: "col-md-6 col-xl-3 reveal" }, [
        make("article", { class: "service-card" }, [
          make("span", { class: "service-card__icon" }, [icon(s.icon)]),
          make("h3", { text: s.title }),
          make("p", { text: s.text }),
          make("a", {
            class: "link-cta",
            href: "#contact",
            "data-inquiry": s.inquiry || "",
            "aria-label": `Discuss: ${s.title}`,
            text: "Discuss this service →",
          }),
        ]),
      ])
    ));
  }

  function renderProcess() {
    const list = $("#process-list");
    if (!list) return;
    list.replaceChildren(...(CFG.process || []).map((step, i) =>
      make("li", { class: "reveal" }, [
        make("span", { class: "step-num", "aria-hidden": "true", text: String(i + 1) }),
        make("div", {}, [make("h3", { text: step.title }), make("p", { text: step.text })]),
      ])
    ));
  }

  /* ---------- Links and external buttons ---------- */
  function externalLink(url, label, iconClass, extraClass = "btn-ghost btn-sm") {
    return make("a", { class: extraClass, href: url, ...externalAttrs(url) }, [
      icon(iconClass),
      make("span", { text: label }),
      isHttp(url) ? make("i", { class: "fa-solid fa-arrow-up-right-from-square small", "aria-hidden": "true" }) : null,
      isHttp(url) ? newTabNote() : null,
    ]);
  }

  /* ---------- Projects ---------- */
  const projectState = { category: "all", query: "", sort: "featured", shown: PAGE_SIZE };
  let lastTrigger = null;

  function projectBadges(p) {
    const badges = [make("span", { class: "badge-soft badge-soft--accent", text: p.category })];
    badges.push(p.confidential
      ? make("span", { class: "badge-soft badge-soft--warn" }, [icon("fa-solid fa-lock"), " Confidential enterprise work"])
      : make("span", { class: "badge-soft badge-soft--ok" }, [icon("fa-solid fa-globe"), " Public work"]));
    if (p.featured) badges.push(make("span", { class: "badge-soft" }, [icon("fa-solid fa-star"), " Featured"]));
    if (p.example) badges.push(make("span", { class: "badge-soft" }, [icon("fa-solid fa-flask"), " Example entry"]));
    return badges;
  }

  function copyLinkButton(id) {
    return make("button", {
      type: "button", class: "btn-ghost btn-sm",
      onclick: (event) => copyProjectLink(id, event.currentTarget),
    }, [icon("fa-solid fa-link"), make("span", { "data-label": "", text: "Copy link" })]);
  }

  function projectCard(p) {
    const tech = p.tech || [];
    const shownTech = tech.slice(0, 4);
    const extra = tech.length - shownTech.length;
    const repo = usableUrl(p.repo);
    const demo = usableUrl(p.demo);
    const titleId = `project-${p.id}-title`;

    return make("article", { class: "project-card", "aria-labelledby": titleId, dataset: { projectId: p.id } }, [
      make("div", { class: "project-visual", "aria-hidden": "true" }, [icon(p.icon || "fa-solid fa-diagram-project")]),
      make("div", { class: "project-body" }, [
        make("div", { class: "badges" }, projectBadges(p)),
        make("h3", { id: titleId, text: p.title }),
        make("p", { class: "summary", text: p.summary }),
        make("ul", { class: "tag-list mb-2", "aria-label": "Technologies" }, [
          ...shownTech.map((t) => make("li", { class: "tag", text: t })),
          extra > 0 ? make("li", { class: "tag", text: `+${extra} more` }) : null,
        ]),
        make("div", { class: "project-actions" }, [
          make("button", {
            type: "button", class: "btn-accent btn-sm", "aria-haspopup": "dialog",
            onclick: (event) => openProject(p.id, event.currentTarget),
          }, [make("span", { text: "View details" })]),
          repo ? externalLink(repo, "Repository", "fa-brands fa-github") : null,
          demo ? externalLink(demo, "Live demo", "fa-solid fa-display") : null,
          copyLinkButton(p.id),
        ]),
      ]),
    ]);
  }

  function filteredProjects() {
    const query = projectState.query.trim().toLowerCase();
    const sorters = {
      featured: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.title.localeCompare(b.title),
      title: (a, b) => a.title.localeCompare(b.title),
      category: (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title),
    };
    return (CFG.projects || [])
      .filter((p) => projectState.category === "all" || p.category === projectState.category)
      .filter((p) => {
        if (!query) return true;
        const haystack = [p.title, p.summary, p.category, ...(p.tech || [])].join(" ").toLowerCase();
        return haystack.includes(query);
      })
      .sort(sorters[projectState.sort] || sorters.featured);
  }

  function renderProjects() {
    const grid = $("#projects-grid");
    const count = $("#projects-count");
    const more = $("#projects-more");
    if (!grid) return;

    const all = filteredProjects();
    const shown = all.slice(0, projectState.shown);

    if (!all.length) {
      grid.replaceChildren(make("div", { class: "col-12" }, [
        make("div", { class: "empty-state", role: "status" }, [
          make("p", { text: "No projects match these filters." }),
          make("button", { type: "button", class: "btn-ghost btn-sm", text: "Clear filters", onclick: resetProjectFilters }),
        ]),
      ]));
      count.textContent = "No projects to show";
    } else {
      grid.replaceChildren(...shown.map((p) => make("div", { class: "col-md-6 col-xl-4" }, [projectCard(p)])));
      count.textContent = `Showing ${shown.length} of ${all.length} project${all.length === 1 ? "" : "s"}`;
    }

    const remaining = all.length - shown.length;
    more.hidden = remaining <= 0;
    if (remaining > 0) more.textContent = `Show more projects (${remaining} remaining)`;
  }

  function resetProjectFilters() {
    projectState.category = "all";
    projectState.query = "";
    projectState.sort = "featured";
    projectState.shown = PAGE_SIZE;
    $("#project-filter").value = "all";
    $("#project-search").value = "";
    $("#project-sort").value = "featured";
    renderProjects();
    $("#project-search").focus();
  }

  function initProjects() {
    const grid = $("#projects-grid");
    if (!grid) return;
    const select = $("#project-filter");
    const categories = [...new Set((CFG.projects || []).map((p) => p.category))];
    select.replaceChildren(
      make("option", { value: "all", text: "All categories" }),
      ...categories.map((c) => make("option", { value: c, text: c }))
    );
    select.addEventListener("change", () => {
      projectState.category = select.value;
      projectState.shown = PAGE_SIZE;
      renderProjects();
    });
    $("#project-sort").addEventListener("change", (event) => {
      projectState.sort = event.target.value;
      renderProjects();
    });
    const search = $("#project-search");
    search.addEventListener("input", debounce(() => {
      projectState.query = search.value;
      projectState.shown = PAGE_SIZE;
      renderProjects();
    }, 200));
    $("#projects-more").addEventListener("click", () => {
      const before = projectState.shown;
      projectState.shown += PAGE_SIZE;
      renderProjects();
      // Keep keyboard focus on the first newly revealed project.
      const next = $$(".project-card", grid)[before];
      if (next) next.querySelector("button")?.focus();
    });
    renderProjects();
  }

  async function copyProjectLink(id, button) {
    const ok = await copyText(`${currentBase()}#project=${encodeURIComponent(id)}`);
    flash(button, ok ? "Link copied" : "Copy not available");
  }

  function renderProjectDetails(project, requestedId) {
    const body = $("#project-modal-body");
    const title = $("#project-modal-title");
    body.replaceChildren();

    if (!project) {
      title.textContent = "Project not found";
      body.append(make("div", { class: "project-404" }, [
        make("p", { text: `No project details exist for “${requestedId}”. The entry may have been removed or the link may be out of date.` }),
        make("button", { type: "button", class: "btn-accent btn-sm", text: "Back to all projects", onclick: () => $("#project-modal").close() }),
      ]));
      return;
    }

    title.textContent = project.title;
    body.append(
      make("div", { class: "badges mb-3" }, projectBadges(project)),
      make("p", { class: "modal-lead", text: project.summary }),
    );
    if (project.confidential) {
      body.append(make("p", { class: "modal-note", text: "Confidential enterprise work: described at a summary level, without client names or implementation specifics." }));
    }

    [
      ["Overview", project.overview],
      ["Business problem", project.problem],
      ["Solution & approach", project.solution],
      ["My contribution", project.contribution],
      ["Constraints", project.constraints],
      ["Testing & troubleshooting", project.testing],
      ["Results & lessons learned", project.results],
    ].forEach(([label, text]) => {
      if (text) body.append(make("section", {}, [make("h3", { text: label }), make("p", { text })]));
    });

    if (project.challenges && project.challenges.length) {
      body.append(make("section", {}, [
        make("h3", { text: "Key technical challenges" }),
        make("ul", {}, project.challenges.map((c) => make("li", { text: c }))),
      ]));
    }

    if (project.tech && project.tech.length) {
      body.append(make("section", {}, [
        make("h3", { text: "Technology stack" }),
        make("ul", { class: "tag-list", "aria-label": "Technology stack" }, project.tech.map((t) => make("li", { class: "tag", text: t }))),
      ]));
    }

    if (project.image && project.image.src) {
      const img = make("img", {
        src: project.image.src,
        alt: project.image.alt || "",
        width: project.image.width,
        height: project.image.height,
        loading: "lazy",
        class: "img-fluid",
      });
      const figure = make("figure", {}, [img, make("figcaption", { text: project.image.caption || "" })]);
      img.addEventListener("error", () => figure.remove());
      body.append(figure);
    }

    const repo = usableUrl(project.repo);
    const demo = usableUrl(project.demo);
    body.append(make("div", { class: "modal-footer" }, [
      repo ? externalLink(repo, "Repository", "fa-brands fa-github") : null,
      demo ? externalLink(demo, "Live demo", "fa-solid fa-display") : null,
      copyLinkButton(project.id),
    ]));
  }

  function openProject(id, trigger) {
    const dialog = $("#project-modal");
    if (!dialog) return;
    if (!dialog.open) lastTrigger = trigger || document.activeElement;
    const project = (CFG.projects || []).find((p) => p.id === id);
    renderProjectDetails(project, id);
    if (!dialog.open) dialog.showModal();
    $("#project-modal-body").scrollTop = 0;
    history.replaceState(null, "", `#project=${encodeURIComponent(id)}`);
    $("#project-modal-close").focus();
  }

  function handleDeepLink() {
    const match = window.location.hash.match(/^#project=(.+)$/);
    if (!match) return;
    let id = match[1];
    try { id = decodeURIComponent(id); } catch (e) { /* keep raw value */ }
    openProject(id, document.body);
  }

  function initProjectModal() {
    const dialog = $("#project-modal");
    if (!dialog) return;
    $("#project-modal-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      if (lastTrigger && typeof lastTrigger.focus === "function" && document.contains(lastTrigger)) lastTrigger.focus();
      history.replaceState(null, "", window.location.pathname + window.location.search);
    });
    window.addEventListener("hashchange", handleDeepLink);
    handleDeepLink();
  }

  /* ---------- Articles ---------- */
  const articleState = { category: "all", query: "" };

  function initArticles() {
    const grid = $("#articles-grid");
    if (!grid) return;
    const articles = CFG.articles || [];
    const count = $("#articles-count");
    const search = $("#article-search");
    if (!articles.length) {
      const section = $("#insights");
      if (section) section.hidden = true;
      return;
    }

    const draw = () => {
      const query = articleState.query.trim().toLowerCase();
      const matches = articles.filter((a) => {
        if (articleState.category !== "all" && a.category !== articleState.category) return false;
        if (!query) return true;
        return `${a.title} ${a.summary} ${a.category}`.toLowerCase().includes(query);
      });

      if (!matches.length) {
        grid.replaceChildren(make("div", { class: "col-12" }, [
          make("div", { class: "empty-state", role: "status" }, [make("p", { text: "No insights match these filters." })]),
        ]));
      } else {
        grid.replaceChildren(...matches.map((a) =>
          make("div", { class: "col-md-6 col-xl-4 reveal" }, [
            make("article", { class: "article-card" }, [
              make("div", { class: "article-card__meta" }, [
                make("span", { class: "badge-soft badge-soft--accent", text: a.category }),
                a.sample ? make("span", { class: "badge-soft", text: "Sample entry" }) : null,
                timeEl(a.date),
                make("span", { text: `${a.readingMinutes} min read` }),
              ]),
              make("h3", { text: a.title }),
              make("p", { text: a.summary }),
              usableUrl(a.url) ? externalLink(a.url, "Read article", "fa-solid fa-book-open") : null,
            ]),
          ])
        ));
      }
      count.textContent = `Showing ${matches.length} of ${articles.length} entries`;
    };

    const categories = [...new Set(articles.map((a) => a.category))];
    chipFilter(
      $("#article-filter"),
      [{ id: "all", label: "All topics" }, ...categories.map((c) => ({ id: c, label: c }))],
      (id) => { articleState.category = id; draw(); }
    );
    search.addEventListener("input", debounce(() => { articleState.query = search.value; draw(); }, 200));
    draw();
  }

  /* ---------- GitHub (optional, graceful fallback) ---------- */
  function repoCard(repo, curated) {
    const url = (repo && repo.html_url) || (curated && curated.url) || "";
    const description = (repo && repo.description) || (curated && curated.description) || "";
    const tags = (curated && curated.tags) || (repo && repo.language ? [repo.language] : []);
    const stars = repo && typeof repo.stargazers_count === "number" ? repo.stargazers_count : null;
    const name = (repo && repo.name) || (curated && curated.name) || "Repository";
    const linkable = usableUrl(url) && isHttp(url);

    return make("div", { class: "col-md-6 col-xl-4 reveal" }, [
      make("article", { class: "repo-card" }, [
        make("h3", {}, [
          linkable
            ? make("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, [name, newTabNote()])
            : name,
        ]),
        description ? make("p", { text: description }) : null,
        tags.length ? make("ul", { class: "tag-list", "aria-label": "Topics" }, tags.map((t) => make("li", { class: "tag", text: t }))) : null,
        make("div", { class: "repo-card__meta" }, [
          repo && repo.language ? make("span", {}, [icon("fa-solid fa-code"), " ", repo.language]) : null,
          stars !== null ? make("span", {}, [icon("fa-regular fa-star"), ` ${stars}`, srOnly(" stars")]) : null,
        ]),
      ]),
    ]);
  }

  function skeletonCard() {
    return make("div", { class: "col-md-6 col-xl-4", "aria-hidden": "true" }, [
      make("div", { class: "repo-card" }, [
        make("span", { class: "skeleton", style: "width:60%" }),
        make("span", { class: "skeleton", style: "width:92%;margin-top:.9rem" }),
        make("span", { class: "skeleton", style: "width:75%;margin-top:.5rem" }),
      ]),
    ]);
  }

  async function fetchRepos(username) {
    const cacheKey = `fg-gh-${username}`;
    const maxAge = (FEATURES.githubCacheMinutes || 30) * 60 * 1000;
    try {
      const cached = JSON.parse(sessionGet(cacheKey) || "null");
      if (cached && Date.now() - cached.t < maxAge) return cached.data;
    } catch (e) { /* ignore corrupt cache */ }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller.signal,
      });
      if (res.status === 403 || res.status === 429) throw Object.assign(new Error("rate"), { kind: "rate" });
      if (!res.ok) throw Object.assign(new Error("http"), { kind: "http" });
      const data = await res.json();
      const slim = data
        .filter((r) => !r.fork && !r.private)
        .map((r) => ({
          name: r.name,
          html_url: r.html_url,
          description: r.description,
          language: r.language,
          stargazers_count: r.stargazers_count,
        }));
      sessionSet(cacheKey, JSON.stringify({ t: Date.now(), data: slim }));
      return slim;
    } finally {
      clearTimeout(timer);
    }
  }

  function renderCuratedRepos(list, status, curated, message) {
    list.replaceChildren(...curated.map((c) => repoCard(null, c)));
    status.textContent = message;
  }

  async function initGitHub() {
    const section = $("#github");
    const list = $("#github-list");
    const status = $("#github-status");
    const profile = $("#github-profile");
    if (!section || !list) return;

    const gh = CFG.github || {};
    const username = usableUrl(gh.username);
    const curated = gh.repos || [];
    if (!username && !curated.length) {
      section.hidden = true;
      return;
    }

    if (username) {
      profile.href = `https://github.com/${encodeURIComponent(username)}`;
      profile.hidden = false;
    }

    if (!username) {
      renderCuratedRepos(list, status, curated, "Repositories curated in config.js. Live stars and languages appear once a GitHub username is configured.");
      return;
    }

    list.replaceChildren(skeletonCard(), skeletonCard(), skeletonCard());
    status.textContent = "Loading public repositories from GitHub…";

    try {
      const repos = await fetchRepos(username);
      const byName = new Map(repos.map((r) => [r.name, r]));
      let picks;
      if (curated.length) {
        picks = curated.map((c) => ({ repo: byName.get(c.name), curated: c })).filter((x) => x.repo);
      } else {
        picks = repos
          .slice()
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, gh.maxRepos || 6)
          .map((repo) => ({ repo, curated: null }));
      }

      if (!picks.length) {
        list.replaceChildren();
        status.textContent = "No matching public repositories found.";
        return;
      }
      list.replaceChildren(...picks.map((p) => repoCard(p.repo, p.curated)));
      status.textContent = `Live data from GitHub: ${picks.length} repositor${picks.length === 1 ? "y" : "ies"} shown.`;
    } catch (err) {
      const message = err && err.kind === "rate"
        ? "GitHub rate limit reached. Showing curated repositories without live stats."
        : "Couldn't load live data from GitHub. Showing curated repositories without live stats.";
      if (curated.length) {
        renderCuratedRepos(list, status, curated, message);
      } else {
        list.replaceChildren(make("div", { class: "col-12" }, [
          make("div", { class: "empty-state" }, [make("p", { text: message })]),
        ]));
        status.textContent = "";
      }
    }
  }

  /* ---------- Contact ---------- */
  function initContact() {
    const form = $("#contact-form");
    if (!form) return;

    const emailReady = !isPlaceholder(PERSON.email);
    const submit = $("#submit-btn");
    const copyEmail = $("#copy-email");
    if (!emailReady) {
      $("#contact-setup-notice").hidden = false;
      submit.disabled = true;
    } else if (copyEmail) {
      copyEmail.hidden = false;
      copyEmail.addEventListener("click", async () => {
        const ok = await copyText(PERSON.email);
        flash(copyEmail, ok ? "Email copied" : "Copy not available");
      });
    }

    const rules = {
      name: (v) => (v.trim() ? "" : "Please enter your name."),
      email: (v) => {
        if (!v.trim()) return "Please enter your email address.";
        return EMAIL_RE.test(v.trim()) ? "" : "Enter a valid email address, such as name@example.com.";
      },
      inquiry: (v) => (v ? "" : "Choose an inquiry type."),
      subject: (v) => (v.trim() ? "" : "Please add a short subject."),
      message: (v) => {
        const n = v.trim().length;
        if (!n) return "Please write a message.";
        if (n < 20) return `Your message is a little short. Add ${20 - n} more character${20 - n === 1 ? "" : "s"}.`;
        if (n > MESSAGE_MAX) return `Please keep your message to ${MESSAGE_MAX} characters or fewer.`;
        return "";
      },
    };
    const names = Object.keys(rules);
    const touched = new Set();

    function validateField(name) {
      const input = form.elements.namedItem(name);
      const error = rules[name](input.value);
      $(`#error-${name}`).textContent = error;
      input.classList.toggle("is-invalid", Boolean(error));
      input.setAttribute("aria-invalid", String(Boolean(error)));
      return error;
    }

    names.forEach((name) => {
      const input = form.elements.namedItem(name);
      input.addEventListener("blur", () => { touched.add(name); validateField(name); });
      const revalidate = () => { if (touched.has(name)) validateField(name); };
      input.addEventListener("input", revalidate);
      input.addEventListener("change", revalidate);
    });

    const messageInput = form.elements.namedItem("message");
    const counter = $("#message-count");
    const updateCount = () => { counter.textContent = `${messageInput.value.length}/${MESSAGE_MAX}`; };
    messageInput.addEventListener("input", updateCount);
    updateCount();

    function setStatus(text, kind) {
      const el = $("#form-status");
      el.textContent = text;
      el.classList.toggle("is-error", kind === "error");
      el.classList.toggle("is-success", kind === "success");
    }

    function readForm() {
      return {
        name: form.elements.namedItem("name").value.trim(),
        email: form.elements.namedItem("email").value.trim(),
        inquiry: form.elements.namedItem("inquiry").value,
        subject: form.elements.namedItem("subject").value.trim(),
        message: messageInput.value.trim(),
      };
    }

    function buildMailto(d) {
      const subject = `[Portfolio] ${d.inquiry}: ${d.subject}`;
      const body = [
        `Name: ${d.name}`,
        `Email: ${d.email}`,
        `Inquiry type: ${d.inquiry}`,
        "",
        d.message,
      ].join("\n");
      return `mailto:${PERSON.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      names.forEach((n) => touched.add(n));
      const errors = names.map((n) => validateField(n)).filter(Boolean);
      if (errors.length) {
        setStatus(`Please fix ${errors.length} ${errors.length === 1 ? "field" : "fields"} to continue.`, "error");
        const firstBad = names.find((n) => form.elements.namedItem(n).classList.contains("is-invalid"));
        if (firstBad) form.elements.namedItem(firstBad).focus();
        return;
      }
      if (!emailReady) {
        setStatus("The contact email is not configured yet.", "error");
        return;
      }
      window.location.href = buildMailto(readForm());
      setStatus("Your email app should open with the message ready. Nothing has been sent from this website. Review it and press send in your email app.", "success");
    });

    $("#copy-message").addEventListener("click", async (event) => {
      const d = readForm();
      const button = event.currentTarget;
      if (!d.message) {
        flash(button, "Write a message first");
        return;
      }
      const text = `Name: ${d.name}\nEmail: ${d.email}\nInquiry type: ${d.inquiry}\nSubject: ${d.subject}\n\n${d.message}`;
      flash(button, (await copyText(text)) ? "Message copied" : "Copy not available");
    });

    // Service "Discuss" links pre-select the matching inquiry type.
    document.addEventListener("click", (event) => {
      const link = event.target.closest && event.target.closest("[data-inquiry]");
      if (!link) return;
      const select = form.elements.namedItem("inquiry");
      const option = Array.from(select.options).find((o) => o.value === link.dataset.inquiry);
      if (option) select.value = option.value;
    });
  }

  /* ---------- Navigation, scroll, reveal, typing ---------- */
  function initNavigation() {
    const toggle = $("#nav-toggle");
    const menu = $("#nav-menu");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle("show", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      toggle.querySelector("i").className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    };

    toggle.addEventListener("click", () => setOpen(!menu.classList.contains("show")));
    menu.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
    document.addEventListener("click", (event) => {
      if (menu.classList.contains("show") && !event.target.closest("#site-nav")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("show")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", debounce(() => {
      if (window.innerWidth >= 992 && menu.classList.contains("show")) setOpen(false);
    }, 150));

    // Active-section indicator.
    const links = $$("#nav-menu a[href^='#']");
    const linkFor = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => { a.classList.remove("active"); a.removeAttribute("aria-current"); });
          const active = linkFor.get(entry.target.id);
          if (active) {
            active.classList.add("active");
            active.setAttribute("aria-current", "true");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      linkFor.forEach((_, id) => {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
      });
    }
  }

  function initScrollEffects() {
    const nav = $("#site-nav");
    const progress = $("#scroll-progress");
    const toTop = $("#back-to-top");
    let frame = null;

    const update = () => {
      frame = null;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (nav) nav.classList.toggle("is-scrolled", y > 10);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);
    };
    const schedule = () => { if (frame === null) frame = window.requestAnimationFrame(update); };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: REDUCED.matches ? "auto" : "smooth" });
      });
    }
  }

  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) || REDUCED.matches) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => observer.observe(el));
  }

  let typeTimer = null;
  function stopTyping() {
    clearTimeout(typeTimer);
    typeTimer = null;
  }

  function initTyping() {
    const target = $("#typed-title");
    const titles = (PERSON.typedTitles || []).filter(Boolean);
    if (!target || !titles.length) return;
    if (REDUCED.matches) {
      target.textContent = titles[0];
      return;
    }

    let titleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const tick = () => {
      const word = titles[titleIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = word.slice(0, charIndex);
      let delay = deleting ? 35 : 70;
      if (!deleting && charIndex === word.length) {
        delay = 1800;
        deleting = true;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        delay = 300;
      }
      typeTimer = setTimeout(tick, delay);
    };
    tick();

    // Stop the loop when the page is hidden or unloaded.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopTyping();
      else if (!typeTimer) tick();
    });
    window.addEventListener("pagehide", stopTyping, { once: true });
  }

  /* ---------- Announcement banner ---------- */
  function initAnnouncement() {
    const cfg = CFG.announcement || {};
    const bar = $("#announcement");
    if (!bar || !cfg.enabled || !cfg.text) return;
    if (storageGet(ANNOUNCE_KEY) === cfg.id) return;

    $("#announcement-text").textContent = cfg.text;
    const link = $("#announcement-link");
    if (cfg.linkText && cfg.linkHref) {
      link.textContent = cfg.linkText;
      link.setAttribute("href", cfg.linkHref);
      link.hidden = false;
    }
    bar.hidden = false;

    $("#announcement-dismiss").addEventListener("click", () => {
      storageSet(ANNOUNCE_KEY, cfg.id);
      bar.hidden = true;
      $(".brand").focus();
    });
  }

  /* ---------- Command palette (Ctrl+K / Cmd+K) ---------- */
  function buildCommands() {
    const scrollTo = (id) => () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: REDUCED.matches ? "auto" : "smooth", block: "start" });
    };
    const go = (label, id, iconClass) => ({
      label: `Go to ${label}`, keywords: label.toLowerCase(), icon: iconClass, run: scrollTo(id),
    });

    const commands = [
      go("Home", "home", "fa-solid fa-house"),
      go("About", "about", "fa-solid fa-user"),
      go("Skills", "skills", "fa-solid fa-layer-group"),
      go("Experience", "experience", "fa-solid fa-briefcase"),
      go("Projects", "projects", "fa-solid fa-diagram-project"),
      go("Certifications", "certifications", "fa-solid fa-award"),
      go("Education", "education", "fa-solid fa-graduation-cap"),
      go("Contact", "contact", "fa-solid fa-envelope"),
      { label: "Toggle theme", keywords: "theme dark light mode", icon: "fa-solid fa-circle-half-stroke", run: () => $("#theme-toggle").click() },
      { label: "Download CV", keywords: "cv resume pdf download", icon: "fa-solid fa-file-arrow-down", run: () => $("[data-cv]:not([hidden])")?.click() },
      { label: "Print CV", keywords: "print resume pdf", icon: "fa-solid fa-print", run: printCv },
      { label: "Download skills (JSON)", keywords: "skills json export", icon: "fa-solid fa-file-code", run: downloadSkillsJson },
      { label: "Copy portfolio URL", keywords: "copy url link share", icon: "fa-solid fa-link", run: () => copyPortfolioUrl(null) },
    ];
    if (!isPlaceholder(PERSON.email)) {
      commands.push({ label: "Copy email address", keywords: "email contact copy", icon: "fa-regular fa-copy", run: () => copyText(PERSON.email) });
    }
    const username = usableUrl(CFG.github && CFG.github.username);
    if (username) {
      commands.push({
        label: "Open GitHub profile", keywords: "github code repositories", icon: "fa-brands fa-github",
        run: () => window.open(`https://github.com/${encodeURIComponent(username)}`, "_blank", "noopener"),
      });
    }
    return commands;
  }

  function initCommandPalette() {
    const dialog = $("#command-palette");
    const input = $("#palette-input");
    const list = $("#palette-list");
    if (!dialog || !input || !list) return;

    const commands = buildCommands();
    let visible = [];
    let activeIndex = 0;
    let trigger = null;

    function setActive(index) {
      if (!visible.length) return;
      activeIndex = (index + visible.length) % visible.length;
      $$("[role='option']", list).forEach((el, i) => el.setAttribute("aria-selected", String(i === activeIndex)));
      input.setAttribute("aria-activedescendant", `palette-option-${activeIndex}`);
      const el = document.getElementById(`palette-option-${activeIndex}`);
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }

    function run(index) {
      const command = visible[index];
      if (!command) return;
      dialog.close();
      command.run();
    }

    function render(query) {
      const term = query.trim().toLowerCase();
      visible = commands.filter((c) => !term || c.label.toLowerCase().includes(term) || c.keywords.includes(term));
      activeIndex = 0;
      if (!visible.length) {
        list.replaceChildren(make("li", { class: "palette-empty", role: "option", "aria-disabled": "true", text: "No matching commands" }));
        input.setAttribute("aria-activedescendant", "");
        return;
      }
      list.replaceChildren(...visible.map((c, i) =>
        make("li", {
          id: `palette-option-${i}`,
          role: "option",
          class: "palette-item",
          "aria-selected": String(i === 0),
          onclick: () => run(i),
          onmouseenter: () => setActive(i),
        }, [icon(c.icon), make("span", { text: c.label })])
      ));
      input.setAttribute("aria-activedescendant", "palette-option-0");
    }

    function open() {
      if (dialog.open) return;
      trigger = document.activeElement;
      input.value = "";
      render("");
      dialog.showModal();
      input.focus();
    }

    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") { event.preventDefault(); setActive(activeIndex + 1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); setActive(activeIndex - 1); }
      else if (event.key === "Enter") { event.preventDefault(); run(activeIndex); }
    });
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      if (trigger && typeof trigger.focus === "function" && document.contains(trigger)) trigger.focus();
    });

    const openButton = $("#palette-open");
    if (openButton) openButton.addEventListener("click", open);

    document.addEventListener("keydown", (event) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      // Do not open a second modal over another dialog.
      if (!dialog.open && document.querySelector("dialog[open]")) return;
      event.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    });
  }

  /* ---------- Copy actions, downloads, print ---------- */
  async function copyPortfolioUrl(button) {
    const ok = await copyText(currentBase());
    if (button) flash(button, ok ? "URL copied" : "Copy not available");
    else announce(ok ? "Portfolio URL copied" : "Copy not available");
  }

  function downloadCv() {
    const link = $("[data-cv]:not([hidden])");
    if (link) link.click();
  }

  function renderPrintCv() {
    const root = $("#print-cv");
    if (!root) return;
    const block = (title, children) => make("section", { class: "print-cv__section" }, [make("h2", { text: title }), ...children]);

    const experience = (CFG.experience || []).map((job) => make("div", {}, [
      make("h3", { text: `${job.title}, ${job.company}` }),
      make("p", { class: "print-cv__meta", text: `${formatDate(job.start)} – ${job.end ? formatDate(job.end) : "Present"}${job.location ? ` · ${job.location}` : ""}` }),
      make("ul", {}, (job.responsibilities || []).map((r) => make("li", { text: r }))),
    ]));
    const skills = (CFG.skills || []).map((group) => make("p", {}, [
      make("strong", { text: `${group.label}: ` }),
      group.items.map((i) => i.name).join(", "),
    ]));
    const education = (CFG.education || []).map((edu) => make("div", {}, [
      make("h3", { text: edu.program }),
      make("p", { class: "print-cv__meta", text: [edu.institution, edu.end ? formatDate(edu.end) : "", edu.status === "in-progress" ? "In progress" : ""].filter(Boolean).join(" · ") }),
    ]));
    const certs = (CFG.certifications || []).map((c) => make("p", { text: [c.name, c.issuer].filter(Boolean).join(" · ") }));
    const contact = [PERSON.email, PERSON.location].filter((v) => !isPlaceholder(v)).join(" · ");

    root.replaceChildren(
      make("h1", { text: PERSON.name }),
      make("p", { class: "print-cv__meta", text: PERSON.title }),
      contact ? make("p", { class: "print-cv__meta", text: contact }) : null,
      make("p", { text: PERSON.bio }),
      block("Experience", experience),
      block("Skills", skills),
      block("Education", education),
      block("Certifications", certs)
    );
  }

  function printCv() {
    renderPrintCv();
    document.body.classList.add("printing-cv");
    const done = () => {
      document.body.classList.remove("printing-cv");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.setTimeout(() => window.print(), 0);
  }

  function initCopyActions() {
    const emailBtn = $("#copy-portfolio");
    if (emailBtn) emailBtn.addEventListener("click", (e) => copyPortfolioUrl(e.currentTarget));
    const printBtns = [$("#print-cv-btn"), $("#footer-print")];
    printBtns.forEach((btn) => { if (btn) btn.addEventListener("click", printCv); });
    const skillsBtn = $("#skills-download");
    if (skillsBtn) skillsBtn.addEventListener("click", downloadSkillsJson);
  }

  /* ---------- SEO, analytics, footer ---------- */
  function injectJsonLd() {
    if (!FEATURES.jsonLd || !PERSON.name || !PERSON.title) return;
    const data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: PERSON.name,
      jobTitle: PERSON.title,
      description: PERSON.bio,
      homeLocation: { "@type": "Place", name: PERSON.location },
      knowsAbout: (CFG.skills || []).flatMap((g) => g.items.map((i) => i.name)).slice(0, 20),
      sameAs: (CFG.links || []).map((l) => usableUrl(l.url)).filter((u) => /^https:\/\//.test(u)),
    };
    if (!isPlaceholder(CFG.siteUrl)) data.url = CFG.siteUrl;
    const script = make("script", { type: "application/ld+json" });
    script.textContent = JSON.stringify(data);
    document.head.append(script);
  }

  function initAnalytics() {
    const cfg = CFG.analytics || {};
    if (!cfg.enabled || isPlaceholder(cfg.scriptUrl)) return;
    const script = make("script", { src: cfg.scriptUrl, defer: true });
    if (cfg.websiteId && !isPlaceholder(cfg.websiteId)) script.dataset.websiteId = cfg.websiteId;
    document.head.append(script);
  }

  function setYears() {
    const year = String(new Date().getFullYear());
    $$("[data-year]").forEach((node) => { node.textContent = year; });
  }

  /* ---------- Start ---------- */
  function init() {
    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.add("js");

    run(initTheme);
    run(bindPersonalData);
    run(renderSocialLinks);
    run(renderHero);
    run(renderHighlights);
    run(renderAbout);
    run(renderSkills);
    run(renderExperience);
    run(initProjects);
    run(renderCertifications);
    run(renderEducation);
    run(renderServices);
    run(renderProcess);
    run(initArticles);
    run(() => { initGitHub(); });
    run(initContact);
    run(initNavigation);
    run(initScrollEffects);
    run(initProjectModal);
    run(initCommandPalette);
    run(initCopyActions);
    run(initAnnouncement);
    run(renderPrintCv);
    run(injectJsonLd);
    run(initAnalytics);
    run(setYears);
    run(initTyping);
    run(initReveal);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
