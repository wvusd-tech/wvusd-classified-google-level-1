/**
 * Google Sheets Score Sync Utility
 * Target Google Sheet ID: 1o4GHw7cTs0TSaIBVLvo2IOWVur2xLzdOoxEMeRyWqbw
 *
 * Paste your deployed Google Apps Script Web App URL into `VITE_GOOGLE_SHEETS_WEBAPP_URL`
 * in `.env` (or directly into `FALLBACK_WEBAPP_URL` below).
 */

export const TARGET_SPREADSHEET_ID = '1o4GHw7cTs0TSaIBVLvo2IOWVur2xLzdOoxEMeRyWqbw';

export const LEVEL_1_BADGE_URL =
  'https://res.cloudinary.com/djv9u4054/image/upload/v1793922959/Gemini_Generated_Image_bjrvwybjrvwybjrv_chojr1.jpg';

// Deployed Google Apps Script Web App URL for capturing WVUSD Level 1 exam scores
const FALLBACK_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbx7KiKdQVgI3X2fJmJuMGIZiM9pQStJmXkPuaVn1ceq-hO0049BFQPDOtuB5OaLVMR1/exec';

export function getGoogleSheetsWebAppUrl() {
  return (
    (import.meta.env && import.meta.env.VITE_GOOGLE_SHEETS_WEBAPP_URL) ||
    FALLBACK_WEBAPP_URL
  ).trim();
}

/**
 * Posts the candidate's exam results to the Google Apps Script `doPost(e)` endpoint.
 * Uses `Content-Type: text/plain;charset=utf-8` so Google Apps Script accepts the POST
 * without triggering a CORS preflight block.
 */
export async function submitScoreToGoogleSheet(payload) {
  const url = getGoogleSheetsWebAppUrl();
  if (!url) {
    return {
      skipped: true,
      message:
        'Google Sheets Web App URL not configured yet (set VITE_GOOGLE_SHEETS_WEBAPP_URL in .env).',
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({ status: 'success' }));
  if (result.status === 'error') {
    throw new Error(result.message || 'Error saving score to Google Sheet');
  }
  return result;
}
