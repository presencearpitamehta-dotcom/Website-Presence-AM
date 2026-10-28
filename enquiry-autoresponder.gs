/**
 * BRANDED ENQUIRY AUTO-RESPONDER  ·  arpitamehta.co   ·   FINAL
 * ==================================================================
 * Replies to every enquiry, download and assessment on your site,
 * in your colours, with wording tailored to what they actually asked
 * about, and tells you, with a one-tap reply button.
 *
 * COVERAGE (audited against the live site, 25 Oct 2026)
 *   9 enquiry types ... General, Presence Edit, Executive Edge,
 *                       Social Table, Debut, One to One,
 *                       AI for Branding & Business,
 *                       Corporate Group Training,
 *                       Soft Skills & Corporate Training
 *   1 download ....... First 90 Days Playbook
 *   7 quiz personas .. Lead with authority, Win bigger clients,
 *                      Launch my career, Step into a new chapter,
 *                      Elevate my personal presence,
 *                      Make a memorable impression,
 *                      Organisation / Team
 *   4 bands .......... Overlooked, Emerging, Polished, Magnetic
 *
 *   Anything NOT on these lists still gets a correct, sensible
 *   email. Add a programme to the site later and nothing breaks.
 *
 * INSTALL
 *   1. Open "Presence Quotient Leads (Responses)" signed in as
 *      presence.arpitamehta@gmail.com
 *   2. Extensions -> Apps Script
 *   3. Delete what is there, paste all of this, Save
 *   4. Triggers (alarm clock) -> Add Trigger:
 *        Function ....... onFormSubmit
 *        Event source ... From spreadsheet
 *        Event type ..... On form submit
 *   5. Save, authorise once
 *   6. Submit a test enquiry from your live site
 *
 * TO EDIT THE WORDING later, change ENQUIRIES and BANDS below.
 * Nothing else needs touching.
 * ==================================================================
 */

var OWNER     = 'presence.arpitamehta@gmail.com';
var FROM_NAME = 'Arpita Mehta';
var SITE      = 'https://arpitamehta.co';
var LOGO      = 'https://arpitamehta.co/images/shared/logo.png';
var CALL_LINK = 'https://cal.com/arpita-mehta-presence-consultant/discoverycall';

/* One auto-reply per person per this many minutes.
   Someone who takes the quiz, grabs the playbook and then enquires in
   one sitting is your best lead. They should not get three emails
   from you in ten minutes. They get one. You still get told about all
   three, with a flag saying how engaged they are. */
var REPLY_GAP_MINUTES = 180;

/* ---- one tailored sentence per enquiry type -------------------- */
/* Key must match the enquiry name on the site. Unlisted keys fall
   back to a generic line, so nothing ever breaks.                  */
var ENQUIRIES = {
  'The Presence Edit (Cohort)':
    { line: 'The Presence Edit is the full rebuild. Image, presence and the way you are read in a room, over a licensed cohort rather than a single session.',
      team: false },
  'The Executive Edge (Cohort)':
    { line: 'The Executive Edge is for people whose results already speak, and who are tired of watching less capable colleagues get heard first.',
      team: false },
  'The Social Table (Cohort)':
    { line: 'The Social Table covers what nobody teaches and everybody is judged on: wine, the table, the room, and the quiet grammar of hosting and being hosted.',
      team: false },
  'The Debut (Cohort)':
    { line: 'The Debut is for the first real step out, the moment you want to be seen clearly and seen on purpose.',
      team: false },
  'One to One Presence Consulting':
    { line: 'One to one work is built entirely around you, which means the first thing I need to understand is where you are now and what the next room looks like.',
      team: false },
  'AI for Branding & Business':
    { line: 'This is for business owners and founders who want to build a brand and marketing that truly reflect the value of what they do, using AI as a smarter way to get there. I help you navigate the early decisions that can feel overwhelming when you’re figuring it all out alone.',
      team: false },
  'Corporate Group Training':
    { line: 'Corporate work is shaped around your group rather than delivered off a shelf, so the useful first step is understanding who is in the room and what needs to change.',
      team: true },
  'Soft Skills & Corporate Training':
    { line: 'These sessions are built for the specific team, the specific gap and the specific outcome, which is why I never quote before understanding the brief.',
      team: true },
  'General Enquiry':
    { line: 'Whatever brought you here, the quickest way forward is usually a short conversation about where you are now and what you want to be true in six months.',
      team: false }
};

