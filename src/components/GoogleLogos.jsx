import React from 'react';

/**
 * Custom multi-color inline SVGs for the Google Workspace product suite
 * and the 8 Level 1 Curriculum Modules.
 */

export const GoogleGLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M44.5 20H24V28.5H35.8C34.7 33.9 30.1 37.5 24 37.5C16.5 37.5 10.5 31.5 10.5 24C10.5 16.5 16.5 10.5 24 10.5C27.4 10.5 30.4 11.8 32.8 14L39.2 7.6C35.2 3.9 29.9 1.5 24 1.5C11.6 1.5 1.5 11.6 1.5 24C1.5 36.4 11.6 46.5 24 46.5C35.3 46.5 45.5 38.3 45.5 24C45.5 22.5 45.1 21.2 44.5 20Z" fill="#4285F4"/>
    <path d="M4.1 13.7L11.5 19.1C13.5 14.1 18.3 10.5 24 10.5C27.4 10.5 30.4 11.8 32.8 14L39.2 7.6C35.2 3.9 29.9 1.5 24 1.5C15.3 1.5 7.8 6.4 4.1 13.7Z" fill="#EA4335"/>
    <path d="M24 46.5C29.8 46.5 35.1 44.3 39.1 40.6L32 34.8C29.8 36.5 27 37.5 24 37.5C18 37.5 13.3 33.8 11.4 28.4L3.9 34.1C7.6 41.5 15.2 46.5 24 46.5Z" fill="#34A853"/>
    <path d="M44.5 20H24V28.5H35.8C35.2 31.1 33.7 33.3 31.9 34.8L39 40.6C43.1 36.8 45.5 31.1 45.5 24C45.5 22.5 45.1 21.2 44.5 20Z" fill="#4285F4"/>
    <path d="M3.9 34.1L11.4 28.4C10.8 26.9 10.5 25.5 10.5 24C10.5 22.3 10.8 20.6 11.5 19.1L4.1 13.7C2.4 16.8 1.5 20.3 1.5 24C1.5 27.6 2.4 31.1 3.9 34.1Z" fill="#FBBC05"/>
  </svg>
);

export const ChromeWheelLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="21" fill="#FFFFFF" />
    {/* Red top sector */}
    <path d="M24 3C15.4 3 8.1 8.1 4.8 15.5L15.6 34.2L24 24H42.9C39.8 11.9 32.6 3 24 3Z" fill="#EA4335"/>
    {/* Green bottom-left sector */}
    <path d="M4.8 15.5C3.6 18.1 3 21 3 24C3 35.6 12.4 45 24 45L33.3 28.8L24 24L15.6 34.2L4.8 15.5Z" fill="#34A853"/>
    {/* Yellow bottom-right sector */}
    <path d="M24 24L33.3 28.8L24 45C35.6 45 45 35.6 45 24C45 20.4 44.1 17 42.5 14H24V24Z" fill="#FBBC05"/>
    {/* Center white ring & blue core */}
    <circle cx="24" cy="24" r="10.5" fill="#FFFFFF"/>
    <circle cx="24" cy="24" r="8" fill="#4285F4"/>
  </svg>
);

export const DriveTriangleLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Green Left */}
    <path d="M17.2 6L4 28.8L11.2 41.2L24.4 18.4L17.2 6Z" fill="#34A853"/>
    {/* Yellow Top-Right */}
    <path d="M30.8 6H17.2L30.4 28.8H44L30.8 6Z" fill="#FBBC05"/>
    {/* Blue Bottom */}
    <path d="M11.2 41.2L17.8 28.8H44L37.2 41.2H11.2Z" fill="#4285F4"/>
    {/* Subtle fold accents */}
    <path d="M24 17.7L17.2 6L11.2 41.2L17.8 28.8L24 17.7Z" fill="#188038" fillOpacity="0.25"/>
  </svg>
);

export const DocsPageLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V16L28 4H12Z" fill="#4285F4"/>
    <path d="M28 4V16H40L28 4Z" fill="#A1C2FA"/>
    <rect x="14" y="21" width="20" height="3" rx="1.5" fill="#FFFFFF"/>
    <rect x="14" y="27" width="20" height="3" rx="1.5" fill="#FFFFFF"/>
    <rect x="14" y="33" width="13" height="3" rx="1.5" fill="#FFFFFF"/>
  </svg>
);

