import questionBank from '../data/questions.json';

export const ACTIVE_QUESTIONS_STORAGE_KEY = 'wvusd_level1_active_questions';

/**
 * Exact stratified module quotas (25 questions drawn from the 40-question bank: 5 per module):
 * - Chrome Browser: 3 of 5
 * - Tasks & Keep: 3 of 5
 * - Google Drive: 4 of 5
 * - Google Docs: 4 of 5
 * - Google Chat & Spaces: 2 of 5
 * - Google Sheets: 4 of 5
 * - Google Forms: 3 of 5
 * - Google Slides: 2 of 5
 */
export const MODULE_QUOTAS = {
  'Chrome Browser': 3,
  'Tasks & Keep': 3,
  'Google Drive': 4,
  'Google Docs': 4,
  'Google Chat & Spaces': 2,
  'Google Sheets': 4,
  'Google Forms': 3,
  'Google Slides': 2,
};

/**
 * Unbiased Fisher-Yates shuffle returning a new array
 */
export function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Performs a stratified random draw of 25 questions from the 40-question bank
 * according to MODULE_QUOTAS, and shuffles the 4 answer options within each selected
 * question while tracking both the `correctAnswer` string and updated `correctIndex`.
 */
export function generateStratifiedExamQuestions(bank = questionBank) {
  const selectedQuestions = [];

  Object.entries(MODULE_QUOTAS).forEach(([moduleName, quota]) => {
    const modulePool = bank.filter((q) => q.module === moduleName);
    const shuffledPool = shuffleArray(modulePool);
    const picked = shuffledPool.slice(0, quota);

    picked.forEach((question) => {
      const correctAnswerString = question.options[question.correctIndex];
      const shuffledOptions = shuffleArray(question.options);
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswerString);

      selectedQuestions.push({
        ...question,
        options: shuffledOptions,
        correctAnswer: correctAnswerString,
        correctIndex: newCorrectIndex,
      });
    });
  });

  return selectedQuestions;
}

/**
 * Loads the persisted 25 active questions from `localStorage` (`wvusd_level1_active_questions`),
 * or draws and saves a fresh stratified 25-question set if none is valid in storage.
 */
export function getOrCreateActiveQuestions() {
  try {
    const raw = localStorage.getItem(ACTIVE_QUESTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 25) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read wvusd_level1_active_questions from localStorage:', err);
  }

  const freshDraw = generateStratifiedExamQuestions(questionBank);
  try {
    localStorage.setItem(ACTIVE_QUESTIONS_STORAGE_KEY, JSON.stringify(freshDraw));
  } catch (err) {
    console.error('Failed to save wvusd_level1_active_questions to localStorage:', err);
  }
  return freshDraw;
}

/**
 * Clears `wvusd_level1_active_questions` and draws + persists a brand-new stratified set of 25 questions.
 */
export function resetAndDrawNewActiveQuestions() {
  try {
    localStorage.removeItem(ACTIVE_QUESTIONS_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
  const freshDraw = generateStratifiedExamQuestions(questionBank);
  try {
    localStorage.setItem(ACTIVE_QUESTIONS_STORAGE_KEY, JSON.stringify(freshDraw));
  } catch {
    // ignore storage errors
  }
  return freshDraw;
}