/* ---- one line per band, so the quiz email is never tone-deaf ---- */
var BANDS = {
  'The Overlooked':
    'There is a great deal of headroom in that score, and that is genuinely good news. The first changes you make will be the most visible ones you ever make.',
  'The Emerging':
    'You are well past the beginning. What separates this band from the next is rarely talent. It is consistency, and being deliberate where you are currently being instinctive.',
  'The Polished':
    'You are already doing most of this well. What remains is the distance between competent and memorable, and that distance is smaller than it looks.',
  'The Magnetic':
    'That is a high score, and it changes the work. At this level it is less about building presence and more about protecting it as the rooms get bigger.'
};

/* Brand palette, straight from the site */
var C = {
  linen:'#F8F4EE', ivory:'#FBF7F3', parchment:'#DED4CA',
  ink:'#2A1F14', taupe:'#3D2F1D', taupeLt:'#6B5D50',
  cognac:'#9C5A4C', gold:'#AE957E', white:'#FFFFFF'
};
var DISP = "Georgia,'Times New Roman',serif";
var BODY = "'Jost',-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif";

/* ================================================================ */

function onFormSubmit(e) {
  var v = (e && e.namedValues) ? e.namedValues : {};
  var g = function (k) { return (v[k] && v[k][0]) ? String(v[k][0]).trim() : ''; };

  var lead = {
    name: g('Name'), email: g('Email'), phone: g('Phone'), goal: g('Goal'),
    score: g('PQ Score'), band: g('Band'), strength: g('Strength'),
    weakness: g('Weakness'), rec: g('Recommended')
  };
  lead.kind = classify(lead);
  lead.prog = stripEnq(lead.goal);
  lead.actions = countToday(lead.email, e);

  /* --- one reply per person per REPLY_GAP_MINUTES --- */
  lead.replied = false;
  if (isEmail(lead.email)) {
    var key = 'r_' + lead.email.toLowerCase().trim();
    var cache = CacheService.getScriptCache();
    if (cache.get(key)) {
      Logger.log('Auto-reply suppressed, already written to ' + lead.email + ' recently');
    } else {
      try {
        MailApp.sendEmail({ to: lead.email, name: FROM_NAME, replyTo: OWNER,
          subject: replySubject(lead), htmlBody: replyBody(lead) });
        cache.put(key, '1', REPLY_GAP_MINUTES * 60);
        lead.replied = true;
      } catch (err) { Logger.log('Auto-reply failed: ' + err); }
    }
  }

  /* --- you always hear about it --- */
  try {
    MailApp.sendEmail({ to: OWNER, name: 'arpitamehta.co',
      replyTo: isEmail(lead.email) ? lead.email : OWNER,
      subject: ownerSubject(lead), htmlBody: ownerBody(lead) });
  } catch (err) { Logger.log('Owner alert failed: ' + err); }
}

/** How many times has this address submitted anything today? */
function countToday(email, e) {
  if (!isEmail(email)) return 1;
  try {
    var sheet = e.range.getSheet();
    var rows  = sheet.getDataRange().getValues();
    var start = new Date(); start.setHours(0, 0, 0, 0);
    var want  = email.toLowerCase().trim();
    var n = 0;
    for (var i = 1; i < rows.length; i++) {
      var ts = rows[i][0], em = String(rows[i][2] || '').toLowerCase().trim();
      if (em === want && ts instanceof Date && ts >= start) n++;
    }
    return n || 1;
  } catch (err) {
    Logger.log('countToday failed: ' + err);
    return 1;
  }
}

