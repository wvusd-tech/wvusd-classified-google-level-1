import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  FourColorTopBar,
  SheetsGridLogo,
  DriveTriangleLogo,
  DocsPageLogo,
  SlidesPresentationLogo,
  GoogleGLogo,
  MultiColorGoogleWord,
} from './GoogleLogos';
import {
  ExternalLink,
  Share2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
  Award,
  Printer,
  ArrowLeft,
  RefreshCw,
  Link2,
  FileSpreadsheet,
  Lightbulb,
  ShieldCheck,
  User,
  Building2,
  Calendar,
} from 'lucide-react';

export const STARTER_SHEET_COPY_URL =
  'https://docs.google.com/spreadsheets/d/1zxNH3_h8P3QkFd-UQc33Aihzd4JRPzHpD_aURn-2d_k/copy';

export const GAS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbwa-gAsJaa2ZXpgyb4vOH2Uwgj677p3shX8CsQtxMbeGCpGFAebYNn9hsgtnmU4gIdbEg/exec';

const PRACTICAL_TASKS = [
  {
    id: 1,
    title: 'Freeze Row 1',
    badge: 'View > Freeze > 1 row',
    description:
      'Freeze Row 1 (View > Freeze > 1 row) so column headers stay locked when scrolling.',
  },
  {
    id: 2,
    title: 'Attendance Status Dropdown (E2:E16)',
    badge: 'Insert > Dropdown',
    description:
      'Insert a real Data Validation Dropdown (Insert > Dropdown) with options Excused, Unexcused, Illness, Truant and mark at least 2 students as Unexcused.',
  },
  {
    id: 3,
    title: 'Total Fees Collected (Cell H2)',
    badge: 'Cell H2 Formula',
    description:
      'Write a formula to add up all fees in D2:D16.',
  },
  {
    id: 4,
    title: 'Total Students on Roster (Cell H3)',
    badge: 'Cell H3 Formula',
    description:
      'Write a formula to count the student names in B2:B16.',
  },
  {
    id: 5,
    title: 'Unexcused Absences Count (Cell H4)',
    badge: 'Cell H4 COUNTIF',
    description:
      'Write a COUNTIF formula to count how many cells in E2:E16 say "Unexcused".',
  },
];

