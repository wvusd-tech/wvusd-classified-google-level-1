import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  LEVEL_1_BADGE_URL,
  submitScoreToGoogleSheet,
} from '../utils/sheetSync';
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
  Link2,
  FileSpreadsheet,
  Lightbulb,
  ShieldCheck,
  Building2,
  Calendar,
  Send,
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

function isCheckPassed(check) {
  if (!check) return false;
  const normalized = String(check.status || '').toLowerCase();
  return (
    normalized === 'pass' ||
    normalized === 'passed' ||
    (typeof check.points === 'number' && check.points >= (check.maxPoints || 20))
  );
}

export default function PracticalSection({
  candidate,
  mcqScore = 0,
  totalMcq = 25,
  savedPracticalState,
  onUpdatePracticalState,
  onBackToResults,
}) {
  const [sheetUrl, setSheetUrl] = useState(savedPracticalState?.sheetUrl || '');
  const [completedTasks, setCompletedTasks] = useState(
    savedPracticalState?.completedTasks || {}
  );
  const [revealedTasks, setRevealedTasks] = useState(
    savedPracticalState?.revealedTasks || {}
  );
  const [gradingResult, setGradingResult] = useState(
    savedPracticalState?.gradingResult || null
  );
  const [practicalSubmitted, setPracticalSubmitted] = useState(
    savedPracticalState?.practicalSubmitted || false
  );
  const [isGrading, setIsGrading] = useState(false);
  const [checkingTaskId, setCheckingTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskErrors, setTaskErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  const urlInputRef = useRef(null);
  const resultsRef = useRef(null);

  const candidateName =
    candidate?.name || candidate?.fullName || 'WVUSD Candidate';
  const candidateEmail = candidate?.email || '';
  const schoolSite = candidate?.site || 'WVUSD School Site / Department';

  // Helper to get the grader check object for a specific task (1..5)
  const getTaskCheck = (taskId) => {
    if (!Array.isArray(gradingResult?.checks)) return null;
    const byId = gradingResult.checks.find((check) => Number(check.id) === taskId);
    return byId || gradingResult.checks[taskId - 1] || null;
  };

  // Count how many tasks have passed their check when revealed
  const passedTasksCount = PRACTICAL_TASKS.filter((task) => {
    const chk = getTaskCheck(task.id);
    return revealedTasks[task.id] && isCheckPassed(chk);
  }).length;

  const allFiveTasksPassed = passedTasksCount === PRACTICAL_TASKS.length;
  const mcqPassed = mcqScore >= 20;
  const practicalScore = allFiveTasksPassed
    ? 100
    : gradingResult?.score ?? passedTasksCount * 20;
  const practicalPassed = allFiveTasksPassed;
  const fullyCertified = mcqPassed && practicalPassed && practicalSubmitted;

  // Sync changes back to parent App state / localStorage
  useEffect(() => {
    if (onUpdatePracticalState) {
      onUpdatePracticalState({
        sheetUrl,
        completedTasks,
        revealedTasks,
        gradingResult,
        practicalSubmitted,
      });
    }
  }, [sheetUrl, completedTasks, revealedTasks, gradingResult, practicalSubmitted]);

  // Trigger celebratory Google 4-color confetti when submitted and certified
  useEffect(() => {
    if ( practicalSubmitted && allFiveTasksPassed ) {
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
  }, [practicalSubmitted, allFiveTasksPassed]);

  const runSheetGrader = async (targetTaskId) => {
    const trimmedUrl = sheetUrl.trim();

    if (!trimmedUrl) {
      setErrorMsg(
        'Paste your shared Google Sheet link in Step 2 before checking a task.'
      );
      if (urlInputRef.current) {
        urlInputRef.current.focus();
      }
      return;
    }
    if (!trimmedUrl.includes('docs.google.com/spreadsheets')) {
      setErrorMsg(
        'Please paste a valid Google Sheets URL in Step 2 (it should contain "docs.google.com/spreadsheets/d/...").'
      );
      if (urlInputRef.current) {
        urlInputRef.current.focus();
      }
      return;
    }

    setErrorMsg('');
    setTaskErrors((prev) => ({ ...prev, [targetTaskId]: '' }));
    setIsGrading(true);
    setCheckingTaskId(targetTaskId);

    try {
      const payload = {
        sheetUrl: trimmedUrl,
        candidateName,
        candidateEmail,
        schoolSite,
        mcqScore,
        badgeUrl: LEVEL_1_BADGE_URL,
        taskId: targetTaskId,
      };

      const response = await fetch(GAS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`The sheet grader returned HTTP ${response.status}.`);
      }

      const data = await response.json();

      if (!data || data.success === false || data.status === 'error') {
        throw new Error(
          data?.message ||
            data?.error ||
            'Could not access that Google Sheet. Verify that General Access allows the grader to view it.'
        );
      }

      const checks = Array.isArray(data.checks) ? data.checks : [];
      const returnedCheck =
        data.check ||
        data.checkResult ||
        checks.find((check) => Number(check.id) === targetTaskId) ||
        checks[targetTaskId - 1] ||
        (data.id === targetTaskId ? data : null);
      if (!returnedCheck) {
        throw new Error('The sheet grader did not return feedback for this task. Please try again.');
      }

      setGradingResult((previous) => {
        const mergedChecks = Array.isArray(previous?.checks)
          ? [...previous.checks]
          : [];
        checks.forEach((check, index) => {
          const checkId = Number(check.id);
          const checkIndex =
            Number.isInteger(checkId) && checkId >= 1 && checkId <= PRACTICAL_TASKS.length
              ? checkId - 1
              : index;
          mergedChecks[checkIndex] = check;
        });
        if (returnedCheck) {
          mergedChecks[targetTaskId - 1] = returnedCheck;
        }

        return {
          ...previous,
          ...data,
          checks: mergedChecks,
          gradedAt: new Date().toISOString(),
        };
      });

      setRevealedTasks((prev) => ({ ...prev, [targetTaskId]: true }));
      setCompletedTasks((prev) => ({
        ...prev,
        [targetTaskId]: isCheckPassed(returnedCheck),
      }));
    } catch (error) {
      setTaskErrors((prev) => ({
        ...prev,
        [targetTaskId]:
          error instanceof Error
            ? error.message
            : 'Network error while connecting to the WVUSD Sheet Grader. Check the link sharing permissions and try again.',
      }));
    } finally {
      setIsGrading(false);
      setCheckingTaskId(null);
    }
  };

  const handleSubmitPracticalExam = async () => {
    if (!allFiveTasksPassed || isSubmitting || practicalSubmitted) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const response = await fetch(GAS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          sheetUrl: sheetUrl.trim(),
          candidateName,
          candidateEmail,
          schoolSite,
          mcqScore,
        }),
      });
      if (!response.ok) {
        throw new Error(`The practical exam service returned HTTP ${response.status}.`);
      }

      const data = await response.json();
      if (!data || data.success === false || data.status === 'error') {
        throw new Error(
          data?.message || data?.error || 'The practical exam could not be submitted.'
        );
      }

      setPracticalSubmitted(true);

      if (mcqPassed) {
        const badgeLockKey = `wvusd_level1_badge_emailed_${candidate?.startedAt || candidateEmail}`;
        if (localStorage.getItem(badgeLockKey) !== 'true') {
          submitScoreToGoogleSheet({
            action: 'send_badge_only',
            email: candidateEmail,
            fullName: candidateName,
            site: schoolSite,
            correctCount: mcqScore,
            totalQuestions: totalMcq,
            practicalScore: 100,
            passed: true,
            badgeUrl: LEVEL_1_BADGE_URL,
          })
            .then(() => {
              localStorage.setItem(badgeLockKey, 'true');
            })
            .catch((error) => {
              setErrorMsg(
                `Your practical exam was submitted, but the badge email could not be sent: ${error.message}`
              );
            });
        }
      }

      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Network error while submitting the practical exam. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const getCheckStatusBadge = (check) => {
    const normalized = String(check?.status || '').toLowerCase();
    if (isCheckPassed(check)) {
      return {
        label: 'PASSED',
        badgeClass:
          'bg-[#34A853]/15 text-[#137333] border-[#34A853]/30',
        cardBorder: 'border-[#34A853]/40 bg-emerald-50/30',
        Icon: CheckCircle2,
        iconColor: 'text-[#34A853]',
      };
    }
    if (normalized === 'warn' || normalized === 'warning') {
      return {
        label: 'ALMOST THERE',
        badgeClass:
          'bg-[#FBBC05]/25 text-[#B06000] border-[#FBBC05]/40',
        cardBorder: 'border-[#FBBC05]/50 bg-amber-50/30',
        Icon: AlertTriangle,
        iconColor: 'text-[#F4B400]',
      };
    }
    return {
      label: 'NEEDS REVISION',
      badgeClass:
        'bg-[#EA4335]/15 text-[#C5221F] border-[#EA4335]/30',
      cardBorder: 'border-[#EA4335]/35 bg-red-50/25',
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
          <span>
            Part 1 Score: {mcqScore} / {totalMcq} ({Math.round((mcqScore / totalMcq) * 100)}%)
          </span>
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
            Make your copy of the WVUSD Starter Sheet, share the link, and check each of the 5 tasks one-by-one with instant formula &amp; formatting coaching before submitting!
          </p>
        </div>
      </div>

      {/* 3-Step Guided Workflow Grid */}
      <div className="space-y-6 print:hidden">
        {/* STEP 1: Get Your Starter Sheet & Share It So the Grader Can Inspect It */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          <FourColorTopBar height="h-2" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4285F4] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-[#4285F4]/25">
                  1
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#4285F4]">
                    Step 1 of 3
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Get Your Starter Sheet &amp; Share It
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    First click the green button to make your personal copy of the Starter Sheet, then update its Share settings below.
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

            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-blue-50/70 to-amber-50/70 border-2 border-[#0F9D58]/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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

        {/* STEP 2: Paste Your Google Sheet Link */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          <FourColorTopBar height="h-2" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FBBC05] text-slate-900 font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-[#FBBC05]/25">
                2
              </div>
              <div className="flex-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#B06000]">
                  Step 2 of 3
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Paste Your Google Sheet Link
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  This shared link will be used for each task check and your final submission.
                </p>

                <div className="mt-5 space-y-4">
                  <div className="relative">
                    <Link2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={urlInputRef}
                      type="url"
                      value={sheetUrl}
                      onChange={(e) => {
                        const nextUrl = e.target.value;
                        if (nextUrl !== sheetUrl) {
                          setGradingResult(null);
                          setCompletedTasks({});
                          setRevealedTasks({});
                          setPracticalSubmitted(false);
                        }
                        setSheetUrl(nextUrl);
                        setTaskErrors({});
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="https://docs.google.com/spreadsheets/d/1abc.../edit?usp=sharing"
                      disabled={isGrading || isSubmitting || practicalSubmitted}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F9D58] focus:border-transparent transition-all"
                    />
                  </div>

                  {errorMsg && (
                    <div role="alert" className="p-4 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#C5221F] text-sm font-semibold flex items-start gap-2.5">
                      <XCircle className="w-5 h-5 text-[#EA4335] shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: Complete & Check the 5 Tasks One-by-One + Submit */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 overflow-hidden relative">
          <FourColorTopBar height="h-2" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0F9D58] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-[#0F9D58]/25">
                  3
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F9D58]">
                    Step 3 of 3
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Complete the 5 Tasks &amp; Check Each Task 1-by-1
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Complete each task in your Google Sheet, then select <strong>Check Task</strong> for instant feedback. Fix any issues and check again as needed.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-[#0F9D58]/30 text-[#0D652D] text-xs sm:text-sm font-extrabold shrink-0 self-start sm:self-center">
                <CheckCircle2 className="w-4 h-4 text-[#0F9D58]" />
                <span>
                  {passedTasksCount} / 5 Tasks Passed ({passedTasksCount * 20} / 100 pts)
                </span>
              </div>
            </div>

            {/* Interactive 5-Task List with 1-by-1 Grader Buttons & Inline Feedback */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                <span>Required Google Sheets Tasks (5 Tasks • 20 Points Each)</span>
                <span>
                  {passedTasksCount} / 5 Passed
                </span>
              </div>

              {PRACTICAL_TASKS.map((task) => {
                const check = getTaskCheck(task.id);
                const isRevealed = !!revealedTasks[task.id] && !!check;
                const taskPassed = isRevealed && isCheckPassed(check);
                const isThisTaskLoading = isGrading && checkingTaskId === task.id;
                const statusStyle = isRevealed
                  ? getCheckStatusBadge(check)
                  : null;
                const StatusIcon = statusStyle?.Icon;

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl border-2 transition-all ${
                      taskPassed
                        ? 'bg-emerald-50/40 border-[#0F9D58]/50 shadow-2xs'
                        : isRevealed
                        ? statusStyle.cardBorder
                        : 'bg-slate-50/60 hover:bg-white border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1">
                        {taskPassed && (
                          <CheckCircle2 className="mt-1 w-5 h-5 text-[#0F9D58] shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-[#0F9D58] text-white">
                              Task {task.id}
                            </span>
                            <h3
                              className={`font-extrabold text-sm sm:text-base ${
                                taskPassed
                                  ? 'text-[#0D652D]'
                                  : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h3>
                            <code className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[#0D652D]">
                              {task.badge}
                            </code>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      {/* Individual 1-by-1 Task Check Button */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {isRevealed && check?.points !== undefined && (
                          <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                            {check.points} / {check.maxPoints || 20} pts
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={isGrading || isSubmitting || practicalSubmitted}
                          onClick={() => runSheetGrader(task.id)}
                          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs ${
                            isThisTaskLoading
                              ? 'bg-slate-400 text-white cursor-wait'
                              : practicalSubmitted
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : taskPassed
                              ? 'bg-[#34A853] hover:bg-[#2D9249] text-white'
                              : isRevealed
                              ? 'bg-[#4285F4] hover:bg-[#3367D6] text-white'
                              : 'bg-[#0F9D58] hover:bg-[#0B8043] text-white'
                          }`}
                        >
                          {isThisTaskLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Checking Task...</span>
                            </>
                          ) : (
                            <>
                              {taskPassed ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              <span>Check Task</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {taskErrors[task.id] && (
                      <div
                        role="alert"
                        className="mt-4 p-3 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#C5221F] text-sm font-semibold"
                      >
                        {taskErrors[task.id]}
                      </div>
                    )}

                    {/* Inline 1-by-1 Feedback & Coach's Tips for This Task */}
                    {isRevealed && check && statusStyle && (
                      <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon
                              className={`w-5 h-5 shrink-0 ${statusStyle.iconColor}`}
                            />
                            <span
                              className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusStyle.badgeClass}`}
                            >
                              {statusStyle.label}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">
                              {check.message}
                            </span>
                          </div>
                        </div>

                        {check.alternatives && (
                          <div className="p-4 rounded-xl bg-amber-50/90 border border-[#FBBC05]/50 text-xs sm:text-sm text-slate-800">
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
                    )}
                  </div>
                );
              })}
            </div>

            {/* Final Submit Practical Exam Footer inside Step 3 */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="text-sm font-extrabold text-slate-800">
                  {allFiveTasksPassed
                    ? '🎉 All 5 Practical Tasks Passed (100/100)! Ready to Submit.'
                    : `Complete & Pass All 5 Tasks Above to Unlock Final Submit (${5 - passedTasksCount} Remaining)`}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {allFiveTasksPassed
                    ? 'Submit all five verified tasks to finalize Part 2 and view your certification status.'
                    : 'Check each task after completing it in Google Sheets. You can fix mistakes and check again.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmitPracticalExam}
                disabled={!allFiveTasksPassed || isSubmitting || practicalSubmitted}
                className={`w-full sm:w-auto px-7 py-4 rounded-xl font-extrabold text-sm sm:text-base transition-all inline-flex items-center justify-center gap-2.5 shrink-0 ${
                  allFiveTasksPassed && !isSubmitting && !practicalSubmitted
                    ? 'bg-[#34A853] hover:bg-[#2D9249] text-white shadow-xl shadow-[#34A853]/30 cursor-pointer animate-bounce-subtle'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>
                  {isSubmitting
                    ? 'Submitting Practical Exam...'
                    : practicalSubmitted && allFiveTasksPassed
                    ? 'Practical Exam Submitted ✓'
                    : allFiveTasksPassed
                    ? 'Submit Practical Exam'
                    : `Pass ${5 - passedTasksCount} More Task${5 - passedTasksCount === 1 ? '' : 's'} to Submit`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL SCORE SUMMARY & CELEBRATORY PRINTABLE CERTIFICATE (Shown after clicking Submit) */}
      {practicalSubmitted && allFiveTasksPassed && (
        <div ref={resultsRef} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 overflow-hidden print:hidden">
            <FourColorTopBar height="h-2.5" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0F9D58] mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>
                      Verified Sheet: {gradingResult?.fileName || 'Candidate Google Sheet'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Part 2 Practical Exam Complete — 100 / 100!
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Awesome job! You passed all 5 hands-on Google Sheets tasks.
                  </p>
                </div>
              </div>

              {/* Dual Score Cards: Practical Score vs Multiple Choice Score */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Practical Score */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#0D652D]">
                    Part 2: Practical Score
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold mt-1 text-[#0F9D58]">
                    {practicalScore} <span className="text-lg text-slate-400">/ 100</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 mt-1">
                    All 5 Tasks Passed (100%)
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
                        PART 1 RETAKE NEEDED
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 mt-2">
                    {fullyCertified
                      ? 'Certificate & Badge Unlocked Below!'
                      : 'Requires 20/25 on Part 1 MCQ'}
                  </span>
                </div>
              </div>
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
                {/* Official Level 1 Badge Header */}
                <div className="inline-flex flex-col items-center justify-center mb-4">
                  <img
                    src={LEVEL_1_BADGE_URL}
                    alt="WVUSD Google Workspace Level 1 Certified Badge"
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-2xl border-2 border-slate-200/80 bg-white p-2 shadow-lg"
                  />
                  {candidateEmail && (
                    <span className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34A853]/15 text-[#137333] text-xs font-extrabold print:hidden">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
                      <span>Official Level 1 Badge Emailed to {candidateEmail}</span>
                    </span>
                  )}
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
