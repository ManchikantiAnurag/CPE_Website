AGENTS.md — CPE Junior College Website

1. Project Scope
This file defines working instructions for AI coding agents and developers making changes to the CPE Junior College website.
- Official website: https://www.cpecollege.com/
- Preferred canonical host: https://www.cpecollege.com/
- Primary purpose: maintain and improve the college's public-facing website.
- Treat the existing repository, framework, build process, and deployment configuration as the source of truth.
Do not assume a framework, CMS, hosting provider, package manager, or directory structure before inspecting the project.

2. Mandatory First Steps
Before making changes:
1. Inspect the repository structure and identify the application entry points.
2. Read the existing README, package manifests, environment examples, and project-specific instructions.
3. Identify the framework, runtime version, package manager, build commands, linting rules, and test commands.
4. Review the existing design system, reusable components, routing, metadata implementation, and content model.
5. Inspect the affected page and its related components before editing.
6. Check the current working tree and preserve unrelated user changes.
Do not replace existing architecture or dependencies when a smaller, compatible change will solve the task.

3. Website Content and Accuracy
Use approved content supplied by the college or already published on its official website.

Important public pages:
- /
- /about
- /courses
- /courses/mec
- /courses/ipmat
- /courses/clat
- /courses/cec
- /campus-life
- /gallery
- /faculty
- /news
- /news/19th-annual-day-celebrations
- /achievements
- /admissions/
- /contact
- /exams-downloads

Content rules:
- Do not invent courses, fees, eligibility criteria, results, rankings, awards, affiliations, accreditations, facilities, faculty credentials, testimonials, contact details, or placement claims.

- Do not change student names, marks, percentages, dates, or other factual records without an approved source.
- Preserve the meaning of college-approved copy when editing for clarity or SEO.
- Flag missing, conflicting, or outdated information instead of guessing.
- Use the official college name consistently as supplied by the client.

4. Design and User Experience
- Follow the existing brand identity, visual system, and approved design references.
- Prefer consistent reusable components over duplicated page-specific implementations.
- Keep layouts responsive across mobile, tablet, laptop, and desktop sizes.
- Maintain clear navigation, readable typography, sufficient contrast, and visible interaction states.
- Use descriptive labels for buttons, links, forms, and navigation.
- Ensure images have appropriate alternative text; use empty alt text for purely decorative images.
- Avoid unnecessary animation, visual clutter, layout shifts, and oversized assets.
- Do not redesign unrelated pages unless the task explicitly requires it.

5. SEO and Discoverability
For every public page, where supported by the existing application:
- Provide a unique, accurate title tag and meta description.
- Use one clear primary page heading and a logical heading hierarchy.
- Use descriptive, stable, human-readable URLs.
- Add a canonical URL pointing to the preferred public URL.
- Ensure important content is available in crawlable HTML and is not hidden exclusively behind interactions.
- Add contextual internal links to relevant college pages.
- Use descriptive image filenames and useful alt text.
- Implement structured data only when the page genuinely qualifies and all required values are verified.
- Keep Open Graph and social-sharing metadata accurate.
- Avoid keyword stuffing, duplicate metadata, hidden text, doorway pages, and misleading structured data.

Canonical URL and Redirect Rules
- Use https://www.cpecollege.com/ as the preferred host unless the project owner confirms a different canonical host.
- Choose one canonical form for each page, including trailing-slash behavior.
- The admissions page is listed as /admissions/; check the live routing and redirect behavior before changing it.
- Redirect duplicate URL variants to the selected canonical URL using the hosting platform's supported method.
- Do not create redirect chains or redirect unrelated URLs to the homepage.