export const SheetsGridLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V16L28 4H12Z" fill="#0F9D58"/>
    <path d="M28 4V16H40L28 4Z" fill="#87CEAC"/>
    <rect x="14" y="20" width="20" height="16" rx="1.5" stroke="#FFFFFF" strokeWidth="2.5"/>
    <line x1="14" y1="26" x2="34" y2="26" stroke="#FFFFFF" strokeWidth="2.2"/>
    <line x1="14" y1="31" x2="34" y2="31" stroke="#FFFFFF" strokeWidth="2.2"/>
    <line x1="22" y1="20" x2="22" y2="36" stroke="#FFFFFF" strokeWidth="2.2"/>
  </svg>
);

export const SlidesPresentationLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V16L28 4H12Z" fill="#F4B400"/>
    <path d="M28 4V16H40L28 4Z" fill="#FDE293"/>
    <rect x="13" y="21" width="22" height="14" rx="2" fill="#FFFFFF"/>
    <rect x="16" y="24" width="16" height="8" rx="1" fill="#F4B400"/>
  </svg>
);

export const FormsChecklistLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V16L28 4H12Z" fill="#673AB7"/>
    <path d="M28 4V16H40L28 4Z" fill="#D1C4E9"/>
    <circle cx="16.5" cy="22.5" r="2" fill="#FFFFFF"/>
    <rect x="21" y="21" width="13" height="3" rx="1.5" fill="#FFFFFF"/>
    <circle cx="16.5" cy="28.5" r="2" fill="#FFFFFF"/>
    <rect x="21" y="27" width="13" height="3" rx="1.5" fill="#FFFFFF"/>
    <circle cx="16.5" cy="34.5" r="2" fill="#FFFFFF"/>
    <rect x="21" y="33" width="10" height="3" rx="1.5" fill="#FFFFFF"/>
  </svg>
);

export const KeepLightbulbLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="36" height="40" rx="8" fill="#FBBC05"/>
    <path d="M24 12C18.48 12 14 16.48 14 22C14 25.54 15.84 28.64 18.61 30.42L19.5 31H28.5L29.39 30.42C32.16 28.64 34 25.54 34 22C34 16.48 29.52 12 24 12Z" fill="#FFFFFF"/>
    <rect x="19.5" y="33" width="9" height="2.8" rx="1.4" fill="#FFFFFF"/>
    <path d="M21 37.5H27C27 38.88 25.66 40 24 40C22.34 40 21 38.88 21 37.5Z" fill="#FFFFFF"/>
  </svg>
);

export const TasksCheckmarkLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="20" fill="#4285F4"/>
    <circle cx="24" cy="24" r="14" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.35"/>
    <path d="M16.5 24.5L21.8 29.8L34.5 17.1" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="24" cy="9.5" r="2.2" fill="#FBBC05"/>
  </svg>
);

export const TasksAndKeepComboLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Keep Yellow Card Base */}
    <rect x="4" y="4" width="28" height="32" rx="6" fill="#FBBC05"/>
    <path d="M18 10C14.13 10 11 13.13 11 17C11 19.48 12.29 21.65 14.23 22.89L14.85 23.3H21.15L21.77 22.89C23.71 21.65 25 19.48 25 17C25 13.13 21.87 10 18 10Z" fill="#FFFFFF"/>
    <rect x="15" y="25" width="6" height="2.2" rx="1" fill="#FFFFFF"/>
    {/* Tasks Blue Check Circle Badge */}
    <circle cx="32" cy="32" r="13" fill="#4285F4" stroke="#FFFFFF" strokeWidth="2.5"/>
    <path d="M26.5 32.2L30.2 35.8L38 28" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChatBubbleLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8C7.79 8 6 9.79 6 12V32C6 34.21 7.79 36 10 36H14V43L22.5 36H38C40.21 36 42 34.21 42 32V12C42 9.79 40.21 8 38 8H10Z" fill="#34A853"/>
    <path d="M16 14H34C35.1 14 36 14.9 36 16V26C36 27.1 35.1 28 34 28H20L14 32.5V16C14 14.9 14.9 14 16 14Z" fill="#188038" fillOpacity="0.35"/>
    <rect x="14" y="18" width="20" height="3" rx="1.5" fill="#FFFFFF"/>
    <rect x="14" y="24" width="13" height="3" rx="1.5" fill="#FFFFFF"/>
  </svg>
);

/**
 * 4-Color Google Segmented Top Bar used across all cards and header
 */
export const FourColorTopBar = ({ height = "h-2" }) => (
  <div className={`w-full grid grid-cols-4 ${height} overflow-hidden`}>
    <div className="bg-[#4285F4]" />
    <div className="bg-[#EA4335]" />
    <div className="bg-[#FBBC05]" />
    <div className="bg-[#34A853]" />
  </div>
);