export default function PracticalSection({
  candidate,
  mcqScore = 0,
  totalMcq = 25,
  savedPracticalState,
  onUpdatePracticalState,
  onBackToResults,
  onResetExam,
}) {
  const [sheetUrl, setSheetUrl] = useState(savedPracticalState?.sheetUrl || '');
  const [completedTasks, setCompletedTasks] = useState(
    savedPracticalState?.completedTasks || {}
  );
  const [gradingResult, setGradingResult] = useState(
    savedPracticalState?.gradingResult || null
  );
  const [isGrading, setIsGrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const candidateName =
    candidate?.name || candidate?.fullName || 'WVUSD Candidate';
  const candidateEmail = candidate?.email || '';
  const schoolSite = candidate?.site || 'WVUSD School Site / Department';

  const mcqPassed = mcqScore >= 20;
  const practicalScore = gradingResult?.score ?? null;
  const practicalPassed =
    gradingResult?.passed ?? (practicalScore !== null && practicalScore >= 80);
  const fullyCertified = mcqPassed && practicalPassed;

  // Sync changes back to parent App state / localStorage
  useEffect(() => {
    if (onUpdatePracticalState) {
      onUpdatePracticalState({
        sheetUrl,
        completedTasks,
        gradingResult,
      });
    }
  }, [sheetUrl, completedTasks, gradingResult]);

  // Trigger celebratory Google 4-color confetti when both MCQ and Practical are passed
  useEffect(() => {
    if (fullyCertified) {
      try {
        const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.55 },
          colors: googleColors,
        });
      } catch {
        // Ignore confetti errors in headless browsers
      }
    }
  }, [fullyCertified, gradingResult]);

  const toggleTaskCheck = (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleGradeSheet = async (e) => {
    if (e) e.preventDefault();
    const trimmedUrl = sheetUrl.trim();

    if (!trimmedUrl) {
      setErrorMsg('Please paste your shared Google Sheet link before grading.');
      return;
    }
    if (!trimmedUrl.includes('docs.google.com/spreadsheets')) {
      setErrorMsg(
        'Please paste a valid Google Sheets URL (it should contain "docs.google.com/spreadsheets/d/...").'
      );
      return;
    }

    setErrorMsg('');
    setIsGrading(true);

    try {
      const payload = {
        sheetUrl: trimmedUrl,
        candidateName: candidate.name || candidate.fullName || '',
        candidateEmail: candidate.email || '',
        schoolSite: candidate.site || '',
        mcqScore: mcqScore,
      };

      const response = await fetch(GAS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data || data.success === false || data.status === 'error') {
        setErrorMsg(
          data?.message ||
            data?.error ||
            'Could not grade that Google Sheet. Please verify General Access is set to "Walnut Valley Unified School District — Can view" or "Anyone with the link can view".'
        );
      } else {
        setGradingResult({
          ...data,
          gradedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setErrorMsg(
        'Network error while connecting to the WVUSD Sheet Grader. Please check your link sharing permissions and try again.'
      );
    } finally {
      setIsGrading(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const getCheckStatusBadge = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'pass' || normalized === 'passed') {
      return {
        label: 'PASSED',
        badgeClass:
          'bg-[#34A853]/15 text-[#137333] border-[#34A853]/30',
        cardBorder: 'border-[#34A853]/40 bg-emerald-50/20',
        Icon: CheckCircle2,
        iconColor: 'text-[#34A853]',
      };
    }
    if (normalized === 'warn' || normalized === 'warning') {
      return {
        label: 'ALMOST THERE',
        badgeClass:
          'bg-[#FBBC05]/25 text-[#B06000] border-[#FBBC05]/40',
        cardBorder: 'border-[#FBBC05]/50 bg-amber-50/25',
        Icon: AlertTriangle,
        iconColor: 'text-[#F4B400]',
      };
    }
    return {
      label: 'NEEDS REVISION',
      badgeClass:
        'bg-[#EA4335]/15 text-[#C5221F] border-[#EA4335]/30',
      cardBorder: 'border-[#EA4335]/35 bg-red-50/20',
      Icon: XCircle,
      iconColor: 'text-[#EA4335]',
    };
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 relative z-10 space-y-8">
      {/* Top Navigation / Back to Part 1 Results Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBackToResults}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#4285F4]" />
          <span>Back to Part 1 Diagnostic Report</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/10 border border-[#0F9D58]/30 text-[#0D652D] text-xs font-extrabold">
          <SheetsGridLogo className="w-4 h-4" />
          <span>Part 1 Score: {mcqScore} / {totalMcq} ({Math.round((mcqScore / totalMcq) * 100)}%)</span>
        </div>
      </div>

      {/* Main Header Card for Part 2: Hands-On Practical Exam */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden relative print:hidden">
        <FourColorTopBar height="h-3" />
        <div className="w-full h-1.5 bg-[#0F9D58]" />

        {/* Decorative Tilted Corner Icons */}
        <div className="absolute top-6 left-6 hidden sm:flex p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/70 shadow-xs transform -rotate-12 pointer-events-none">
          <SheetsGridLogo className="w-10 h-10" />
        </div>
        <div className="absolute top-6 right-6 hidden sm:flex p-3 rounded-2xl bg-blue-50/90 border border-blue-200/70 shadow-xs transform rotate-6 pointer-events-none">
          <DriveTriangleLogo className="w-10 h-10" />
        </div>

        <div className="p-6 sm:p-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F9D58]/12 border border-[#0F9D58]/30 text-[#0D652D] text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#0F9D58]" />
            <span>Part 2 • Live Google Sheets Performance Lab</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hands-On <span className="text-[#0F9D58]">Google Sheets</span> Practical Exam
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Complete the 5 real-world school office tasks inside your own copy of the WVUSD Starter Sheet, share the link, and get instant formula & formatting coaching!
          </p>
        </div>
      </div>

      {/* 3-Step Guided Workflow Grid */}
      <div className="space-y-6 print:hidden">
        {/* STEP 1: Get Your Starter Sheet & 5-Task Checklist */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden relative">
          <FourColorTopBar height="h-2" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0F9D58] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-[#0F9D58]/25">
                  1
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F9D58]">
                    Step 1 of 3
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Get Your Starter Sheet & Complete the 5 Tasks
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Click the green button to make your personal copy, then check off each task below as you finish it.
                  </p>
                </div>
              </div>

              {/* Prominent Green Google Sheets Starter Button */}
              <a
                href={STARTER_SHEET_COPY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#0F9D58]/30 hover:shadow-[#0F9D58]/40 transition-all inline-flex items-center justify-center gap-2.5 shrink-0 group"
              >
                <div className="p-1 bg-white rounded-lg">
                  <SheetsGridLogo className="w-5 h-5" />
                </div>
                <span>Launch Starter Google Sheet (Make a Copy)</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Interactive 5-Task Checklist */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                <span>Required Google Sheets Tasks (5 Tasks • 20 Points Each)</span>
                <span>
                  {Object.values(completedTasks).filter(Boolean).length} / 5 Checked
                </span>
              </div>

              {PRACTICAL_TASKS.map((task) => {
                const isChecked = !!completedTasks[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskCheck(task.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-emerald-50/50 border-[#0F9D58]/50'
                        : 'bg-slate-50/60 hover:bg-white border-slate-200/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-1 w-5 h-5 rounded-md accent-[#0F9D58] cursor-pointer shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-[#0F9D58] text-white">
                          Task {task.id}
                        </span>
                        <h3
                          className={`font-extrabold text-sm sm:text-base ${
                            isChecked ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <code className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[#0D652D]">
                          {task.badge}
                        </code>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 2: Share Your Sheet Callout Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          <FourColorTopBar height="h-2" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#4285F4] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-[#4285F4]/25">
                2
              </div>
              <div className="flex-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#4285F4]">
                  Step 2 of 3
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Share Your Google Sheet So the Grader Can Inspect It
                </h2>

                <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-blue-50/70 to-amber-50/70 border-2 border-[#0F9D58]/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white shadow-xs border border-emerald-200 shrink-0">
                    <Share2 className="w-7 h-7 text-[#0F9D58]" />
                  </div>
                  <div className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    Click the green{' '}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0F9D58] text-white font-bold text-xs">
                      Share
                    </span>{' '}
                    button in the top-right corner of your Google Sheet and change{' '}
                    <strong className="text-slate-900">General Access</strong> to{' '}
                    <strong className="text-[#0D652D] underline decoration-dotted">
                      &apos;Walnut Valley Unified School District — Can view&apos;
                    </strong>{' '}
                    (or{' '}
                    <strong className="text-[#1967D2]">
                      &apos;Anyone with the link can view&apos;
                    </strong>
                    ), then click <strong className="text-slate-900">Copy link</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: Paste Link & Auto-Grade */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          <FourColorTopBar height="h-2" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FBBC05] text-slate-900 font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-[#FBBC05]/25">
                3
              </div>
              <div className="flex-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#B06000]">
                  Step 3 of 3
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Paste Your Link & Run Live Auto-Grader
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Paste your copied Google Sheet URL below. You can fix mistakes and re-grade as many times as you like!
                </p>

                <form onSubmit={handleGradeSheet} className="mt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Link2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="url"
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/1abc.../edit?usp=sharing"
                        disabled={isGrading}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F9D58] focus:border-transparent transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGrading}
                      className={`px-6 py-3.5 rounded-xl font-extrabold text-sm sm:text-base text-white shadow-lg transition-all inline-flex items-center justify-center gap-2.5 shrink-0 cursor-pointer ${
                        isGrading
                          ? 'bg-slate-400 cursor-wait'
                          : gradingResult
                          ? 'bg-[#4285F4] hover:bg-[#3367D6] shadow-[#4285F4]/25'
                          : 'bg-[#0F9D58] hover:bg-[#0B8043] shadow-[#0F9D58]/30'
                      }`}
                    >
                      {isGrading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Inspecting your formulas & formatting...</span>
                        </>
                      ) : gradingResult ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Re-Grade My Sheet</span>
                        </>
                      ) : (
                        <>
                          <SheetsGridLogo className="w-5 h-5 bg-white rounded-md p-0.5" />
                          <span>Grade My Google Sheet</span>
                        </>
                      )}
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-4 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#C5221F] text-sm font-semibold flex items-start gap-2.5">
                      <XCircle className="w-5 h-5 text-[#EA4335] shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMART COACHING FEEDBACK & SCORE COMPARISON */}
      {gradingResult && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 overflow-hidden print:hidden">
            <FourColorTopBar height="h-2.5" />
            <div className="p-6 sm:p-8">
              {/* Top Score Comparison Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0F9D58] mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>
                      Inspected File: {gradingResult.fileName || 'Candidate Google Sheet'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Smart Coaching & Formula Diagnostic
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {practicalPassed
                      ? 'Awesome job! You passed the Hands-On Practical Exam (>= 80/100).'
                      : 'Update your Google Sheet using the Coach Tips below, then click Re-Grade My Sheet above!'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGradeSheet}
                  disabled={isGrading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F9D58]/10 hover:bg-[#0F9D58]/20 text-[#0D652D] font-extrabold text-xs sm:text-sm border border-[#0F9D58]/30 transition-all cursor-pointer self-start md:self-auto"
                >
                  <RefreshCw className={`w-4 h-4 ${isGrading ? 'animate-spin' : ''}`} />
                  <span>Re-Grade My Sheet</span>
                </button>
              </div>

              {/* Dual Score Cards: Practical Score vs Multiple Choice Score */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Practical Score */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D652D]">
                    Part 2: Practical Score
                  </span>
                  <div
                    className={`text-3xl sm:text-4xl font-extrabold mt-1 ${
                      practicalPassed ? 'text-[#0F9D58]' : 'text-[#EA4335]'
                    }`}
                  >
                    {practicalScore} <span className="text-lg text-slate-400">/ 100</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 mt-1">
                    {practicalPassed ? 'Passed (80+ Required)' : '80 / 100 Required to Pass'}
                  </span>
                </div>

                {/* Multiple Choice Score */}
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#1967D2]">
                    Part 1: Multiple Choice Score
                  </span>
                  <div
                    className={`text-3xl sm:text-4xl font-extrabold mt-1 ${
                      mcqPassed ? 'text-[#4285F4]' : 'text-[#EA4335]'
                    }`}
                  >
                    {mcqScore} <span className="text-lg text-slate-400">/ {totalMcq}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 mt-1">
                    {Math.round((mcqScore / totalMcq) * 100)}% (20/{totalMcq} Required)
                  </span>
                </div>

                {/* Overall Level 1 Status */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Overall Level 1 Status
                  </span>
                  <div className="mt-2">
                    {fullyCertified ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#34A853] text-white font-extrabold text-xs sm:text-sm shadow-sm">
                        <Award className="w-4 h-4" />
                        LEVEL 1 CERTIFIED!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FBBC05] text-slate-900 font-extrabold text-xs sm:text-sm shadow-sm">
                        <Sparkles className="w-4 h-4" />
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-2">
                    {fullyCertified
                      ? 'Certificate Unlocked Below!'
                      : 'Pass both Part 1 & Part 2'}
                  </span>
                </div>
              </div>

              {/* 5 Interactive Check Cards */}
              {Array.isArray(gradingResult.checks) && gradingResult.checks.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                    Task-by-Task Inspection Breakdown ({gradingResult.checks.length} Checks)
                  </h3>

                  {gradingResult.checks.map((check, idx) => {
                    const statusStyle = getCheckStatusBadge(check.status);
                    const StatusIcon = statusStyle.Icon;

                    return (
                      <div
                        key={check.id || idx}
                        className={`p-5 rounded-2xl border-2 transition-all ${statusStyle.cardBorder}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <StatusIcon
                              className={`w-5 h-5 shrink-0 ${statusStyle.iconColor}`}
                            />
                            <h4 className="font-extrabold text-base text-slate-900">
                              {check.name ||
                                check.title ||
                                PRACTICAL_TASKS[idx]?.title ||
                                `Task ${idx + 1}`}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {check.points !== undefined && (
                              <span className="text-xs font-extrabold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                {check.points} / {check.maxPoints || 20} pts
                              </span>
                            )}
                            <span
                              className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusStyle.badgeClass}`}
                            >
                              {statusStyle.label}
                            </span>
                          </div>
                        </div>

                        {/* Check Message */}
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {check.message}
                        </p>

                        {/* Highlighted Coach's Formula & Formatting Tips Box */}
                        {check.alternatives && (
                          <div className="mt-3.5 p-4 rounded-xl bg-amber-50/90 border border-[#FBBC05]/50 text-xs sm:text-sm text-slate-800">
                            <div className="font-extrabold text-[#B06000] flex items-center gap-1.5 mb-1.5">
                              <Lightbulb className="w-4 h-4 text-[#F4B400] fill-[#FBBC05]" />
                              <span>💡 Coach&apos;s Formula &amp; Formatting Tips</span>
                            </div>
                            <div className="whitespace-pre-line font-mono text-xs sm:text-[13px] text-slate-700 leading-relaxed bg-white/90 p-3 rounded-lg border border-amber-200/70">
                              {check.alternatives}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CELEBRATORY PRINTABLE CERTIFICATE WHEN BOTH PART 1 & PART 2 ARE PASSED */}
          {fullyCertified && (
            <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border-4 border-[#4285F4]/30 overflow-hidden relative print:border-2 print:shadow-none">
              <FourColorTopBar height="h-3.5" />

              {/* Decorative Corner Workspace Icons on Certificate */}
              <div className="absolute top-8 left-8 hidden sm:flex p-3 rounded-2xl bg-blue-50 border border-blue-200/60 transform -rotate-12 pointer-events-none">
                <DocsPageLogo className="w-9 h-9" />
              </div>
              <div className="absolute top-8 right-8 hidden sm:flex p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 transform rotate-12 pointer-events-none">
                <SheetsGridLogo className="w-9 h-9" />
              </div>
              <div className="absolute bottom-8 left-8 hidden sm:flex p-3 rounded-2xl bg-amber-50 border border-amber-200/60 transform rotate-6 pointer-events-none">
                <SlidesPresentationLogo className="w-9 h-9" />
              </div>
              <div className="absolute bottom-8 right-8 hidden sm:flex p-3 rounded-2xl bg-green-50 border border-green-200/60 transform -rotate-6 pointer-events-none">
                <DriveTriangleLogo className="w-9 h-9" />
              </div>

              <div className="p-8 sm:p-14 text-center relative">
                {/* Official Seal Header */}
                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-slate-50 border-2 border-slate-200/80 shadow-md mb-4">
                  <GoogleGLogo className="w-12 h-12" />
                </div>

                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-[#4285F4]">
                  Walnut Valley Unified School District
                </div>

                <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  WVUSD Certified Administrative Professional — Level 1
                </h2>

                <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
                  This certifies that
                </p>

                {/* Candidate Name */}
                <div className="my-5 inline-block px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/80 border-b-4 border-[#4285F4]">
                  <span className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {candidateName}
                  </span>
                </div>

                <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
                  has successfully demonstrated proficiency across all 8{' '}
                  <MultiColorGoogleWord /> Workspace Foundations curriculum modules and passed both the Multiple-Choice Knowledge Assessment and the Live Google Sheets Practical Exam.
                </p>

                {/* Certificate Metadata Grid */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#EA4335]" />
                      School Site / Dept
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 truncate">
                      {schoolSite}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4285F4]" />
                      Part 1 MCQ Score
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#1967D2] mt-1">
                      {mcqScore} / {totalMcq} ({Math.round((mcqScore / totalMcq) * 100)}%)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D58]" />
                      Part 2 Practical
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#0D652D] mt-1">
                      {practicalScore} / 100 ({practicalScore}%)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#FBBC05]" />
                      Date Issued
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">
                      {formattedDate}
                    </div>
                  </div>
                </div>

                {/* Print / Save PDF Button */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 print:hidden">
                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-6 py-3.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#4285F4]/25 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-5 h-5" />
                    <span>Print / Save Official Certificate (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