function classify(l) {
  var s = (l.goal || '').toLowerCase();
  if (s.indexOf('playbook') > -1) return 'playbook';
  if (s.indexOf('enquiry') > -1)  return 'enquiry';
  if (l.score)                    return 'quotient';
  return 'other';
}
function isEmail(s){ return !!s && s.indexOf('@') > 0 && s.indexOf('.') > 0; }
function firstName(n){ return (n || '').split(' ')[0] || 'there'; }
function stripEnq(g){ return (g || '').replace(/^Enquiry:\s*/i, '').trim(); }
function enqInfo(prog) {
  if (ENQUIRIES[prog]) return ENQUIRIES[prog];
  var team = /corporate|team|organisation|organization|group/i.test(prog);
  return { line: team
      ? 'Work for a group is shaped around the people in the room rather than delivered off a shelf, so the first step is understanding the brief.'
      : 'The quickest way forward is usually a short conversation about where you are now and what you want to be true in six months.',
    team: team };
}
function isTeam(l) {
  return /organisation|organization|team/i.test(l.goal || '') || enqInfo(l.prog).team;
}

/* ---------------- subjects ---------------- */

function replySubject(l) {
  if (l.kind === 'quotient') return 'Your Presence Quotient, and where I would begin';
  if (l.kind === 'playbook') return 'Your First 90 Days Playbook';
  if (l.kind === 'enquiry')  return 'About ' + (l.prog || 'your enquiry');
  return 'Thank you for getting in touch';
}
function ownerSubject(l) {
  var who = l.name || 'Someone';
  if (l.kind === 'quotient') return (isTeam(l) ? 'TEAM · ' : '') + 'PQ ' + (l.score || '?') + ' · ' + who + ' · ' + (l.band || '');
  if (l.kind === 'playbook') return 'Playbook download · ' + who;
  if (l.kind === 'enquiry')  return (isTeam(l) ? 'TEAM ENQUIRY · ' : 'ENQUIRY · ') + (l.prog || '') + ' · ' + who;
  return 'New submission · ' + who;
}

/* ---------------- building blocks ---------------- */

