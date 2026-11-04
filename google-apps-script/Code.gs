/**
 * ============================================================================
 * WVUSD Classified Google Workspace Certification — Level 1: Foundations
 * Google Sheets Score Receiver (Apps Script `doPost(e)`)
 * Target Spreadsheet ID: 1o4GHw7cTs0TSaIBVLvo2IOWVur2xLzdOoxEMeRyWqbw
 * ============================================================================
 */

const SPREADSHEET_ID = '1o4GHw7cTs0TSaIBVLvo2IOWVur2xLzdOoxEMeRyWqbw';
const SHEET_NAME = 'Level 1 Scores';
const ALLOWED_DOMAINS = ['wvusd.org', 'sub.wvusd.org'];

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
  'Attempt Started At'
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
    const email = String(data.email || '').trim().toLowerCase();
    const emailDomain = email.split('@')[1] || '';

    // Server-side domain verification: only @wvusd.org or @sub.wvusd.org allowed
    if (!ALLOWED_DOMAINS.includes(emailDomain)) {
      return jsonResponse({
        status: 'error',
        message: 'Unauthorized email domain. Only @wvusd.org and @sub.wvusd.org are permitted.'
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

    const row = [
      timestamp,
      data.fullName || '',
      email,
      data.site || '',
      typeof data.percentage === 'number' ? data.percentage + '%' : '',
      (data.correctCount ?? 0) + ' / ' + (data.totalQuestions ?? 25),
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
      data.startedAt || ''
    ];

    sheet.appendRow(row);

    return jsonResponse({
      status: 'success',
      message: 'Score recorded in Google Sheet.',
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
