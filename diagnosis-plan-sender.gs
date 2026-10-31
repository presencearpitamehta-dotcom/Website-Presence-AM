/**
 * DIAGNOSIS & PLAN SENDER + CLIENT FOLDER AUTOMATION  ·  arpitamehta.co
 * =====================================================================
 * Companion script to enquiry-autoresponder.gs — same Sheet, same Apps
 * Script project, same account. Phase 1 of "Arpita's Assistant":
 *
 *   1. You fill in My Read / Habit / Why This Programme / Session Date
 *      on a client's row, then tick "Ready to Send".
 *   2. The script fills the Diagnosis & Plan template with that row's
 *      data, saves a Doc + PDF copy into that client's own Drive
 *      folder (creating the folder the first time anyone sends them
 *      anything), emails the PDF to the client, and timestamps
 *      "Sent At" so a re-check never double-sends.
 *   3. Every client ends up with one Drive folder holding every
 *      document you've ever sent them — the start of the per-client
 *      archive you asked for.
 *
 * WHAT "THE PDF SCORECARD" MEANS HERE
 *   The scorecard your client sees on the website is rendered in
 *   their browser (html2pdf) when they click download — it never
 *   touches your server or this Sheet, so this script cannot resend
 *   that exact file. The Diagnosis & Plan document already contains
 *   the same score, band, strongest and weakest dimension in its own
 *   "Scores" panel, so for now one PDF carries both. If you want the
 *   client's original two-page scorecard (with the pattern read and
 *   their lowest-scoring item) attached as a second file, say so and
 *   I'll wire the site to save a copy server-side when it's generated
 *   — that's a separate, slightly bigger change.
 *
 * NEW COLUMNS THIS NEEDS ON "Presence Quotient Leads (Responses)"
 *   Session Date, My Read 1, My Read 2, My Read 3, Habit,
 *   Why This Programme, Ready to Send, Sent At, Status, Client Folder
 *   — add these as plain columns; make "Ready to Send" a checkbox
 *   (select the column, Insert -> Checkbox).
 *
 * INSTALL
 *   1. Open the Apps Script project already attached to this Sheet
 *      (the one running enquiry-autoresponder.gs)
 *   2. File -> New -> Script -> name it diagnosis-plan-sender
 *   3. Paste all of this, Save
 *   4. Upload Diagnosis-and-Plan-TEMPLATE.docx to Drive (it will
 *      offer to open it as a Google Doc — do that, or right-click ->
 *      Open with -> Google Docs), then copy its file ID from the
 *      address bar (the long string after /d/ in the URL) into
 *      TEMPLATE_DOC_ID below
 *   5. (Optional) Make a Drive folder to hold all client folders,
 *      and paste its ID into CLIENT_FILES_ROOT_ID — otherwise client
 *      folders are created at the top level of My Drive
 *   6. Triggers (alarm clock) -> Add Trigger:
 *        Function ....... onEditInstallable
 *        Event source ... From spreadsheet
 *        Event type ..... On edit
 *   7. Save, authorise once
 *   8. Fill one real row's new columns and tick "Ready to Send" to test
 * =====================================================================
 */

var TEMPLATE_DOC_ID       = 'PASTE_YOUR_TEMPLATE_GOOGLE_DOC_ID_HERE';
var CLIENT_FILES_ROOT_ID  = ''; // leave blank to use the top level of My Drive

var READY_COL  = 'Ready to Send';
var SENTAT_COL = 'Sent At';
var STATUS_COL = 'Status';
var FOLDER_COL = 'Client Folder';

/* ---------------- entry point: installable onEdit trigger ---------------- */

function onEditInstallable(e) {
  try {
    if (!e || !e.range) return;
    var sheet = e.range.getSheet();
    var row = e.range.getRow();
    var col = e.range.getColumn();
    if (row === 1) return; // header row

    var headers = getHeaders(sheet);
    if (headers.indexOf(READY_COL) === -1) return; // not the right sheet
    if (headers[col - 1] !== READY_COL) return;     // only react to that one column

    var val = e.range.getValue();
    if (val !== true) return;

    var data = getRowData(sheet, headers, row);
    if (data[SENTAT_COL]) return; // already sent — a re-check does nothing

    var problems = validate(data);
    if (problems.length) {
      setCell(sheet, headers, row, STATUS_COL, 'Missing: ' + problems.join(', '));
      e.range.setValue(false); // uncheck so it's obviously not sent
      return;
    }

    sendDiagnosisPlan(sheet, headers, row, data);
  } catch (err) {
    try {
      var headers2 = getHeaders(e.range.getSheet());
      setCell(e.range.getSheet(), headers2, e.range.getRow(), STATUS_COL, 'Error: ' + err.message);
      e.range.setValue(false);
    } catch (ignored) { /* last resort: fail silent rather than throw mid-edit */ }
  }
}

