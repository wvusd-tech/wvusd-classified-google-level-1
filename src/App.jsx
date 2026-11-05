import React, { useState, useEffect } from 'react';
import IntakeScreen, { isValidWvusdEmail } from './components/IntakeScreen';
import McqSection from './components/McqSection';
import ResultsView from './components/ResultsView';
import PracticalSection from './components/PracticalSection';
import {
  getOrCreateActiveQuestions,
  resetAndDrawNewActiveQuestions,
} from './utils/examRandomizer';
import {
  GoogleGLogo,
  FourColorTopBar,
  FloatingWorkspaceBackground,
  MultiColorGoogleWord,
} from './components/GoogleLogos';
import { User, RotateCcw, Award, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'wvusd_google_level_1_exam_state_v1';

const DEFAULT_STATE = {
  stage: 'intake', // 'intake' | 'quiz' | 'results' | 'practical'
  candidate: null,
  answers: {}, // { [questionId]: selectedOptionIndex }
  flagged: {}, // { [questionId]: boolean }
  currentIndex: 0,
  practicalState: {
    sheetUrl: '',
    completedTasks: {},
    gradingResult: null,
  },
};

export default function App() {
  // Load or initialize the 25 stratified active questions persisted under `wvusd_level1_active_questions`
  const [activeQuestions, setActiveQuestions] = useState(() =>
    getOrCreateActiveQuestions()
  );

  const [examState, setExamState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored = { ...DEFAULT_STATE, ...parsed };
        if (restored.stage !== 'intake' && !isValidWvusdEmail(restored.candidate?.email)) {
          restored.stage = 'intake';
        }
        return restored;
      }
    } catch (err) {
      console.error('Could not load saved exam state from localStorage:', err);
    }
    return DEFAULT_STATE;
  });

  // Persist exam progress to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(examState));
    } catch (err) {
      console.error('Could not save exam state to localStorage:', err);
    }
  }, [examState]);

  // Compute MCQ score out of 25 for passing to PracticalSection
  const mcqScore = activeQuestions.reduce((acc, q) => {
    const userChoice = examState.answers[q.id];
    const correctAnswerString = q.correctAnswer || q.options[q.correctIndex];
    const selectedAnswerString =
      typeof userChoice === 'number' ? q.options[userChoice] : userChoice;
    if (selectedAnswerString !== undefined && selectedAnswerString === correctAnswerString) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const handleStartExam = (candidateData) => {
    // Ensure a valid 25-question stratified draw exists in `wvusd_level1_active_questions`
    const currentDraw = getOrCreateActiveQuestions();
    setActiveQuestions(currentDraw);
    setExamState((prev) => ({
      ...prev,
      stage: 'quiz',
      candidate: {
        ...candidateData,
        name: candidateData.name || candidateData.fullName || '',
        fullName: candidateData.fullName || candidateData.name || '',
      },
    }));
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setExamState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: optionIndex,
      },
    }));
  };

  const handleToggleFlag = (questionId) => {
    setExamState((prev) => ({
      ...prev,
      flagged: {
        ...prev.flagged,
        [questionId]: !prev.flagged[questionId],
      },
    }));
  };

  const handleNavigate = (newIndex) => {
    setExamState((prev) => ({
      ...prev,
      currentIndex: newIndex,
    }));
  };

  const handleSubmitExam = () => {
    setExamState((prev) => ({
      ...prev,
      stage: 'results',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPractical = () => {
    setExamState((prev) => ({
      ...prev,
      stage: 'practical',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToResults = () => {
    setExamState((prev) => ({
      ...prev,
      stage: 'results',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePracticalState = (newPracticalData) => {
    setExamState((prev) => ({
      ...prev,
      practicalState: {
        ...prev.practicalState,
        ...newPracticalData,
      },
    }));
  };

  const handleResetExam = () => {
    // Clear `wvusd_level1_active_questions` and draw a fresh random stratified set of 25
    const freshDraw = resetAndDrawNewActiveQuestions();
    setActiveQuestions(freshDraw);

    const freshState = {
      stage: 'intake',
      candidate: examState.candidate
        ? {
            name: examState.candidate.name || examState.candidate.fullName,
            fullName: examState.candidate.fullName || examState.candidate.name,
            site: examState.candidate.site,
            email: examState.candidate.email,
          }
        : null,
      answers: {},
      flagged: {},
      currentIndex: 0,
      practicalState: {
        sheetUrl: '',
        completedTasks: {},
        gradingResult: null,
      },
    };
    setExamState(freshState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
    } catch {
      // ignore storage errors
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#F8FAFC] text-slate-800">
      {/* Decorative Floating Google Workspace Product Logos in Corners */}
      <FloatingWorkspaceBackground />

      {/* Sticky Top Navigation Header with 4-Color Segmented Top Border */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs print:hidden">
        <FourColorTopBar height="h-1.5" />
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Left Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center">
              <GoogleGLogo className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  WVUSD Classified
                </span>
                <MultiColorGoogleWord className="text-sm sm:text-base" />
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight hidden xs:inline">
                  Certification
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#34A853]" />
                <span>
                  {examState.stage === 'practical'
                    ? 'Level 1 • Part 2: Hands-On Practical Exam'
                    : 'Level 1: Foundations Exam'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Candidate Status & Reset Controls */}
          <div className="flex items-center gap-2.5">
            {examState.candidate && examState.stage !== 'intake' && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/70 text-xs font-bold text-slate-700">
                <User className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>{examState.candidate.fullName || examState.candidate.name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 truncate max-w-[180px]">
                  {examState.candidate.site}
                </span>
              </div>
            )}

            {examState.stage !== 'intake' && (
              <button
                type="button"
                onClick={handleResetExam}
                title="Retake / Reset Exam & Draw Fresh 25 Questions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#EA4335] bg-slate-100 hover:bg-red-50 border border-slate-200/80 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake / Reset Exam</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {examState.stage === 'intake' && (
          <IntakeScreen
            candidate={examState.candidate}
            onStartExam={handleStartExam}
          />
        )}

        {examState.stage === 'quiz' && (
          <McqSection
            questions={activeQuestions}
            answers={examState.answers}
            flagged={examState.flagged}
            currentIndex={examState.currentIndex}
            onSelectAnswer={handleSelectAnswer}
            onToggleFlag={handleToggleFlag}
            onNavigate={handleNavigate}
            onSubmitExam={handleSubmitExam}
          />
        )}

        {examState.stage === 'results' && (
          <ResultsView
            questions={activeQuestions}
            candidate={examState.candidate}
            answers={examState.answers}
            onProceedToPractical={handleProceedToPractical}
            onResetExam={handleResetExam}
          />
        )}

        {examState.stage === 'practical' && (
          <PracticalSection
            candidate={examState.candidate}
            mcqScore={mcqScore}
            totalMcq={activeQuestions.length}
            savedPracticalState={examState.practicalState}
            onUpdatePracticalState={handleUpdatePracticalState}
            onBackToResults={handleBackToResults}
            onResetExam={handleResetExam}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 px-4 text-center text-xs font-medium text-slate-400 border-t border-slate-200/60 bg-white/70 backdrop-blur-xs print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#4285F4]" />
            <span>Walnut Valley Unified School District • Classified Google Workspace Training</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
            <span>Auto-Save Enabled (localStorage)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
