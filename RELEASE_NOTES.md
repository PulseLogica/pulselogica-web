# Release Notes

---

## release: minor content upgrade - 2026-08-17

### What's New
- Added a video introduction to the Hero section for a more engaging first impression
- Updated CTA headline to emphasize a low-pressure discovery call experience
- Renamed "Book A Call Now" button to "Discovery Call" for clearer intent

### Bug Fixes
- Corrected business contact email on the Terms & Conditions page (`business@pulselogica.com`)

---

## Privacy Policy Compliance Update - 2026-08-10

### What's New
- **Cookie Consent Notice** — The privacy policy now discloses that a cookie notice is presented on first visit, allowing visitors to accept or decline non-essential cookies.
- **Legal Basis for Processing** — Added an explicit statement that personal data is processed on the basis of consent given at form submission, and where applicable, to take steps prior to a service engagement.
- **Defined Retention Periods** — Replaced the general retention statement with specific terms: booking inquiries that don't convert are retained up to twelve (12) months from last contact; data tied to client engagements follows the applicable agreement or Philippine statutory requirements.
- **Cross-Border Data Transfer Disclosure** — Documented that some service providers process data outside the Philippines, with protections consistent with Section 21 of the DPA's Implementing Rules and Regulations.
- **Data Breach Notification Commitment** — Added a 72-hour notification commitment to the National Privacy Commission and affected data subjects, per Section 20(f) of the Data Privacy Act.
- **Right to Data Portability** — Added to the data subject rights section, which now cites Sections 16 and 18 of the Data Privacy Act.
- **NPC Registration Status** — New section documenting exemption status under NPC Circular No. 2022-04 (Track 3 Sworn Declaration).

### Bug Fixes
- Corrected the Data Protection Officer contact email published in the privacy policy.

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
