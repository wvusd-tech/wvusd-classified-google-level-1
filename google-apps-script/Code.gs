/**
 * ============================================================================
 * WVUSD Classified Google Workspace Certification — Level 1: Foundations
 * Google Sheets Score Receiver (Apps Script `doPost(e)`)
 * Target Spreadsheet ID: 1o4GHw7cTs0TSaIBVLvo2IOWVur2xLzdOoxEMeRyWqbw
 * ============================================================================
 */

const SPREADSHEET_ID = '1o4GHw7cTs0TSaIBVLvo2IOWVur2xLzdOoxEMeRyWqbw';
const SHEET_NAME = 'Level 1 Scores';
const ALLOWED_DOMAINS = ['wvusd.org'];

const LEVEL_1_BADGE_URL =
  'https://res.cloudinary.com/djv9u4054/image/upload/v1793922959/Gemini_Generated_Image_bjrvwybjrvwybjrv_chojr1.jpg';

const HEADERS = [
  'Timestamp',
  'Full Name',
  'WVUSD Email',
  'School Site / Department',
  'Score (%)',
  'Correct Out of 25',
  'Status',
  'Chrome Browser (3)',
  'Tasks & Keep (3)',
  'Google Drive (4)',
  'Google Docs (4)',
  'Google Chat & Spaces (2)',
  'Google Sheets (4)',
  'Google Forms (3)',
  'Google Slides (2)',
  'Missed Question IDs',
  'Attempt Started At',
  'Practical Score',
  'Practical Sheet URL',
  'Badge Emailed'
];

/**
 * Handles incoming POST requests from the WVUSD Level 1 Exam Web App.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait up to 10s so concurrent exam submissions never overwrite each other

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'No payload received.' });
    }

    const data = JSON.parse(e.postData.contents);
    const email = String(data.email || data.candidateEmail || '').trim().toLowerCase();
    const emailDomain = email.split('@')[1] || '';

    // Server-side domain verification: only @wvusd.org allowed
    if (!ALLOWED_DOMAINS.includes(emailDomain)) {
      return jsonResponse({
        status: 'error',
        message: 'Unauthorized email domain. Only @wvusd.org accounts are permitted.'
      });
    }

    const fullName = data.fullName || data.candidateName || 'WVUSD Candidate';
    const site = data.site || data.schoolSite || '';

    // If explicitly requested only to send/resend the Level 1 badge email
    if (data.action === 'send_badge_only') {
      const badgeSent = sendLevel1BadgeEmail({
        email: email,
        fullName: fullName,
        site: site,
        mcqSummary: data.mcqSummary || ((data.correctCount ?? 20) + ' / ' + (data.totalQuestions ?? 25)),
        practicalSummary: data.practicalScore !== undefined ? (data.practicalScore + ' / 100') : ''
      });
      return jsonResponse({
        status: 'success',
        badgeEmailed: badgeSent,
        badgeUrl: LEVEL_1_BADGE_URL,
        message: badgeSent
          ? 'Level 1 Certification Badge emailed to ' + email
          : 'Processed request, but could not send email.'
      });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create the 'Level 1 Scores' tab and styled header row automatically if it doesn't exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285F4');
      headerRange.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    const modules = data.moduleBreakdown || {};
    const timestamp = new Date();
    const mcqSummary = (data.correctCount ?? 0) + ' / ' + (data.totalQuestions ?? 25);
    const practicalSummary =
      data.practicalScore !== undefined && data.practicalScore !== null
        ? data.practicalScore + ' / 100'
        : '';

    let badgeEmailed = false;
    if (data.passed && data.sendBadgeEmail !== false) {
      badgeEmailed = sendLevel1BadgeEmail({
        email: email,
        fullName: fullName,
        site: site,
        mcqSummary: mcqSummary + (typeof data.percentage === 'number' ? ' (' + data.percentage + '%)' : ''),
        practicalSummary: practicalSummary
      });
    }

    const row = [
      timestamp,
      fullName,
      email,
      site,
      typeof data.percentage === 'number' ? data.percentage + '%' : '',
      mcqSummary,
      data.passed ? 'PASSED' : 'NEEDS REVIEW',
      modules['Chrome Browser'] || '0/3',
      modules['Tasks & Keep'] || '0/3',
      modules['Google Drive'] || '0/4',
      modules['Google Docs'] || '0/4',
      modules['Google Chat & Spaces'] || '0/2',
      modules['Google Sheets'] || '0/4',
      modules['Google Forms'] || '0/3',
      modules['Google Slides'] || '0/2',
      Array.isArray(data.missedQuestionIds) ? data.missedQuestionIds.join(', ') : '',
      data.startedAt || '',
      practicalSummary,
      data.sheetUrl || '',
      badgeEmailed ? 'YES' : 'NO'
    ];

    sheet.appendRow(row);

    return jsonResponse({
      status: 'success',
      badgeEmailed: badgeEmailed,
      badgeUrl: LEVEL_1_BADGE_URL,
      message: badgeEmailed
        ? 'Score recorded in Google Sheet and Level 1 Badge emailed to ' + email + '.'
        : 'Score recorded in Google Sheet.',
      timestamp: timestamp.toISOString()
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Emails the official WVUSD Google Workspace Level 1 Badge to the tester when they pass the exam.
 * Embeds the Cloudinary badge image in the HTML body and also attaches the badge image file.
 */