/**
 * Module Metadata Lookup matching the exact 8 Level 1 Curriculum Modules table:
 * - Chrome Browser: Multi-color (#4285F4 / #EA4335 / #FBBC05 / #34A853), Chrome 4-Color Wheel
 * - Tasks & Keep: Google Yellow (#FBBC05) & Blue (#4285F4), Keep Lightbulb & Tasks Checkmark
 * - Google Drive: Tri-color Drive (#34A853 / #FBBC05 / #4285F4), Google Drive Triangle
 * - Google Docs: Google Blue (#4285F4), Blue Document Page
 * - Google Chat & Spaces: Google Green (#34A853), Green Chat Speech Bubble
 * - Google Sheets: Google Green (#0F9D58), Green Spreadsheet Grid
 * - Google Forms: Forms Purple (#673AB7), Purple Checklist Page
 * - Google Slides: Google Yellow (#F4B400), Yellow Presentation Frame
 */
export const MODULE_THEMES = {
  "Chrome Browser": {
    name: "Chrome Browser",
    accentHex: "#4285F4",
    secondaryHex: "#EA4335",
    badgeBg: "bg-[#4285F4]/10",
    badgeText: "text-[#1967D2]",
    badgeBorder: "border-[#4285F4]/30",
    barGradient: "linear-gradient(90deg, #4285F4 0%, #EA4335 33%, #FBBC05 66%, #34A853 100%)",
    colorLabel: "Multi-color (#4285F4 / #EA4335 / #FBBC05 / #34A853)",
    iconLabel: "Chrome 4-Color Wheel",
    Icon: ChromeWheelLogo,
  },
  "Tasks & Keep": {
    name: "Tasks & Keep",
    accentHex: "#FBBC05",
    secondaryHex: "#4285F4",
    badgeBg: "bg-[#FBBC05]/15",
    badgeText: "text-[#B06000]",
    badgeBorder: "border-[#FBBC05]/40",
    barGradient: "linear-gradient(90deg, #FBBC05 0%, #4285F4 100%)",
    colorLabel: "Google Yellow (#FBBC05) & Blue (#4285F4)",
    iconLabel: "Keep Lightbulb & Tasks Checkmark",
    Icon: TasksAndKeepComboLogo,
  },
  "Google Drive": {
    name: "Google Drive",
    accentHex: "#34A853",
    secondaryHex: "#4285F4",
    badgeBg: "bg-[#34A853]/10",
    badgeText: "text-[#137333]",
    badgeBorder: "border-[#34A853]/30",
    barGradient: "linear-gradient(90deg, #34A853 0%, #FBBC05 50%, #4285F4 100%)",
    colorLabel: "Tri-color Drive (#34A853 / #FBBC05 / #4285F4)",
    iconLabel: "Google Drive Triangle",
    Icon: DriveTriangleLogo,
  },
  "Google Docs": {
    name: "Google Docs",
    accentHex: "#4285F4",
    secondaryHex: "#4285F4",
    badgeBg: "bg-[#4285F4]/10",
    badgeText: "text-[#185ABC]",
    badgeBorder: "border-[#4285F4]/30",
    barGradient: "#4285F4",
    colorLabel: "Google Blue (#4285F4)",
    iconLabel: "Blue Document Page",
    Icon: DocsPageLogo,
  },
  "Google Chat & Spaces": {
    name: "Google Chat & Spaces",
    accentHex: "#34A853",
    secondaryHex: "#34A853",
    badgeBg: "bg-[#34A853]/10",
    badgeText: "text-[#137333]",
    badgeBorder: "border-[#34A853]/30",
    barGradient: "#34A853",
    colorLabel: "Google Green (#34A853)",
    iconLabel: "Green Chat Speech Bubble",
    Icon: ChatBubbleLogo,
  },
  "Google Sheets": {
    name: "Google Sheets",
    accentHex: "#0F9D58",
    secondaryHex: "#0F9D58",
    badgeBg: "bg-[#0F9D58]/10",
    badgeText: "text-[#0D652D]",
    badgeBorder: "border-[#0F9D58]/30",
    barGradient: "#0F9D58",
    colorLabel: "Google Green (#0F9D58)",
    iconLabel: "Green Spreadsheet Grid",
    Icon: SheetsGridLogo,
  },
  "Google Forms": {
    name: "Google Forms",
    accentHex: "#673AB7",
    secondaryHex: "#673AB7",
    badgeBg: "bg-[#673AB7]/10",
    badgeText: "text-[#512DA8]",
    badgeBorder: "border-[#673AB7]/30",
    barGradient: "#673AB7",
    colorLabel: "Forms Purple (#673AB7)",
    iconLabel: "Purple Checklist Page",
    Icon: FormsChecklistLogo,
  },
  "Google Slides": {
    name: "Google Slides",
    accentHex: "#F4B400",
    secondaryHex: "#F4B400",
    badgeBg: "bg-[#F4B400]/15",
    badgeText: "text-[#A86800]",
    badgeBorder: "border-[#F4B400]/40",
    barGradient: "#F4B400",
    colorLabel: "Google Yellow (#F4B400)",
    iconLabel: "Yellow Presentation Frame",
    Icon: SlidesPresentationLogo,
  },
};

