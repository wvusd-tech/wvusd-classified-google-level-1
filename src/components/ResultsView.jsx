import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { getOrCreateActiveQuestions } from '../utils/examRandomizer';
import {
  submitScoreToGoogleSheet,
  getGoogleSheetsWebAppUrl,
  LEVEL_1_BADGE_URL,
} from '../utils/sheetSync';
import {
  FourColorTopBar,
  getModuleTheme,
  GoogleGLogo,
  DriveTriangleLogo,
  DocsPageLogo,
  SheetsGridLogo,
} from './GoogleLogos';
import {
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  User,
  Building2,
  Mail,
  ArrowRight,
  PartyPopper,
  CloudUpload,
} from 'lucide-react';

const ORDERED_MODULES = [
  "Chrome Browser",
  "Tasks & Keep",
  "Google Drive",
  "Google Docs",
  "Google Chat & Spaces",
  "Google Sheets",
  "Google Forms",
  "Google Slides",
];

export default function ResultsView({
  questions: propQuestions,
  candidate,
  answers,
  onProceedToPractical,
  onResetExam,
}) {
  const [reviewFilter, setReviewFilter] = useState('missed'); // 'missed' | 'all'
  const [sheetSyncStatus, setSheetSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'unconfigured' | 'error'
  const hasSubmittedRef = useRef(false);

  const activeQuestions =
    Array.isArray(propQuestions) && propQuestions.length === 25
      ? propQuestions
      : getOrCreateActiveQuestions();

  const totalQuestions = activeQuestions.length;
  const passingCount = 20; // 80% of 25

  // Compute total score and per-module breakdown
  let correctCount = 0;
  const moduleStats = {};

  ORDERED_MODULES.forEach((modName) => {
    moduleStats[modName] = {
      name: modName,
      correct: 0,
      total: 0,
      theme: getModuleTheme(modName),
    };
  });

  const evaluatedQuestions = activeQuestions.map((q, index) => {
    const userChoice = answers[q.id];
    const correctAnswerString =
      q.correctAnswer || q.options[q.correctIndex];
    const selectedAnswerString =
      typeof userChoice === 'number' ? q.options[userChoice] : userChoice;
    const selectedIndex =
      typeof userChoice === 'number'
        ? userChoice
        : q.options.indexOf(userChoice);

    const isCorrect =
      selectedAnswerString !== undefined &&
      selectedAnswerString === correctAnswerString;

    if (isCorrect) {
      correctCount += 1;
    }
    if (!moduleStats[q.module]) {
      moduleStats[q.module] = {
        name: q.module,
        correct: 0,
        total: 0,
        theme: getModuleTheme(q.module),
      };
    }
    moduleStats[q.module].total += 1;
    if (isCorrect) {
      moduleStats[q.module].correct += 1;
    }

    return {
      ...q,
      questionNumber: index + 1,
      userChoice: selectedIndex !== -1 ? selectedIndex : undefined,
      selectedAnswerString,
      correctAnswerString,
      isCorrect,
    };
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = correctCount >= passingCount;
  const missedQuestions = evaluatedQuestions.filter((q) => !q.isCorrect);
  const displayedQuestions =
    reviewFilter === 'missed' ? missedQuestions : evaluatedQuestions;

  // Automatically post exam results to Google Sheet (`1o4GHw7cTs0TSaIBVLvo2IOWVur2xLzdOoxEMeRyWqbw`) once per attempt
  useEffect(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const submissionLockKey = `wvusd_level1_synced_${candidate?.startedAt || 'session'}`;
    if (localStorage.getItem(submissionLockKey) === 'true') {
      setSheetSyncStatus('saved');
      return;
    }

    if (!getGoogleSheetsWebAppUrl()) {
      setSheetSyncStatus('unconfigured');
      return;
    }

    const moduleBreakdownPayload = {};
    ORDERED_MODULES.forEach((modName) => {
      const st = moduleStats[modName];
      moduleBreakdownPayload[modName] = `${st.correct}/${st.total}`;
    });

    const payload = {
      fullName: candidate?.fullName || '',
      email: candidate?.email || '',
      site: candidate?.site || '',
      startedAt: candidate?.startedAt || '',
      percentage,
      correctCount,
      totalQuestions,
      passed,
      badgeUrl: LEVEL_1_BADGE_URL,
      sendBadgeEmail: passed,
      moduleBreakdown: moduleBreakdownPayload,
      missedQuestionIds: missedQuestions.map((q) => `Q${q.id}`),
    };

    setSheetSyncStatus('saving');
    submitScoreToGoogleSheet(payload)
      .then((res) => {
        if (res?.skipped) {
          setSheetSyncStatus('unconfigured');
        } else {
          localStorage.setItem(submissionLockKey, 'true');
          setSheetSyncStatus('saved');
        }
      })
      .catch(() => {
        setSheetSyncStatus('error');
      });
  }, []);

  // Trigger Google 4-color celebratory confetti burst if passed (>= 80%)
  useEffect(() => {
    if (passed) {
      try {
        const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: googleColors,
        });
        const timer = setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: googleColors,
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: googleColors,
          });
        }, 350);
        return () => clearTimeout(timer);
      } catch {
        // Fallback if canvas-confetti fails in headless environments
      }
    }
  }, [passed]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 relative z-10 space-y-8">
      {/* Celebratory / Score Banner Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden relative">
        <FourColorTopBar height="h-3" />

        {/* Corner Decorative Google Logos */}
        <div className="absolute top-6 left-6 hidden sm:flex p-2.5 rounded-2xl bg-blue-50/80 border border-blue-100 transform -rotate-12 pointer-events-none">
          <DocsPageLogo className="w-8 h-8" />
        </div>
        <div className="absolute top-6 right-6 hidden sm:flex p-2.5 rounded-2xl bg-green-50/80 border border-green-100 transform rotate-6 pointer-events-none">
          <SheetsGridLogo className="w-8 h-8" />
        </div>

        <div className="p-6 sm:p-10 text-center">
          {passed ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34A853]/15 border border-[#34A853]/30 text-[#137333] text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
              <PartyPopper className="w-4 h-4 text-[#34A853]" />
              <span>Congratulations! Part 1 Multiple-Choice Passed</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FBBC05]/20 border border-[#FBBC05]/40 text-[#B06000] text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 text-[#B06000]" />
              <span>Diagnostic Complete — Keep Practicing! (80% Required to Pass)</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {passed ? (
              <>
                Way to go, <span className="text-[#4285F4]">{candidate?.fullName || 'Candidate'}</span>!
              </>
            ) : (
              <>
                Diagnostic Report for <span className="text-[#4285F4]">{candidate?.fullName || 'Candidate'}</span>
              </>
            )}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            {passed
              ? 'You have demonstrated strong foundational mastery across the 8 WVUSD Classified Google Workspace Level 1 modules and unlocked Part 2.'
              : 'Review your module breakdown and missed question explanations below, then click Retake / Reset Exam to draw a fresh set of 25 questions.'}
          </p>

          {/* Candidate Metadata Bar */}
          {candidate && (
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-4 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#4285F4]" />
                {candidate.fullName}
              </span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#EA4335]" />
                {candidate.site}
              </span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#34A853]" />
                {candidate.email}
              </span>
              {sheetSyncStatus === 'saving' && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1.5 text-[#4285F4]">
                    <CloudUpload className="w-4 h-4 animate-bounce" />
                    Saving to WVUSD Google Sheet...
                  </span>
                </>
              )}
              {sheetSyncStatus === 'saved' && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1.5 text-[#137333]">
                    <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                    {passed
                      ? 'Recorded & Level 1 Badge Emailed'
                      : 'Recorded to WVUSD Master Sheet'}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Official Level 1 Digital Badge Showcase (when passed) */}
          {passed && (
            <div className="mt-6 max-w-xl mx-auto p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/70 border border-[#34A853]/30 shadow-sm flex flex-col sm:flex-row items-center gap-5 text-left">
              <a
                href={LEVEL_1_BADGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 group"
                title="View or Download Official Level 1 Badge"
              >
                <img
                  src={LEVEL_1_BADGE_URL}
                  alt="WVUSD Google Workspace Level 1 Certified Badge"
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md group-hover:scale-105 transition-transform"
                />
              </a>
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#34A853]/15 text-[#137333] text-xs font-extrabold uppercase tracking-wider mb-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Official Level 1 Digital Badge</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Your Level 1 Badge Has Been Emailed!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  A copy of your official <strong>WVUSD Google Workspace Level 1 Badge</strong> is sent to{' '}
                  <span className="font-bold text-slate-800">{candidate?.email}</span>. You can also click the badge image to open and save it directly.
                </p>
              </div>
            </div>
          )}

          {/* Score Ring / Stat Blocks */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col items-center justify-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Final Score
              </span>
              <div
                className={`text-4xl font-extrabold mt-1 ${
                  passed ? 'text-[#34A853]' : 'text-[#EA4335]'
                }`}
              >
                {percentage}%
              </div>
              <span className="text-xs font-semibold text-slate-500 mt-1">
                Passing Threshold: 80% (20/25)
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col items-center justify-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Questions Correct
              </span>
              <div className="text-4xl font-extrabold text-slate-900 mt-1">
                {correctCount} <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 mt-1">
                {totalQuestions - correctCount} Missed
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col items-center justify-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Certification Status
              </span>
              <div className="mt-2">
                {passed ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#34A853] text-white font-extrabold text-sm shadow-sm">
                    <Award className="w-4 h-4" />
                    PART 1 QUALIFIED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FBBC05] text-slate-900 font-extrabold text-sm shadow-sm">
                    <RotateCcw className="w-4 h-4" />
                    REVIEW & RETRY
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-500 mt-2">
                WVUSD Level 1: Foundations
              </span>
            </div>
          </div>

          {/* Primary Action Buttons: Proceed to Part 2 + Retake / Reset Exam */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onProceedToPractical}
              className="px-6 py-3.5 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#0F9D58]/30 transition-all inline-flex items-center gap-2.5 cursor-pointer group"
            >
              <SheetsGridLogo className="w-5 h-5 bg-white rounded-md p-0.5" />
              <span>Proceed to Part 2: Hands-On Practical Exam</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onResetExam}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-red-50/60 text-slate-700 hover:text-[#EA4335] font-bold text-sm sm:text-base border border-slate-200 hover:border-[#EA4335]/40 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake / Reset Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostic Breakdown by the 8 Level 1 Curriculum Modules */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
        <FourColorTopBar height="h-2.5" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <GoogleGLogo className="w-6 h-6" />
                <span>Diagnostic Breakdown by 8 Level 1 Curriculum Modules</span>
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                See your exact strengths and review areas across each Google Workspace tool.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 self-start sm:self-auto">
              8 Official Modules Evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ORDERED_MODULES.map((modName) => {
              const stat = moduleStats[modName];
              const modPercent = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              const ModIcon = stat.theme.Icon;
              const isFullMastery = stat.correct === stat.total;

              return (
                <div
                  key={modName}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-xl bg-white border shadow-2xs shrink-0"
                        style={{ borderColor: `${stat.theme.accentHex}35` }}
                      >
                        <ModIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {modName}
                        </h3>
                        <span className="text-xs font-medium text-slate-500">
                          {isFullMastery
                            ? 'Full Module Mastery!'
                            : modPercent >= 66
                            ? 'Solid Foundation'
                            : 'Recommended for Review'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className="text-base font-extrabold"
                        style={{ color: stat.theme.accentHex }}
                      >
                        {stat.correct}/{stat.total} ({modPercent}%)
                      </div>
                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isFullMastery
                            ? 'bg-[#34A853]/15 text-[#137333]'
                            : modPercent >= 66
                            ? 'bg-[#FBBC05]/20 text-[#B06000]'
                            : 'bg-[#EA4335]/15 text-[#C5221F]'
                        }`}
                      >
                        {isFullMastery ? '100% Mastered' : `${stat.total - stat.correct} to review`}
                      </span>
                    </div>
                  </div>

                  {/* Custom Module Color Progress Bar */}
                  <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(modPercent, 6)}%`,
                        background: stat.theme.barGradient,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question-by-Question Review & Explanations */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
        <FourColorTopBar height="h-2.5" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#4285F4]" />
                <span>Question Review & Guided Explanations</span>
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Review missed questions with step-by-step explanations, or inspect all 25 drawn questions.
              </p>
            </div>

            {/* Filter Toggle Pills */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start">
              <button
                type="button"
                onClick={() => setReviewFilter('missed')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  reviewFilter === 'missed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Missed Questions ({missedQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All 25 Questions
              </button>
            </div>
          </div>

          {displayedQuestions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/30 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#34A853] mx-auto mb-2" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Perfect Score — 0 Missed Questions!
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                You answered all 25 questions right. Switch to "All 25 Questions" above if you'd like to browse the explanations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedQuestions.map((q) => {
                const modTheme = getModuleTheme(q.module);
                const ModIcon = modTheme.Icon;
                const optionLetters = ['A', 'B', 'C', 'D'];
                const correctLetter =
                  q.correctIndex !== -1 ? `${optionLetters[q.correctIndex]}. ` : '';

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      q.isCorrect
                        ? 'bg-emerald-50/20 border-emerald-200/80'
                        : 'bg-red-50/20 border-red-200/80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                          Q{q.questionNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${modTheme.badgeBg} ${modTheme.badgeText} ${modTheme.badgeBorder}`}
                        >
                          <ModIcon className="w-3.5 h-3.5" />
                          {q.module}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {q.topic}
                        </span>
                      </div>

                      {q.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#137333] bg-[#34A853]/15 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#C5221F] bg-[#EA4335]/15 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Needs Review
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-3">
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
                      {/* User's Selected Answer */}
                      <div
                        className={`p-3 rounded-xl border ${
                          q.isCorrect
                            ? 'bg-[#34A853]/10 border-[#34A853]/30 text-[#137333]'
                            : 'bg-[#EA4335]/10 border-[#EA4335]/30 text-[#C5221F]'
                        }`}
                      >
                        <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-75 mb-0.5">
                          Your Answer
                        </div>
                        <div className="font-bold">
                          {q.userChoice !== undefined && q.options[q.userChoice]
                            ? `${optionLetters[q.userChoice]}. ${q.options[q.userChoice]}`
                            : q.selectedAnswerString || 'No answer selected'}
                        </div>
                      </div>

                      {/* Correct Answer */}
                      <div className="p-3 rounded-xl bg-[#34A853]/10 border border-[#34A853]/30 text-[#137333]">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-75 mb-0.5">
                          Correct Answer
                        </div>
                        <div className="font-bold">
                          {correctLetter}
                          {q.correctAnswerString}
                        </div>
                      </div>
                    </div>

                    {/* Explanation Box */}
                    <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#FBBC05] shrink-0 mt-0.5 fill-[#FBBC05]" />
                      <div>
                        <span className="font-extrabold text-slate-900">Why this matters: </span>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
