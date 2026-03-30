/**
 * OpenVector Launch Configuration
 * Controls the visibility of pricing and LTD-specific UI elements.
 */

export const LAUNCH_CONFIG = {
  // Set this to true on Monday to reveal the LTD price
  LTD_LAUNCH_MODE: process.env.NEXT_PUBLIC_LTD_LAUNCH_MODE === 'true',
  
  // The target launch date (Monday, April 6, 2026 - assuming "next week Monday" from March 30)
  LAUNCH_DATE: '2026-04-06T09:00:00Z',
  
  // Stealth messaging
  STEALTH_MESSAGE: "LTD Reveal: Monday, April 6",
  EARLY_ACCESS_MESSAGE: "Join 50+ early adopters. Price revealed at launch.",
};

export function isLaunchDay() {
  if (LAUNCH_CONFIG.LTD_LAUNCH_MODE) return true;
  
  const now = new Date();
  const launchDate = new Date(LAUNCH_CONFIG.LAUNCH_DATE);
  return now >= launchDate;
}
