import React from 'react';
import { getOrCreateActiveQuestions, MODULE_QUOTAS } from '../utils/examRandomizer';
import {
  FourColorTopBar,
  getModuleTheme,
  GoogleGLogo,
} from './GoogleLogos';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Send,
  AlertCircle,
  Sparkles,
  Check,
  Shuffle,
} from 'lucide-react';

export default function McqSection({
  questions: propQuestions,
  answers,
  flagged,
  currentIndex,
  onSelectAnswer,
  onToggleFlag,
  onNavigate,
  onSubmitExam,
}) {
  const activeQuestions =
    Array.isArray(propQuestions) && propQuestions.length === 25
      ? propQuestions
      : getOrCreateActiveQuestions();

  const totalQuestions = activeQuestions.length;
  const currentQuestion = activeQuestions[currentIndex] || activeQuestions[0];
  const moduleTheme = getModuleTheme(currentQuestion.module);
  const ModuleIcon = moduleTheme.Icon;
  const moduleQuota = MODULE_QUOTAS[currentQuestion.module] || 3;

  // Count answered & flagged only among the active 25 questions
  const answeredCount = activeQuestions.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const flaggedCount = activeQuestions.filter((q) => !!flagged[q.id]).length;
  const allAnswered = answeredCount === totalQuestions;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const isCurrentFlagged = !!flagged[currentQuestion.id];
  const selectedOptionValue = answers[currentQuestion.id];

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleFindNextUnanswered = () => {
    const idx = activeQuestions.findIndex((q) => answers[q.id] === undefined);
    if (idx !== -1) {
      onNavigate(idx);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 relative z-10">
      {/* Top Colorful Progress Card */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 border border-slate-200/80 overflow-hidden mb-6">
        <FourColorTopBar height="h-2" />
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
              <GoogleGLogo className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Exam Progress
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#34A853]/10 text-[#137333]">
                  {answeredCount} of {totalQuestions} Answered ({progressPercent}%)
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1967D2] border border-blue-200/60">
                  <Shuffle className="w-3 h-3" />
                  Stratified 25-Question Draw
                </span>
                {flaggedCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FBBC05]/20 text-[#B06000] flex items-center gap-1">
                    <Flag className="w-3 h-3 fill-[#FBBC05]" />
                    {flaggedCount} Flagged
                  </span>
                )}
              </div>
              {/* Multi-Color Segmented Progress Bar */}
              <div className="w-full sm:w-80 md:w-96 h-3 bg-slate-100 rounded-full overflow-hidden mt-2 p-0.5 border border-slate-200/60">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(progressPercent, 3)}%`,
                    background:
                      'linear-gradient(90deg, #4285F4 0%, #EA4335 33%, #FBBC05 66%, #34A853 100%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Action / Status */}
          <div className="flex items-center gap-2.5">
            {!allAnswered ? (
              <button
                type="button"
                onClick={handleFindNextUnanswered}
                className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4 text-[#4285F4]" />
                <span>Jump to Unanswered ({totalQuestions - answeredCount} left)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmitExam}
                className="text-sm font-bold px-5 py-2.5 rounded-xl bg-[#34A853] hover:bg-[#2D9249] text-white shadow-md shadow-[#34A853]/25 transition-all flex items-center gap-2 cursor-pointer animate-bounce-subtle"
              >
                <Send className="w-4 h-4" />
                <span>Submit Completed Exam</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Quiz Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center Column: Active Question Card (8 cols) */}
        <div className="lg:col-span-8">
          <div
            className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 overflow-hidden relative transition-all duration-300"
            style={{
              boxShadow: `0 12px 32px -12px ${moduleTheme.accentHex}22`,
            }}
          >
            {/* 4-Color Top Bar */}
            <FourColorTopBar height="h-2.5" />

            {/* Module-Specific Accent Sub-Bar */}
            <div
              className="w-full h-1.5 transition-all duration-300"
              style={{ background: moduleTheme.barGradient }}
            />

            {/* Decorative Tilted Corner Product Icon Watermark inside Header */}
            <div
              className="absolute top-6 right-6 pointer-events-none select-none transform rotate-6 transition-all duration-300"
              aria-hidden="true"
            >
              <div
                className="p-3 rounded-2xl border shadow-sm flex items-center justify-center"
                style={{
                  backgroundColor: `${moduleTheme.accentHex}10`,
                  borderColor: `${moduleTheme.accentHex}30`,
                }}
              >
                <ModuleIcon className="w-11 h-11 sm:w-12 sm:h-12" />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Question Header: Module Badge + Topic + Question Number */}
              <div className="pr-16 sm:pr-20">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {/* Question Number Pill */}
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold text-white shadow-xs"
                    style={{ backgroundColor: moduleTheme.accentHex }}
                  >
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>

                  {/* Dynamic Module Badge with Product Logo */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${moduleTheme.badgeBg} ${moduleTheme.badgeText} ${moduleTheme.badgeBorder}`}
                  >
                    <ModuleIcon className="w-4 h-4 shrink-0" />
                    <span>{currentQuestion.module}</span>
                  </span>

                  {/* Topic Chip */}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {currentQuestion.topic}
                  </span>
                </div>

                {/* Question Prompt */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Answer Options List (Shuffled per exam draw) */}
              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((optionText, optionIdx) => {
                  // Support matching by either option index or option text string
                  const isSelected =
                    selectedOptionValue === optionIdx ||
                    selectedOptionValue === optionText;
                  const optionLetters = ['A', 'B', 'C', 'D'];
                  return (
                    <button
                      key={optionIdx}
                      type="button"
                      onClick={() =>
                        onSelectAnswer(currentQuestion.id, optionIdx, optionText)
                      }
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 flex items-start gap-3.5 cursor-pointer group ${
                        isSelected
                          ? 'bg-blue-50/70 border-[#4285F4] shadow-sm shadow-[#4285F4]/10'
                          : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {/* Letter Circle */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-[#4285F4] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          optionLetters[optionIdx]
                        )}
                      </div>

                      {/* Option Text */}
                      <span
                        className={`text-sm sm:text-base leading-relaxed ${
                          isSelected
                            ? 'font-bold text-slate-900'
                            : 'font-medium text-slate-700'
                        }`}
                      >
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Card Controls: Previous, Flag for Review, Next / Submit */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    currentIndex === 0
                      ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {/* Flag for Review Toggle Button */}
                <button
                  type="button"
                  onClick={() => onToggleFlag(currentQuestion.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                    isCurrentFlagged
                      ? 'bg-[#FBBC05]/20 border-[#FBBC05] text-[#B06000] shadow-2xs'
                      : 'bg-white hover:bg-amber-50/50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Flag
                    className={`w-4 h-4 ${
                      isCurrentFlagged
                        ? 'fill-[#FBBC05] text-[#B06000]'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{isCurrentFlagged ? 'Flagged for Review' : 'Flag for Review'}</span>
                </button>

                {/* Next or Submit */}
                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-md shadow-[#4285F4]/20 transition-all cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmitExam}
                    disabled={!allAnswered}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      allAnswered
                        ? 'bg-[#34A853] hover:bg-[#2D9249] text-white shadow-md shadow-[#34A853]/25 cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {allAnswered
                        ? 'Submit Exam'
                        : `${totalQuestions - answeredCount} Unanswered`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1–25 Question Navigator Grid & Module Info Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Question Navigator Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
            <FourColorTopBar height="h-2" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Question Navigator (1–25)
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {answeredCount}/{totalQuestions} Done
                </span>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-1.5 mb-4 text-[11px] font-bold">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#4285F4]/10 text-[#1967D2]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#34A853]/10 text-[#137333]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FBBC05]/20 text-[#B06000]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05]" />
                  <span>Flagged</span>
                </div>
              </div>

              {/* 5x5 Pill Grid for Questions 1–25 */}
              <div className="grid grid-cols-5 gap-2">
                {activeQuestions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = !!flagged[q.id];

                  let pillStyle =
                    'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200';
                  if (isCurrent) {
                    pillStyle =
                      'bg-[#4285F4] text-white border-[#4285F4] ring-3 ring-[#4285F4]/30 shadow-sm';
                  } else if (isFlagged) {
                    pillStyle =
                      'bg-[#FBBC05] text-slate-900 border-[#F4B400] shadow-xs';
                  } else if (isAnswered) {
                    pillStyle =
                      'bg-[#34A853] text-white border-[#34A853] shadow-2xs';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => onNavigate(idx)}
                      title={`Question ${idx + 1}: ${q.module}${
                        isFlagged ? ' (Flagged)' : ''
                      }${isAnswered ? ' (Answered)' : ' (Unanswered)'}`}
                      className={`relative h-10 rounded-xl font-extrabold text-xs border transition-all flex items-center justify-center cursor-pointer ${pillStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && isCurrent && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FBBC05] border-2 border-white" />
                      )}
                      {isFlagged && isAnswered && !isCurrent && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#34A853] border-2 border-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Exam Full-Width Button */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onSubmitExam}
                  disabled={!allAnswered}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    allAnswered
                      ? 'bg-[#34A853] hover:bg-[#2D9249] text-white shadow-lg shadow-[#34A853]/25 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {allAnswered
                      ? 'Submit All 25 Answers'
                      : `Answer ${totalQuestions - answeredCount} More to Submit`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Module Spotlight Card */}
          <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200/80 overflow-hidden p-5">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl border shrink-0"
                style={{
                  backgroundColor: `${moduleTheme.accentHex}12`,
                  borderColor: `${moduleTheme.accentHex}30`,
                }}
              >
                <ModuleIcon className="w-8 h-8" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FBBC05]" />
                  Active Curriculum Module ({moduleQuota} of 5 Drawn)
                </div>
                <div className="text-base font-extrabold text-slate-800">
                  {currentQuestion.module}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Focus: {currentQuestion.topic}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
