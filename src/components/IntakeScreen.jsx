import React, { useState } from 'react';
import {
  GoogleGLogo,
  ChromeWheelLogo,
  DriveTriangleLogo,
  DocsPageLogo,
  SheetsGridLogo,
  SlidesPresentationLogo,
  FormsChecklistLogo,
  KeepLightbulbLogo,
  TasksCheckmarkLogo,
  ChatBubbleLogo,
  FourColorTopBar,
  MultiColorGoogleWord,
  MODULE_THEMES,
} from './GoogleLogos';
import { Sparkles, ArrowRight, CheckCircle2, Building2, Mail, User, ShieldCheck, BookOpen } from 'lucide-react';

export const WVUSD_SITES = [
  "District Office (Education Center)",
  "Maintenance, Operations & Transportation (MOT)",
  "Nutrition Services",
  "Technology Services",
  "C.J. Morris Elementary",
  "Castle Rock Elementary",
  "Collegewood Elementary",
  "Cyrus J. Morris Elementary",
  "Evergreen Elementary",
  "Maple Hill Elementary",
  "Quail Summit Elementary",
  "Vejar Elementary",
  "Westhoff Elementary",
  "Chaparral Middle School",
  "South Pointe Middle School",
  "Suzanne Middle School",
  "Diamond Bar High School",
  "Walnut High School",
  "Ron Hockwalt Academies",
  "Other WVUSD Site / Department"
];

export const ALLOWED_EMAIL_DOMAINS = ['wvusd.org'];

export function isValidWvusdEmail(emailStr) {
  if (!emailStr || typeof emailStr !== 'string') return false;
  const trimmed = emailStr.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0]) return false;
  return ALLOWED_EMAIL_DOMAINS.includes(parts[1]);
}

export default function IntakeScreen({ candidate, onStartExam }) {
  const [fullName, setFullName] = useState(candidate?.fullName || '');
  const [site, setSite] = useState(candidate?.site || '');
  const [email, setEmail] = useState(candidate?.email || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!site) {
      setError('Please select your WVUSD School Site or Department.');
      return;
    }
    if (!isValidWvusdEmail(email)) {
      setError('Access Restricted: Please sign in with an official @wvusd.org email address.');
      return;
    }
    setError('');
    const trimmedName = fullName.trim();
    onStartExam({
      name: trimmedName,
      fullName: trimmedName,
      site,
      email: email.trim().toLowerCase(),
      startedAt: candidate?.startedAt || new Date().toISOString(),
    });
  };

  const handleQuickDemo = () => {
    setFullName('Alex Rivera');
    setSite('District Office (Education Center)');
    setEmail('arivera@wvusd.org');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 relative z-10">
      {/* Main Welcome & Intake Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden relative">
        {/* 4-Color Segmented Top Bar */}
        <FourColorTopBar height="h-2.5" />

        {/* Playful Floating Corner Logos inside the Card Header */}
        <div className="absolute top-6 left-6 hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 shadow-sm transform -rotate-12 pointer-events-none">
          <DocsPageLogo className="w-9 h-9" />
        </div>
        <div className="absolute top-6 right-6 hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50/80 border border-amber-100 shadow-sm transform rotate-6 pointer-events-none">
          <SlidesPresentationLogo className="w-9 h-9" />
        </div>
        <div className="absolute top-24 left-14 hidden md:flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50/80 border border-emerald-100 shadow-sm transform rotate-6 pointer-events-none">
          <SheetsGridLogo className="w-7 h-7" />
        </div>
        <div className="absolute top-24 right-14 hidden md:flex items-center justify-center w-11 h-11 rounded-xl bg-purple-50/80 border border-purple-100 shadow-sm transform -rotate-6 pointer-events-none">
          <FormsChecklistLogo className="w-7 h-7" />
        </div>

        {/* Hero Welcome Banner */}
        <div className="px-6 pt-8 pb-6 sm:px-12 sm:pt-10 text-center bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#1967D2] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBC05] fill-[#FBBC05]" />
            Walnut Valley Unified School District
          </div>

          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100 inline-flex items-center gap-2.5">
              <GoogleGLogo className="w-9 h-9 sm:w-10 sm:h-10" />
              <div className="h-7 w-[1.5px] bg-slate-200" />
              <ChromeWheelLogo className="w-7 h-7" />
              <DriveTriangleLogo className="w-7 h-7" />
              <KeepLightbulbLogo className="w-7 h-7" />
              <TasksCheckmarkLogo className="w-7 h-7" />
              <ChatBubbleLogo className="w-7 h-7" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            <MultiColorGoogleWord />{' '}
            <span className="text-slate-800">Workspace</span>
          </h1>
          <p className="mt-2 text-lg sm:text-xl font-bold text-slate-700">
            WVUSD Classified Level 1 Certification — <span className="text-[#4285F4]">Foundations</span>
          </p>
          <p className="mt-2 max-w-2xl mx-auto text-sm sm:text-base text-slate-500">
            Welcome! This interactive certification exam covers the 8 core Google Workspace modules used across WVUSD schools and departments. Your progress is automatically saved as you go.
          </p>

          {/* 8 Module Pill Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {Object.values(MODULE_THEMES).map((mod) => {
              const IconComponent = mod.Icon;
              return (
                <span
                  key={mod.name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${mod.badgeBg} ${mod.badgeText} ${mod.badgeBorder} shadow-2xs`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  {mod.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Candidate Intake Form + Exam Overview */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
                Candidate Registration
              </h2>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-xs font-semibold text-[#4285F4] hover:text-blue-700 underline decoration-dotted cursor-pointer"
              >
                Fill Demo Candidate
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#C5221F] text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EA4335] shrink-0" />
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Maria Gonzalez"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* School Site / Department Dropdown */}
            <div>
              <label htmlFor="site" className="block text-sm font-semibold text-slate-700 mb-1.5">
                WVUSD School Site / Department <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="site"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full pl-11 pr-9 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all appearance-none"
                >
                  <option value="">Select your school site or department...</option>
                  {WVUSD_SITES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* WVUSD Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                WVUSD Email Address <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@wvusd.org"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#34A853] shrink-0" />
                <span>Restricted to <code className="font-bold text-slate-700">@wvusd.org</code> accounts only.</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-base shadow-lg shadow-[#4285F4]/25 hover:shadow-[#4285F4]/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Launch Level 1 Foundations Exam</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Info Cards Column */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50/90 rounded-2xl p-5 border border-slate-200/70">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4285F4]" />
              Part 1 Exam Format
            </h3>

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#34A853] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">25 Multiple-Choice Questions:</span> Practical scenarios covering Chrome, Tasks & Keep, Drive, Docs, Chat & Spaces, Sheets, Forms, and Slides.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#FBBC05] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">80% Passing Score (20/25):</span> Instant diagnostic grading with module-by-module mastery bars and answer explanations.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#4285F4] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Auto-Save Protection:</span> Refreshing your browser or switching tabs will never lose your answers or flagged items.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#EA4335] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Flag for Review:</span> Unsure on a question? Flag it in Google Yellow and jump back anytime using the 1–25 Navigator Grid.
                </div>
              </li>
            </ul>

            {/* Mini Color Legend */}
            <div className="pt-3 border-t border-slate-200/80">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Question Navigator Color Key
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-[#4285F4]" />
                  <span className="text-slate-700">Current</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-[#34A853]" />
                  <span className="text-slate-700">Answered</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-[#FBBC05]" />
                  <span className="text-slate-700">Flagged</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