export const getModuleTheme = (moduleName) => {
  return MODULE_THEMES[moduleName] || MODULE_THEMES["Chrome Browser"];
};

/**
 * Floating decorative background Google Workspace icons in the corners of the viewport
 */
export const FloatingWorkspaceBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
    {/* Top Left Corner: Drive & Docs */}
    <div className="absolute -top-4 -left-4 sm:top-16 sm:left-6 opacity-20 sm:opacity-30 transform -rotate-12 animate-float-slow">
      <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
        <DriveTriangleLogo className="w-12 h-12 sm:w-14 sm:h-14" />
      </div>
    </div>
    <div className="hidden lg:block absolute top-44 left-12 opacity-25 transform rotate-6 animate-float-delayed">
      <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
        <DocsPageLogo className="w-10 h-10" />
      </div>
    </div>

    {/* Top Right Corner: Chrome & Slides */}
    <div className="absolute top-16 -right-3 sm:top-20 sm:right-8 opacity-20 sm:opacity-30 transform rotate-12 animate-float-delayed">
      <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
        <ChromeWheelLogo className="w-12 h-12 sm:w-14 sm:h-14" />
      </div>
    </div>
    <div className="hidden lg:block absolute top-52 right-14 opacity-25 transform -rotate-6 animate-float-slow">
      <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
        <SlidesPresentationLogo className="w-10 h-10" />
      </div>
    </div>

    {/* Bottom Left Corner: Sheets & Keep */}
    <div className="absolute bottom-8 left-4 sm:bottom-12 sm:left-10 opacity-20 sm:opacity-30 transform rotate-6 animate-float-delayed">
      <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
        <SheetsGridLogo className="w-11 h-11 sm:w-13 sm:h-13" />
      </div>
    </div>
    <div className="hidden xl:block absolute bottom-44 left-16 opacity-25 transform -rotate-12 animate-float-slow">
      <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
        <KeepLightbulbLogo className="w-9 h-9" />
      </div>
    </div>

    {/* Bottom Right Corner: Forms & Chat */}
    <div className="absolute bottom-8 right-4 sm:bottom-12 sm:right-10 opacity-20 sm:opacity-30 transform -rotate-12 animate-float-slow">
      <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
        <FormsChecklistLogo className="w-11 h-11 sm:w-13 sm:h-13" />
      </div>
    </div>
    <div className="hidden xl:block absolute bottom-44 right-16 opacity-25 transform rotate-6 animate-float-delayed">
      <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
        <ChatBubbleLogo className="w-9 h-9" />
      </div>
    </div>
  </div>
);

/**
 * Multi-color "Google" wordmark treatment
 */
export const MultiColorGoogleWord = ({ className = "" }) => (
  <span className={`font-extrabold tracking-tight inline-flex ${className}`}>
    <span className="text-[#4285F4]">G</span>
    <span className="text-[#EA4335]">o</span>
    <span className="text-[#FBBC05]">o</span>
    <span className="text-[#4285F4]">g</span>
    <span className="text-[#34A853]">l</span>
    <span className="text-[#EA4335]">e</span>
  </span>
);

export default {
  GoogleGLogo,
  ChromeWheelLogo,
  DriveTriangleLogo,
  DocsPageLogo,
  SheetsGridLogo,
  SlidesPresentationLogo,
  FormsChecklistLogo,
  KeepLightbulbLogo,
  TasksCheckmarkLogo,
  TasksAndKeepComboLogo,
  ChatBubbleLogo,
  FourColorTopBar,
  MODULE_THEMES,
  getModuleTheme,
  FloatingWorkspaceBackground,
  MultiColorGoogleWord,
};