function sendLevel1BadgeEmail(opts) {
  try {
    const email = opts.email;
    const fullName = opts.fullName || 'WVUSD Colleague';
    const site = opts.site || 'WVUSD';
    const mcqSummary = opts.mcqSummary || 'Passed';
    const practicalSummary = opts.practicalSummary || '';
    const badgeUrl = LEVEL_1_BADGE_URL;

    const subject = 'Congratulations! Your Official WVUSD Google Workspace Level 1 Certification Badge';

    const practicalRowHtml = practicalSummary
      ? '<tr><td style="padding:6px 0;color:#64748B;font-size:13px;">Part 2 Practical Score:</td>' +
        '<td style="padding:6px 0;color:#0F9D58;font-weight:700;font-size:13px;text-align:right;">' +
        practicalSummary +
        '</td></tr>'
      : '';

    const htmlBody =
      '<div style="font-family:\'Google Sans\',Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8FAFC;padding:24px;border-radius:16px;border:1px solid #E2E8F0;">' +
        '<div style="height:6px;background:linear-gradient(90deg,#4285F4 0% 25%,#EA4335 25% 50%,#FBBC05 50% 75%,#34A853 75% 100%);border-radius:6px 6px 0 0;margin:-24px -24px 20px -24px;"></div>' +
        '<div style="background:#FFFFFF;border-radius:14px;padding:28px;border:1px solid #E2E8F0;text-align:center;">' +
          '<p style="margin:0 0 6px 0;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#4285F4;">Walnut Valley Unified School District</p>' +
          '<h1 style="margin:0 0 10px 0;font-size:24px;color:#0F172A;">Congratulations, ' + fullName + '!</h1>' +
          '<p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#475569;">' +
            'You have officially passed the <strong>WVUSD Classified Google Workspace Level 1: Foundations Exam</strong>! ' +
            'Below is your official digital badge recognizing your mastery across WVUSD\'s 8 core Google Workspace tools.' +
          '</p>' +
          '<div style="margin:20px auto;padding:16px;background:#F8FAFC;border-radius:16px;border:1px solid #E2E8F0;display:inline-block;">' +
            '<img src="' + badgeUrl + '" alt="WVUSD Google Workspace Level 1 Certified Badge" width="260" style="display:block;max-width:100%;height:auto;border-radius:12px;margin:0 auto;" />' +
          '</div>' +
          '<table style="width:100%;max-width:420px;margin:18px auto;border-collapse:collapse;border-top:1px solid #E2E8F0;border-bottom:1px solid #E2E8F0;padding:10px 0;">' +
            '<tr><td style="padding:6px 0;color:#64748B;font-size:13px;">Candidate:</td><td style="padding:6px 0;color:#0F172A;font-weight:700;font-size:13px;text-align:right;">' + fullName + '</td></tr>' +
            '<tr><td style="padding:6px 0;color:#64748B;font-size:13px;">School Site / Dept:</td><td style="padding:6px 0;color:#0F172A;font-weight:700;font-size:13px;text-align:right;">' + site + '</td></tr>' +
            '<tr><td style="padding:6px 0;color:#64748B;font-size:13px;">Part 1 Assessment:</td><td style="padding:6px 0;color:#34A853;font-weight:700;font-size:13px;text-align:right;">' + mcqSummary + '</td></tr>' +
            practicalRowHtml +
          '</table>' +
          '<p style="margin:18px 0 0 0;font-size:13px;color:#64748B;line-height:1.5;">' +
            'We have also attached your Level 1 Badge image file to this email so you can download it or add it directly to your WVUSD Gmail signature!' +
          '</p>' +
        '</div>' +
      '</div>';

    const plainBody =
      'Congratulations, ' + fullName + '!\n\n' +
      'You have passed the WVUSD Classified Google Workspace Level 1: Foundations Exam.\n' +
      'School Site / Department: ' + site + '\n' +
      'Part 1 Score: ' + mcqSummary + '\n' +
      (practicalSummary ? 'Part 2 Practical Score: ' + practicalSummary + '\n' : '') +
      '\nView or download your official Level 1 Badge here:\n' + badgeUrl + '\n';

    const mailOptions = {
      to: email,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'WVUSD Google Workspace Certification'
    };

    try {
      const response = UrlFetchApp.fetch(badgeUrl);
      const badgeBlob = response.getBlob().setName('WVUSD-Google-Workspace-Level-1-Badge.jpg');
      mailOptions.attachments = [badgeBlob];
    } catch (fetchErr) {
      // If fetching attachment fails, still send the HTML email with the embedded image URL
    }

    MailApp.sendEmail(mailOptions);
    return true;
  } catch (mailErr) {
    Logger.log('Failed to send Level 1 Badge email: ' + mailErr);
    return false;
  }
}

/**
 * Optional GET handler so visiting the Web App URL in a browser confirms it is live.
 */
function doGet() {
  return jsonResponse({
    status: 'ok',
    service: 'WVUSD Classified Google Workspace Level 1 Score Receiver',
    spreadsheetId: SPREADSHEET_ID
  });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
