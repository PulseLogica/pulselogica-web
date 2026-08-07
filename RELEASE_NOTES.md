# Release Notes

---

## Finalized Pulse Check; Minor Content Updates; Legal Documents Added - 2026-08-08

### What's New
- **Custom Booking Calendar** — Implemented a new in-app booking flow powered by the Google Calendar API, replacing the external booking link. Users can now check availability and create appointments directly on the site.
- **Redesigned Pulse Check Flow** — Overhauled the Pulse Check experience with distinct stages: Intro, Quiz (with slider questions), Reveal, and a scoring engine. The flow is now modular and component-driven.
- **Legal Pages** — Added Privacy Policy and Terms & Conditions pages with a shared `LegalPageLayout` component.
- **Footer Legal Links** — Navigation and footer now include links to the new legal pages.
- **Phases Section Redesign** — Rebuilt the Phases component for improved layout and content clarity.

### Bug Fixes
- Fixed client data not being populated in ClickUp Lead custom fields.
- Fixed ClickUp lead document creation.
- Corrected timezone and booking time handling.
- Minor content updates across Hero, Nav, CTA Footer, and other sections.

### Internal / Technical
- Added Google Calendar webhook route and booking API endpoints (`/api/booking/availability`, `/api/booking/create`).
- Expanded ClickUp integration with additional custom field mappings.
- Folder restructure and component optimization across the PulseCheck module.