Sitemap and Robots
- Keep https://www.cpecollege.com/sitemap.xml accurate and limited to canonical, indexable public URLs that return successful responses.
- Do not include redirects, error pages, private pages, duplicate URLs, or non-canonical URLs in the sitemap.
- Update the sitemap when public routes are added, removed, or changed.
- Keep the sitemap declaration in the root robots.txt accurate.
- Do not block CSS, JavaScript, images, or other resources required to render public pages correctly.
- Do not use robots.txt as access control. Protect private routes and data at the application/server level.
- Verify every proposed disallow rule against the actual application routes before deployment.

6. AI and Automated-Agent Discoverability
- Keep /llms.txt accurate, concise, and aligned with the live public website.
- Keep this AGENTS.md file focused on instructions for agents working on the project; it is not a substitute for website content or security controls.
- Link only to verified public pages and resources.
- Do not expose secrets, credentials, private student information, unpublished documents, internal endpoints, or sensitive operational details in public files.
- Do not assume that publishing llms.txt or AGENTS.md guarantees that an AI system will crawl or follow them.

7. Accessibility
- Use semantic HTML elements and maintain a logical document structure.
- Ensure keyboard access for navigation, forms, dialogs, and interactive controls.
- Provide visible focus indicators.
- Associate form fields with clear labels and provide understandable validation messages.
- Maintain sufficient text/background contrast.
- Do not rely on color alone to communicate meaning.
- Respect reduced-motion preferences where animations are used.
- Use accessible names for icon-only controls.

8. Performance
- Optimize image dimensions and formats while preserving visual quality.
- Lazy-load below-the-fold images where appropriate; do not unnecessarily lazy-load the primary hero image.
- Avoid unnecessary JavaScript, large dependencies, and duplicate libraries.
- Prevent cumulative layout shifts by reserving image and media dimensions.
- Use caching and compression supported by the existing hosting environment.
- Measure performance before and after significant changes; do not claim performance improvements without evidence.

9. Security and Privacy
- Never commit API keys, passwords, tokens, private keys, or production credentials.
- Do not place secrets in frontend code or public configuration files.
- Validate and safely handle user input on the server where applicable.
- Use safe output encoding and avoid unsafe HTML injection.
- Do not weaken authentication, authorization, rate limits, or security headers to make a feature work.
- Collect only the personal information required for a clearly stated purpose.
- Do not expose student, parent, staff, or enquiry information in public pages, logs, source maps, or test fixtures.
- Do not make production data or infrastructure changes without explicit authorization.

10. Forms and Integrations
- Preserve existing form destinations and integrations unless the task explicitly requests a change.
- Validate required fields and show clear success and error states.
- Avoid exposing private form submissions in client-side code.
- Do not invent email addresses, phone numbers, API endpoints, or third-party account details.
- Test form behavior in a safe environment before production deployment.

11. Code Quality and Change Management
- Follow the repository's established naming, formatting, and component conventions.
- Prefer small, focused, maintainable changes.
- Reuse existing dependencies and components where practical.
- Avoid unrelated refactoring and unnecessary dependency upgrades.
- Do not remove existing content, routes, analytics, integrations, or metadata without approval.
- Keep environment-specific configuration out of committed source code.
- Add or update tests when behavior changes and the project has a test framework.

12. Verification Before Handover
After making changes:
1. Run the relevant formatter, linter, type checker, and tests available in the project.
2. Run the production build when practical.
3. Check the affected routes for broken links, missing assets, console errors, and rendering issues.
4. Test responsive layouts and keyboard navigation.
5. Verify page titles, descriptions, canonical tags, headings, and indexability.
6. Validate sitemap XML and robots.txt syntax when either is changed.
7. Confirm redirects and canonical URLs do not create loops or chains.
8. Report any checks that could not be run; never claim they passed without running them.

13. Completion Report
For each task, provide a concise handover containing:
- Summary of what changed.
- Files and routes affected.
- SEO, accessibility, or performance implications where relevant.
- Tests and build commands run, with actual results.
- Any assumptions, unresolved issues, or approvals still required.

Do not state that a change is deployed unless deployment has actually been completed and verified.
