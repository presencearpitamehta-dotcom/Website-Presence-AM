# Status & Recovery Guide — arpitamehta.co

_This file exists for one reason: if the Claude chat you've been working in gets too long, loses context, or you just need to start a new session — read this first. It tells you and a fresh Claude everything needed to pick up exactly where things left off._

**Last updated: 29 Oct 2026**

---

## How to resume in a new session

1. Open a new Claude chat (or Cowork space) attached to the "Website with fable" project, or just point Claude at this repo: `presencearpitamehta-dotcom/website-presence-am`.
2. Say: "Read STATUS-AND-RECOVERY-GUIDE.md in this repo and the project's `claude/status-and-quest.md` doc, then tell me where things stand."
3. That's it — everything below is what it will find.

## What's live right now

- **Site**: deployed via Netlify from this repo's root (the HTML files, `images/`, `downloads/`, `netlify.toml`, `_redirects`, `robots.txt`, `sitemap.xml`).
- **PQ quiz/survey**: in `assessment.html`. **Standing rule: do not change the 16 questions or the scoring logic without Arpita's explicit sign-off.** This has held for the whole engagement — don't let a fresh session forget it.
- **Lead pipeline**: Google Form → "Presence Quotient Leads (Responses)" Google Sheet → `enquiry-autoresponder.gs` (Apps Script, already installed and running) replies to every enquiry/download/assessment automatically.
- **Brand reference for any new document**: the palette and type used in `enquiry-autoresponder.gs`'s emails and in `assessment.html`'s PDF scorecard CSS — cognac `#9C5A4C`, ink `#2A1F14`, gold `#AE957E`, parchment `#DED4CA`, linen `#F8F4EE`, Cormorant Garamond (display) + Jost (body). This is **not** the same as the maroon/Playfair Display palette used in the older certificate/workbook materials — those are a separate, print-only brand expression. Don't mix them up (this mistake was already made once and corrected).

## Done this phase

- Fixed: WhatsApp share duplicating the domain; missing form validation (regex, all 11 pages); blank-PDF export bug on the assessment page.
- Built: Diagnosis & Plan document (a real client-facing session brief), in the correct brand, as both a populated example (`Diagnosis-and-Plan-AyushMehta-example.docx`) and a blank merge-tag template (`Diagnosis-and-Plan-TEMPLATE.docx`).
- Built, **not yet tested live**: `diagnosis-plan-sender.gs` — ticking "Ready to Send" on a sheet row fills the template, saves a Doc + PDF to that client's own auto-created Drive folder, emails the PDF, and logs the send. Needs: new sheet columns (listed in the script's header comment), the template uploaded to Drive as a Google Doc with its ID pasted into the script, and a live test on one real row.

## Open / not built yet

- Razorpay confirmation email — blocked on Razorpay going live (Arpita said 2–3 weeks). Spec: must remind the client to complete the PQ assessment the same day, before the session, with a link only if they haven't already taken it.
- Deliverables tracker (what's owed/sent per client) — not scoped in detail.
- Calendar blocks/reminders tied to bookings — not built.
- Four missing per-dimension score fields (Image/Presence/Social/Distinction) on the Google Form — Arpita's to add; blocks full score breakdowns everywhere they're needed.
- HubSpot write-scope access — not granted.
- 9 broken homepage images — raised, never root-caused.
- Google Drive editor/write permission for Claude's session — currently create-only works, in-place edits of existing Google Docs/Sheets don't; documents are delivered as files until reconnected.

## Where everything lives

- **Code + site + docs**: this repo (`website-presence-am`) — the durable, size-unlimited backup. Every commit here is dated.
- **Project**: claude.ai → Projects → "Website with fable" → `claude/status-and-quest.md` has the same status in prose, plus the interactive quest tracker (`claude/launch-sequence-quest-tracker.html`).
- **Drive folder "Project Websheb"**: holds the Apps Script source files for quick reference. (The two `.docx` files and the full deploy folder are **not** duplicated there — Drive's upload path here can't reliably carry large or binary files; this repo is the real copy of those.)
- **Quest tracker**: `launch-sequence-quest-tracker.html` in this repo (and in the project) — open it in a browser for the full interactive view with XP, worlds, and next steps.

## The one standing rule worth repeating

No changes to the PQ quiz/survey instrument (questions or scoring) without Arpita's explicit approval — ever, regardless of which session or which Claude is working on this.