/* ---------------- sheet helpers ---------------- */

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}
function getRowData(sheet, headers, row) {
  var values = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
  var data = {};
  headers.forEach(function (h, i) { data[h] = values[i]; });
  return data;
}
function setCell(sheet, headers, row, headerName, value) {
  var col = headers.indexOf(headerName) + 1;
  if (col > 0) sheet.getRange(row, col).setValue(value);
}
function validate(data) {
  var required = ['Name', 'Email', 'PQ Score', 'Band', 'Strength', 'Weakness',
                   'Recommended', 'Session Date', 'My Read 1', 'Habit', 'Why This Programme'];
  return required.filter(function (k) { return !String(data[k] || '').trim(); });
}

/* ---------------- the actual generate + send ---------------- */

function sendDiagnosisPlan(sheet, headers, row, data) {
  var folder = getOrCreateClientFolder(data['Name'], data['Email']);

  var copy = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy('Diagnosis & Plan — ' + data['Name'], folder);
  var doc = DocumentApp.openById(copy.getId());
  var body = doc.getBody();

  var tags = {
    '__CLIENT_NAME__':   data['Name'],
    '__SESSION_DATE__':  formatDate(data['Session Date']),
    '__GOAL__':          data['Goal'] || '',
    '__SCORE__':         String(data['PQ Score']),
    '__BAND__':          data['Band'],
    '__STRONGEST__':     data['Strength'],
    '__WEAKEST__':       data['Weakness'],
    '__MY_READ_1__':     data['My Read 1'] || '',
    '__MY_READ_2__':     data['My Read 2'] || '',
    '__MY_READ_3__':     data['My Read 3'] || '',
    '__HABIT__':         data['Habit'],
    '__PROGRAMME__':     data['Recommended'],
    '__WHY_PROGRAMME__': data['Why This Programme'],
  };
  Object.keys(tags).forEach(function (tag) { body.replaceText(tag, safe(tags[tag])); });
  doc.saveAndClose();

  var pdf = DriveApp.getFileById(copy.getId()).getAs('application/pdf');
  pdf.setName('Diagnosis & Plan — ' + data['Name'] + '.pdf');
  folder.createFile(pdf); // standing PDF copy alongside the editable Doc

  GmailApp.sendEmail(data['Email'], 'Your Diagnosis & Plan — Arpita Mehta', 'Your session brief is attached.', {
    name: 'Arpita Mehta',
    htmlBody: clientEmailBody(data),
    attachments: [pdf],
  });

  setCell(sheet, headers, row, SENTAT_COL, new Date());
  setCell(sheet, headers, row, STATUS_COL, 'Sent');
  setCell(sheet, headers, row, FOLDER_COL, folder.getUrl());
}

function getOrCreateClientFolder(name, email) {
  var root = CLIENT_FILES_ROOT_ID ? DriveApp.getFolderById(CLIENT_FILES_ROOT_ID) : DriveApp.getRootFolder();
  var folderName = name + ' (' + email + ')';
  var existing = root.getFoldersByName(folderName);
  if (existing.hasNext()) return existing.next();
  return root.createFolder(folderName);
}

function safe(s) { return String(s === null || s === undefined ? '' : s); }
function formatDate(d) {
  if (!d) return '[Date]';
  if (Object.prototype.toString.call(d) === '[object Date]') {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'd MMMM yyyy');
  }
  return String(d);
}

/* ---------------- client email shell (same palette as enquiry-autoresponder.gs) ---------------- */

// data['Name'] comes from a client row you filled in, but the same
// pattern that bit enquiry-autoresponder.gs applies here too, so this
// stays escaped as a matter of consistent practice, not because this
// particular field is public-facing.
function escapeHtml(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function clientEmailBody(data) {
  var C = { linen: '#F8F4EE', parchment: '#DED4CA', ink: '#2A1F14', taupe: '#3D2F1D', white: '#FFFFFF' };
  var firstName = escapeHtml(String(data['Name']).split(' ')[0] || 'there');
  var inner = '<p style="margin:0 0 16px;font-family:\'Jost\',sans-serif;font-size:15px;line-height:1.7;color:' + C.taupe + '">'
    + 'Dear ' + firstName + ', attached is your session brief from today — your score, where I would begin, '
    + 'and the habit we agreed on. Keep it, it is yours.</p>'
    + '<p style="margin:18px 0 0;font-family:Georgia,\'Times New Roman\',serif;font-size:16px;color:' + C.ink + '">Warm regards,<br>Arpita</p>';
  return '<!doctype html><html><body style="margin:0;padding:0;background:' + C.linen + '">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' + C.linen + '"><tr>'
    + '<td align="center" style="padding:30px 14px 44px">'
    + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:' + C.white + ';border:1px solid ' + C.parchment + '"><tr>'
    + '<td style="padding:34px">' + inner + '</td></tr></table></td></tr></table></body></html>';
}
