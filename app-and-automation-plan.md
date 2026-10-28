# The App & Automation Plan — "World 8: The Command Center"

_Written 29 Oct 2026. This is the continuity doc for the one-app, every-button idea — read this first in any new chat or Cowork space before building anything here._

## The vision, in one line

Push a finished article and it fans out to every channel. Tap once and socials post. Booking, prep, workshop material and invoicing happen without opening five different tools — reachable from your phone.

## Decisions already locked in (29 Oct 2026)

- **Platform: a mobile-friendly web dashboard**, not a native app. Opens from any phone browser, no app store, fastest to build and keep current.
- **Social posting goes through a connector tool** (Zapier or similar), not raw code talking to Instagram/LinkedIn directly — their APIs don't allow outside tools to post on your behalf without going through their own business-approval process first. A connector maintains that relationship for you.
- **Channels for now: LinkedIn + Instagram only.** Discord and Substack are parked — you were exploring, not already building an audience there. Revisit if a real reason shows up.
- **No full auto-answering of comments/DMs.** Recommended instead: I draft a reply, you approve and send with one tap. Full automation here reads as the opposite of what your own practice teaches — a canned reply is a performance, not presence. Worth revisiting only if you disagree once you see it in practice.

## Open questions, not yet decided

1. **Build order** — which of the four jobs first: publish-push (article → socials), social-push (tap, it's posted), booking/admin (already underway as *Arpita's Assistant*, World 7), or content & invoicing?
2. **Which connector tool** — Zapier, Make.com, or another — and its account/cost, once we're ready to wire it up.
3. Substack and Reddit, if they come back into scope: Substack has no first-class posting API (the real route is emailing a per-publication secret address, which Zapier *can* trigger, but it's a workaround). Reddit has a real API, but the actual blocker is that most subreddits detect and ban automated self-promotion — a strategy risk more than a build task.

## Where this fits the rest of the project

- **Arpita's Assistant (World 7)** is the admin/documentation half of this vision and is already partly built — see `diagnosis-plan-sender.gs` in this repo. The Command Center is the front door to all of this, not a replacement for it.
- **Searchability Round Two (r11)** and **Automate the Push (d5)** in the quest tracker are the two steps directly upstream of this one.

## Every tool/account this touches

| Tool | What it's for | Link |
|---|---|---|
| GitHub (this repo) | durable backup, every file with history | https://github.com/presencearpitamehta-dotcom/Website-Presence-AM |
| Netlify | hosts the live site | https://app.netlify.com |
| Google Sheets | "Presence Quotient Leads (Responses)" — the admin sheet today | https://sheets.google.com |
| Google Drive | "Project Websheb" folder — scripts and guides | — |
| Zapier (candidate connector) | would wire LinkedIn/Instagram posting and possibly Substack-by-email | https://zapier.com |
| Make.com (alternative connector) | same job as Zapier, worth comparing before picking one | https://www.make.com |
| LinkedIn | one of the two priority social channels | https://www.linkedin.com |
| Instagram | one of the two priority social channels | https://www.instagram.com |
| Razorpay | payments | https://dashboard.razorpay.com |
| Calendly / Cal.com | booking | — |
| HubSpot | CRM (write access not yet granted) | — |

## How to resume this specific thread in a new chat or Cowork space

Say: *"Read claude/app-and-automation-plan.md and claude/status-and-quest.md in the 'Website with fable' project, then tell me where the Command Center idea stands."* Everything above is what it will find.