function para(t) {
  return '<p style="margin:0 0 16px;font-family:' + BODY + ';font-size:15px;line-height:1.7;color:' + C.taupe + '">' + t + '</p>';
}
function lede(t) {
  return '<p style="margin:0 0 22px;font-family:' + DISP + ';font-size:21px;line-height:1.45;color:' + C.ink + '">' + t + '</p>';
}
function rule() {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
       + '<td style="border-top:1px solid ' + C.parchment + ';font-size:0;line-height:0;height:1px">&nbsp;</td></tr></table>';
}
function button(label, href) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 6px"><tr>'
       + '<td style="background:' + C.cognac + '"><a href="' + href + '" style="display:inline-block;padding:14px 30px;'
       + 'font-family:' + BODY + ';font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:' + C.white
       + ';text-decoration:none">' + label + '</a></td></tr></table>';
}
function statCell(label, val) {
  return '<td width="50%" style="padding:14px 8px 0;border-top:1px solid ' + C.parchment + ';text-align:center">'
       + '<div style="font-family:' + BODY + ';font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:' + C.taupeLt + ';padding-bottom:5px">' + label + '</div>'
       + '<div style="font-family:' + DISP + ';font-size:16px;color:' + C.ink + '">' + val + '</div></td>';
}
function scoreCard(l) {
  var cells = '';
  if (l.strength) cells += statCell('Strongest', l.strength);
  if (l.weakness) cells += statCell('Most room', l.weakness);
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
       + 'style="margin:4px 0 24px;background:' + C.ivory + ';border:1px solid ' + C.parchment + '"><tr>'
       + '<td style="padding:30px 24px 24px;text-align:center">'
       + '<div style="font-family:' + BODY + ';font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:' + C.taupeLt + '">Your Presence Quotient</div>'
       + '<div style="font-family:' + DISP + ';font-size:58px;line-height:1;color:' + C.cognac + ';padding:14px 0 8px">' + (l.score || '') + '</div>'
       + '<div style="font-family:' + DISP + ';font-size:20px;font-style:italic;color:' + C.ink + '">' + (l.band || '') + '</div>'
       + (cells ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px"><tr>' + cells + '</tr></table>' : '')
       + '</td></tr></table>';
}
function recStrip(rec) {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px"><tr>'
       + '<td style="border-left:3px solid ' + C.gold + ';padding:4px 0 4px 16px">'
       + '<div style="font-family:' + BODY + ';font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:' + C.taupeLt + ';padding-bottom:4px">Where I would begin</div>'
       + '<div style="font-family:' + DISP + ';font-size:18px;color:' + C.ink + '">' + rec + '</div></td></tr></table>';
}

/* ---------------- the email they receive ---------------- */

function replyBody(l) {
  var inner = '', team = isTeam(l);

  if (l.kind === 'quotient') {
    inner += lede('Dear ' + firstName(l.name) + ', thank you for taking the Presence Quotient.');
    inner += scoreCard(l);
    if (l.band && BANDS[l.band]) inner += para(BANDS[l.band]);
    if (l.weakness) inner += para('The dimension with the most room in it is <strong style="color:' + C.ink + '">' + l.weakness + '</strong>, and that is where I would start. It is usually the one that changes how a room reads you fastest.');
    if (l.rec) inner += recStrip(l.rec);
    inner += para(team
      ? 'For a team, the useful next step is a short conversation about who is in the room and what needs to be different afterwards.'
      : 'If you would like to talk it through, the fifteen minute introductory call is the simplest way in.');

  } else if (l.kind === 'playbook') {
    inner += lede('Dear ' + firstName(l.name) + ', your copy of <em>The First 90 Days</em> is on its way.');
    inner += para('It is also waiting for you here: <a href="' + SITE + '/resources" style="color:' + C.cognac + '">arpitamehta.co/resources</a>');
    inner += para('Read the section on the first fortnight before anything else. It is the part most people skip, and the part that decides how the rest of the year goes.');
    inner += rule();
    inner += para('<span style="font-family:' + DISP + ';font-size:17px;color:' + C.ink + '">Where do you stand right now?</span><br>The Presence Quotient takes about four minutes and gives you a score out of a hundred: <a href="' + SITE + '/assessment" style="color:' + C.cognac + '">arpitamehta.co/assessment</a>');

  } else if (l.kind === 'enquiry') {
    var info = enqInfo(l.prog);
    inner += lede('Dear ' + firstName(l.name) + ', thank you for your enquiry about ' + (l.prog || 'working together') + '.');
    inner += para(info.line);
    inner += para(info.team
      ? 'I read every one of these myself and will come back to you personally within one to two working days, with questions about your group and what a session would involve.'
      : 'I read every one of these myself and will come back to you personally within one to two working days, with dates and what the programme involves.');
    inner += para(info.team
      ? 'If it is quicker to talk it through, you are welcome to book a short introductory call.'
      : 'If it is easier to talk, you are welcome to book a fifteen minute introductory call and we can work out together whether it is the right fit.');

  } else {
    inner += lede('Dear ' + firstName(l.name) + ', thank you for getting in touch.');
    inner += para('I read every one of these myself and will come back to you personally within one to two working days.');
  }

  inner += button(team ? 'Book a short call' : 'Book the introductory call', CALL_LINK);
  inner += '<p style="margin:18px 0 0;font-family:' + DISP + ';font-size:16px;color:' + C.ink + '">Warm regards,<br>Arpita</p>';
  return shell(inner);
}

/* ---------------- the email you receive ---------------- */

function ownerBody(l) {
  var rows = [
    ['Name', l.name], ['Email', l.email], ['Phone', l.phone],
    ['Came from', l.goal], ['Score', l.score], ['Band', l.band],
    ['Strongest', l.strength], ['Most room', l.weakness], ['Engine suggests', l.rec]
  ].filter(function (r) { return r[1]; });

  var t = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">';
  rows.forEach(function (r, i) {
    var top = i ? 'border-top:1px solid ' + C.parchment + ';' : '';
    t += '<tr><td style="padding:8px 18px 8px 0;font-family:' + BODY + ';font-size:12px;letter-spacing:.14em;'
      +  'text-transform:uppercase;color:' + C.taupeLt + ';white-space:nowrap;' + top + 'vertical-align:top">' + r[0] + '</td>'
      +  '<td style="padding:8px 0;font-family:' + DISP + ';font-size:17px;color:' + C.ink + ';' + top + '">' + r[1] + '</td></tr>';
  });
  t += '</table>';

  var head = l.kind === 'enquiry' ? 'New enquiry.'
           : l.kind === 'playbook' ? 'New playbook download.'
           : l.kind === 'quotient' ? 'New assessment completed.'
           : 'New submission.';

  var inner = lede(head);
  if (isTeam(l)) {
    inner += banner(C.cognac, 'Organisation lead. Reply personally, do not bulk email');
  }
  if (l.actions > 1) {
    inner += banner(C.ink, 'Action ' + l.actions + ' from this person today. They are actively looking');
  }
  inner += t;
  if (isEmail(l.email)) {
    inner += button('Reply to ' + firstName(l.name),
      'mailto:' + l.email + '?subject=' + encodeURIComponent('Re: ' + (l.prog || 'your enquiry')));
  }
  inner += '<p style="margin:14px 0 0;font-family:' + BODY + ';font-size:13px;color:' + C.taupeLt + '">'
        +  (l.replied
             ? 'They have already had an automatic acknowledgement from you.'
             : 'No automatic reply sent. You already wrote to them within the last ' + (REPLY_GAP_MINUTES / 60) + ' hours. This one is yours to answer.')
        +  '</p>';
  return shell(inner);
}

/** Small full-width banner used for the flags above the detail table. */
function banner(bg, text) {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px"><tr>'
       + '<td style="background:' + bg + ';padding:11px 16px">'
       + '<span style="font-family:' + BODY + ';font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:' + C.white + '">'
       + text + '</span></td></tr></table>';
}

/* ---------------- the branded shell ---------------- */

function shell(inner) {
  return '<!doctype html><html><head><meta charset="utf-8">'
  + '<meta name="viewport" content="width=device-width,initial-scale=1">'
  + '<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap" rel="stylesheet">'
  + '</head><body style="margin:0;padding:0;background:' + C.linen + '">'
  + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.linen + '"><tr>'
  + '<td align="center" style="padding:30px 14px 44px">'
  +   '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:' + C.white + ';border:1px solid ' + C.parchment + '">'
  +     '<tr><td align="center" style="padding:30px 24px 24px;background:' + C.ivory + ';border-bottom:1px solid ' + C.parchment + '">'
  +       '<img src="' + LOGO + '" alt="Arpita Mehta, Presence Consultant, Delhi" width="230" style="width:230px;max-width:72%;height:auto;display:block;border:0"></td></tr>'
  +     '<tr><td style="padding:34px 34px 30px">' + inner + '</td></tr>'
  +     '<tr><td style="padding:22px 34px 26px;background:' + C.ivory + ';border-top:1px solid ' + C.parchment + '">'
  +       '<div style="font-family:' + DISP + ';font-size:15px;color:' + C.ink + ';padding-bottom:4px">Arpita Mehta</div>'
  +       '<div style="font-family:' + BODY + ';font-size:11px;letter-spacing:.17em;text-transform:uppercase;color:' + C.taupeLt + '">Presence Consultant &middot; Delhi</div>'
  +       '<div style="font-family:' + BODY + ';font-size:13px;padding-top:12px"><a href="' + SITE + '" style="color:' + C.cognac + ';text-decoration:none">arpitamehta.co</a></div>'
  +     '</td></tr></table></td></tr></table></body></html>';
}
