# Website Log History, arpitamehta.co

A plain-language record of what was built, changed and fixed on the site, in order, so you can look back later and see what happened and why. Newest at the bottom. Keep this file alongside your quest tracker, to-do list and SOPs.

---

## 2026-10-25, Site goes live on Netlify
First upload of the full site to Netlify ("Netlify Drop", a manual upload, not yet connected to GitHub).

## 2026-10-28, Repo created, SEO foundations, quest tracker born
- Full site and all docs pushed to GitHub for the first time (this is now the permanent source of truth for the code).
- Added a clean Markdown mirror of every page (for AI search engines/LLMs to read the site more easily), `llms.txt`, and priced schema markup for the Discovery Call and In Person Session.
- Built the Launch Sequence Quest Tracker (the gamified step-by-step guide) and the App & Automation Plan doc.
- Fixed a duplicate step ID bug in the quest tracker.

## 2026-10-31, Security audit, Razorpay wiring, cancellation policy, Netlify linked
A big day. In order:
1. **Security fix:** Both lead-notification scripts (`enquiry-autoresponder.gs`, `diagnosis-plan-sender.gs`) were escaping user-submitted data before it went into HTML emails, closing a cross-site-scripting (XSS) gap, including inside the `mailto:` link.
2. **Razorpay wired up:** The "Reserve" buttons on all 6 pages now route through your real Razorpay payment links instead of straight to Cal.com booking.
3. **Cancellation & reschedule policy** added and refined across the booking panel, the FAQ, and the wording given to you for the Razorpay page and Cal.com confirmation email. Went through several rounds: scope (just the booking panel + FAQ + Razorpay + confirmation email, not all 6 full panels), wording clarity (no em dashes, no ambiguous "within 24 hours"), and compliance (added the case where Arpita herself cancels, with a concrete refund timeline).
4. **FAQ reorganized:** "Cancellations & rescheduling" was pulled out into its own section instead of being buried inside "How to begin."
5. **Netlify linked to GitHub.** Confirmed from your own screenshots that Netlify had been running on a manual "Netlify Drop" upload (not linked to your repo). Walked through Developer Settings → Repository → Link Repository, and connected it live to `presencearpitamehta-dotcom/Website-Presence-AM`. Project: `strong-speculoos-2220d4`.
6. **Quest tracker clarity pass:** "Tame Your Inbox" and the Netlify steps were rewritten as full click-by-click walkthroughs (exact menus, exact buttons) after you flagged them as too vague.
7. **SEO/AI-visibility step added:** a new quest step covering Topmate and similar profile backlinks, plus a real third-party SEO/AI-citation tracker (no official Google Search Console connector exists; OpenRush, Ubersuggest and Semrush are the real options).
8. **Razorpay banner images** created for both payment pages (with-logo and no-logo versions), delivered as downloads.
9. **New deploy-approval rule agreed:** going forward, content changes (blog posts, FAQ wording, copy tweaks) still push straight to `main` automatically. Everything else, payment flow, forms, scripts, page structure, security fixes, new functionality, gets committed locally and described in chat first, and only pushed once you say go ahead.
10. **FAQ polish, this session (held for your approval, not yet live):**
    - Fixed the anchor-scroll bug where clicking a topic in the FAQ sidebar landed you slightly below the section heading, under the fixed nav bar, so you had to scroll back up.
    - Section headings (The Practice, How to Begin, etc.) now bolder and visually set apart from the questions beneath them.
    - Added a new "Referrals & offers" FAQ section: referral discount code, and group/sibling/corporate bulk pricing.
    - Added a "How did you hear about us?" optional dropdown to the general enquiry form on all 6 pages, plus a conditional "Which friend referred you?" field that only appears when "Referral / word of mouth" is picked. Added as quest step **a12** so it's not forgotten.
    - **Wired up all 4 fields** (source, message, how-did-you-hear, referrer) to their real Google Form entry IDs after you added the 4 matching questions to the Form and sent the pre-filled test link. Held for approval, not yet pushed.
