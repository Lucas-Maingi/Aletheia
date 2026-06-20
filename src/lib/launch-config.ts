/**
 * Aletheia Launch & Pricing Configuration
 * Controls pricing tiers, LTD slots, and display logic.
 */

export const LAUNCH_CONFIG = {
  // LTD mode is active — we are selling lifetime deals
  LTD_LAUNCH_MODE: true,

  // Brand
  BRAND_NAME: 'Aletheia',
  TAGLINE: 'Autonomous Intelligence Engine',

  // ──────────────────────────────────────────────
  // PRICING — Lifetime Deals (One-Time Purchase)
  // ──────────────────────────────────────────────
  LTD_TIERS: {
    analyst_pro: {
      name: 'Analyst Pro',
      price: 299,
      originalMonthly: 99,
      slots: 200,
      badge: 'Best Value',
      gumroadId: '', // ← Fill with your Gumroad product short ID
    },
    command_center: {
      name: 'Command Center',
      price: 599,
      originalMonthly: 249,
      slots: 100,
      badge: 'Most Popular',
      gumroadId: '', // ← Fill with your Gumroad product short ID
    },
    agency_arsenal: {
      name: 'Agency Arsenal',
      price: 999,
      originalMonthly: 499,
      slots: 50,
      badge: 'Maximum Power',
      gumroadId: '', // ← Fill with your Gumroad product short ID
    },
  },

  // ──────────────────────────────────────────────
  // PRICING — Future Monthly SaaS (Locked/Coming Soon)
  // ──────────────────────────────────────────────
  MONTHLY_TIERS: {
    free: { name: 'Free', price: 0, investigations: 3 },
    pro: { name: 'Pro', price: 99, investigations: -1 },
    command: { name: 'Command Center', price: 249, investigations: -1 },
    agency: { name: 'Agency', price: 499, investigations: -1 },
  },

  // Guarantee
  MONEY_BACK_DAYS: 30,

  // Social proof
  EARLY_ACCESS_MESSAGE: 'Join 200+ founding analysts. Secure lifetime access before we switch to monthly billing.',
};

export function isLaunchDay() {
  return LAUNCH_CONFIG.LTD_LAUNCH_MODE;
}
