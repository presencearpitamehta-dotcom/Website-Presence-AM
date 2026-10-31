# Website Log History — arpitamehta.co

A plain-language record of what was built, changed and fixed on the site, in order, so you can look back later and see what happened and why. Newest at the bottom. Keep this file alongside your quest tracker, to-do list and SOPs.

---

## 2026-10-25 — Site goes live on Netlify
First upload of the full site to Netlify ("Netlify Drop" — a manual upload, not yet connected to GitHub).

## 2026-10-28 — Repo created, SEO foundations, quest tracker born
- Full site and all docs pushed to GitHub for the first time (this is now the permanent source of truth for the code).
- Added a clean Markdown mirror of every page (for AI search engines/LLMs to read the site more easily), `llms.txt`, and priced schema markup for the Discovery Call and In Person Session.
- Built the Launch Sequence Quest Tracker (the gamified step-by-step guide) and the App & Automation Plan doc.
- Fixed a duplicate step ID bug in the quest tracker.

## 2026-10-31 — Security audit, Razorpay wiring, cancellation policy, Netlify linked
A big day. In order:
1. **Security fix:** Both lead-notification scripts (`enquiry-autoresponder.gs`, `diagnosis-plan-sender.gs`) were escaping user-submitted data before it went into HTML emails, closing a cross-site-scripting (XSS) gap, including inside the `mailto:` link.
2. **Razorpay wired up:** The "Reserve" buttons on all 6 pages now route through your real Razorpay payment links instead of straight to Cal.com booking.
3. **Cancellation & reschedule policy** added and refined across the booking panel, the FAQ, and the wording given to you for the Razorpay page and Cal.com confirmation email. Went through several rounds: scope (just the booking panel + FAQ + Razorpay + confirmation email, not all 6 full panels), wording clarity (no em dashes, no ambiguous "within 24 hours"), and compliance (added the case where Arpita herself cancels, with a concrete refund timeline).
4. **FAQ reorganized:** "Cancellations & rescheduling" was pulled out into its own section instead of being buried inside "How to begin."
5. **Netlify linked to GitHub.** Confirmed from your own screenshots that Netlify had been running on a manual "Netlify Drop" upload (not linked to your repo). Walked through Developer Settings → Repository → Link Repository, and connected it live to `presencearpitamehta-dotcom/Website-Presence-AM`. Project: `strong-speculoos-2220d4`.
6. **Quest tracker clarity pass:** "Tame Your Inbox" and the Netlify steps were rewritten as full click-by-click walkthroughs (exact menus, exact buttons) after you flagged them as too vague.
7. **SEO/AI-visibility step added:** a new quest step covering Topmate and similar profile backlinks, plus a real third-party SEO/AI-citation tracker (no official Google Search Console connector exists; OpenRush, Ubersuggest and Semrush are the real options).
8. **Razorpay banner images** created for both payment pages (with-logo and no-logo versions), delivered as downloads.
9. **New deploy-approval rule agreed:** going forward, content changes (blog posts, FAQ wording, copy tweaks) still push straight to `main` automatically. Everything else — payment flow, forms, scripts, page structure, security fixes, new functionality — gets committed locally and described in chat first, and only pushed once you say go ahead.
10. **FAQ polish, this session (held for your approval, not yet live):**
    - Fixed the anchor-scroll bug where clicking a topic in the FAQ sidebar landed you slightly below the section heading, under the fixed nav bar, so you had to scroll back up.
    - Section headings (The Practice, How to Begin, etc.) now bolder and visually set apart from the questions beneath them.
    - Added a new "Referrals & offers" FAQ section: referral discount code, and group/sibling/corporate bulk pricing.
    - Added a "How did you hear about us?" optional dropdown to the general enquiry form on all 6 pages, plus a conditional "Which friend referred you?" field that only appears when "Referral / word of mouth" is picked. Added as quest step **a12** so it's not forgotten.
    - **Wired up all 4 fields** (source, message, how-did-you-hear, referrer) to their real Google Form entry IDs after you added the 4 matching questions to the Form and sent the pre-filled test link. Held for approval, not yet pushed.
11. **Bug: blank PDF scorecard, found and fixed.** The "Download Your Scorecard" PDF had been coming out visually blank. Root cause: the hidden capture element was set to `opacity:0.01` to stay invisible on the page, but the PDF tool (html2canvas) bakes in actual rendered pixels — opacity included — so the text was there, just rendered 99% transparent. Fixed by keeping it fully opaque and hiding it by position instead (pushed far down the page, out of view, rather than faded out).
12. **Full site audit, this session:**
    - Fixed a broken nav link: `resources.html`'s "Journal" link pointed to `index.html` instead of `blog/index.html` — wrong only on that one page.
    - **Security:** 5 internal files (`Diagnosis-and-Plan-TEMPLATE.docx`, `Diagnosis-and-Plan-AyushMehta-example.docx`, this log, the status/recovery guide, the app/automation plan) were sitting in the repo root, which Netlify publishes in full — meaning they were publicly downloadable to anyone who found or guessed the filename. Moved into `internal-docs/` (kept in git for history) and the whole folder is now hard-blocked by a Netlify redirect (404), so it can never be served even by accident. Added a proper `404.html` page too, since the site didn't have one.
    - Removed the old `arpitamehta-v30-DEPLOY/` folder — a leftover from the very first Netlify Drop upload (Oct 25), never served live but sitting in the repo as a stale, unpatched duplicate of the whole early site. Still recoverable from git history if ever needed.
    - **Found: Google Analytics has never actually been running.** Every page still has the placeholder `G-XXXXXXXXXX` instead of a real GA4 Measurement ID — it's been silently failing since day one, so there is currently zero visitor analytics data. Needs a real GA4 property + Measurement ID from you to fix.
    - The 5 blog pages (`blog/index.html` + the 4 articles) were running an older, unpatched copy of the enquiry form: the message/source fields were wired to placeholder IDs that never worked, and the "how did you hear about us" / "referred by a friend" fields were missing entirely. Brought in line with the 6 main pages.
    - Checked and found no issues: em dashes (none site-wide), font consistency (all pages use the same two fonts), LinkedIn/mailto links (consistent everywhere), the downloadable PDF guide (valid file).
    - Not yet verified from this side (sandbox network couldn't reach the domain): the two live Razorpay payment links — worth a manual click-test.

---

*This file is written by hand after each batch of changes — it is not auto-generated from git history, so treat git's own commit log as the exact record and this as the readable summary of it.*