11. **Bug: blank PDF scorecard, found and fixed.** The "Download Your Scorecard" PDF had been coming out visually blank. Root cause: the hidden capture element was set to `opacity:0.01` to stay invisible on the page, but the PDF tool (html2canvas) bakes in actual rendered pixels, opacity included, so the text was there, just rendered 99% transparent. Fixed by keeping it fully opaque and hiding it by position instead (pushed far down the page, out of view, rather than faded out).
12. **Full site audit, this session:**
    - Fixed a broken nav link: `resources.html`'s "Journal" link pointed to `index.html` instead of `blog/index.html`, wrong only on that one page.
    - **Security:** 5 internal files (`Diagnosis-and-Plan-TEMPLATE.docx`, `Diagnosis-and-Plan-AyushMehta-example.docx`, this log, the status/recovery guide, the app/automation plan) were sitting in the repo root, which Netlify publishes in full, meaning they were publicly downloadable to anyone who found or guessed the filename. Moved into `internal-docs/` (kept in git for history) and the whole folder is now hard-blocked by a Netlify redirect (404), so it can never be served even by accident. Added a proper `404.html` page too, since the site didn't have one.
    - Removed the old `arpitamehta-v30-DEPLOY/` folder, a leftover from the very first Netlify Drop upload (Oct 25), never served live but sitting in the repo as a stale, unpatched duplicate of the whole early site. Still recoverable from git history if ever needed.
    - **Found: Google Analytics has never actually been running.** Every page still has the placeholder `G-XXXXXXXXXX` instead of a real GA4 Measurement ID, it's been silently failing since day one, so there is currently zero visitor analytics data. Needs a real GA4 property + Measurement ID from you to fix.
    - The 5 blog pages (`blog/index.html` + the 4 articles) were running an older, unpatched copy of the enquiry form: the message/source fields were wired to placeholder IDs that never worked, and the "how did you hear about us" / "referred by a friend" fields were missing entirely. Brought in line with the 6 main pages.
    - Checked and found no issues: em dashes (none site-wide), font consistency (all pages use the same two fonts), LinkedIn/mailto links (consistent everywhere), the downloadable PDF guide (valid file).
    - Not yet verified from this side (sandbox network couldn't reach the domain): the two live Razorpay payment links, worth a manual click-test.

## 2026-11-01, Three-tier booking, legal page, dead-code purge, nav fix

Worked late into the night of 31 Oct, logged under 01 Nov. Branch: `work/2026-11-01` (all local, nothing pushed until the end-of-day approval).

### Pricing and the third tier
1. **Video Consultation added** as a middle tier: 45 minutes, online, Rs. 2,049. Reasoning: students take the 15-minute discovery call, serious image-servicing clients want a proper 45-minute session, and there was nothing between Rs. 339 and the in-person rate.
2. **In Person repriced** from Rs. 5,999 to Rs. 4,299, and renamed from "The In Person Session" to "In Person Consultation".
3. **Bug caught before it cost money:** the Video Consultation "Reserve" button was briefly wired straight to the Cal.com booking page, skipping payment entirely. Anyone could have booked a paid 45-minute slot for free. Rewired to its own Razorpay link (`virtual-call`) so payment is collected first, same as the other two tiers.
4. **Stale pricing found live on three pages** (the earlier sweep only caught dead copies): `faq.html` quoted "Rs. 5,999" in both the visible answer and the FAQ structured data Google reads; `about.html` showed Rs. 5,999 on its "Three doors" card under the old tier name; `index.html`'s business schema still offered "The In Person Session" at 5999. All corrected to Rs. 4,299 / "In Person Consultation", and the missing Video Consultation offer was added to `index.html`'s schema.
5. **Post-payment wait notice** added to the booking page in bold, after Arpita found the Razorpay redirect takes a few seconds and looks like nothing is happening. The old "your slot is held for twenty four hours" line was retired, since it no longer describes the real pay-then-schedule flow.
6. **Payment flow verified end to end.** Arpita made a real Rs. 339 Discovery Call payment to herself; confirmed via two Razorpay emails (payment ID `pay_TueH6s3mveznaF`, UPI), landed on Cal.com, picked a slot. Separately, all three Reserve buttons were click-tested in a real browser: each opens its correct `rzp.io` link, none bypasses payment.

### Dead code purge
7. **Orphaned Calendly booking panel removed from 11 pages** (about 818 lines). A slide-out `#panel` booking widget, with its own stale two-tier pricing, was still sitting in the markup of every page except the booking page. It was completely unreachable: its only trigger, `[data-calendly]`, matched zero live elements, confirmed by grep before anything was touched. Leftover from when the CTAs were remapped to plain links to `booking.html`. Removed the markup, the JavaScript (`openPanel`/`closePanel`/old `PAY_LINKS`/its Escape-key handler), the CSS, and the now-pointless `assets.calendly.com` and `calendly.com` permissions in each page's Content-Security-Policy. The separate enquiry-modal Escape handler was preserved and tested.
8. **Same cleanup applied to `booking.html`**, which still carried the dead Calendly CSP permissions and orphaned `.panel-overlay` CSS even though its own booking flow never used them.

### The legal page
9. **New `legal.html`**: Terms of Use, Copyright & Intellectual Property, and Privacy Policy as one page with three deep-linkable sections (`#terms`, `#copyright`, `#privacy`). Scoped to India for now (Indian law, Delhi jurisdiction). Sole proprietorship named as the operating entity. The refund policy is deliberately **not** duplicated here, it links to `faq.html#cancellation-policy` so there is only ever one place to update. "Presence Quotient" marked with the unregistered-trademark symbol, with an explicit note that it is not registered in India, which is accurate and avoids an overclaim. Deliberately kept short at Arpita's direction: no vendor names in the sharing section, no separate cookies/children's/retention sections, and the onus placed on the reader to check the page for updates.
10. **Bug in the new page, found and fixed:** the "On this page" box was marked up as a `<nav>` element, so it inherited the site-wide `nav{position:fixed;top:0}` rule, pinned itself to the top of the viewport and covered the logo. Changed to a `div` with the same accessibility role.
11. **The legal page was orphaned**, reachable from nowhere. A "Terms, Copyright & Privacy" footer link was added to all 12 pages that have the standard footer. **Held back from this deploy at Arpita's call**, so she can proofread the page awake rather than approve it at 3am. Both the page and its 12 footer links sit on `work/2026-11-01` and go live together; shipping the links without the page would have put a 404 in every footer.

### Nav button, a bug that had been live since the beginning
12. **The "Request a Call" button has never rendered as designed.** Arpita flagged it as looking too big. Measured across five pages: identical everywhere, so the new page was not the problem. The real cause is CSS specificity: `.nav-links a` (0,0,1,1) beats `.nav-cta` (0,0,1,0), so the intended `font-size:.8rem` was overridden by `1rem`, and `.cta`'s `letter-spacing:.18em` was overridden by `.04em`. The button has been rendering roughly 25% too large with a quarter of the intended tracking on every page since launch. Fixed with one equally-specific rule, `.nav-links a.nav-cta`, added to all 13 pages. Verified: 12.8px / 2.3px tracking everywhere, was 16px / 0.64px.

### Housekeeping
13. **Every em dash removed** from the entire repo. The first pass missed three classes, caught only because Arpita asked for confirmation rather than taking it on trust: the HTML entity form (`&mdash;`) in `booking.html`, which renders as an em dash to customers and appeared twice including in the new wait notice; both Apps Script files, where `diagnosis-plan-sender.gs` put an em dash in the client's email subject line, the email body and the PDF filename; and a stray en dash plus one in a Python script. Final state verified across every text file in the repo: no em dashes, en dashes, or dash entities. **Note:** the `.gs` files here are the repo copies. The live versions are installed in Google Apps Script and still carry the old wording until re-pasted.
14. **New logo without the city line**, `images/shared/logo-no-city.png`, rebuilt from the existing flattened logo by recomposing the monogram with the two-line wordmark and dropping "DELHI". The original `logo.png` is untouched.
15. **Ad creatives** branded for the campaign: several landscape and square variants with logo placement tuned per image, plus CTA text swaps on two.
16. **New working rule, in force from today:** all work happens as local commits on a dated branch (`work/YYYY-MM-DD`), and nothing reaches `main` without explicit approval, one deploy a day at most. Netlify build credits were being burned by multiple pushes in a sitting.

### Audit result at end of day
Across all 14 pages: no broken links, no broken images, no JavaScript errors, one H1 per page, all images have alt text, valid structured data on every page, zero genuine Content-Security-Policy violations (the ones that appear when opening files directly from disk are a `file://` artifact and do not occur over HTTP, verified by serving the site locally). Enquiry modal, Escape-to-close, mobile menu, FAQ deep links and all three payment buttons tested working.

### Video Consultation rolled out across the site
17. **The new tier existed only on `booking.html`**, which meant a paying service was invisible to anyone who did not land directly on the booking page. Fixed in four places: a fourth card on About (heading changed from "Three doors" to "Four doors", grid relaid 4-up, 2x2 at tablet, single column on mobile); a new "What is the video consultation?" FAQ answer placed between the discovery call and the in-person session; the matching entry in the FAQ structured data; and the "Do you work with clients outside Delhi?" answer, which previously said only "online sessions are available" without naming anything bookable and now points at the forty-five minute video consultation. Copy draws the distinction deliberately: the discovery call decides whether to work together, the video consultation does the work.

### Known gaps carried into tomorrow
- Video Consultation and In Person Consultation have not had a live test payment the way Discovery Call has.
- Google Analytics is still on a placeholder Measurement ID, so there is still no visitor data.
- Razorpay "Success Message" wording, Arpita was adding it on the Razorpay side; not confirmed complete.
- Presence Quotient copyright registration / trademark filing, still not started.

---

*This file is written by hand after each batch of changes, it is not auto-generated from git history, so treat git's own commit log as the exact record and this as the readable summary of it.*
