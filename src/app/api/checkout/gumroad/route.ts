import { NextRequest, NextResponse } from "next/server";
import { getEffectiveUserId } from "@/lib/auth-utils";

// Make sure your Gumroad URL accepts ?email= parameters
const GUMROAD_PRO_URL = "https://lucas808.gumroad.com/l/aletheia-pro";
const GUMROAD_ELITE_URL = "mailto:contact@aletheia.so?subject=Elite%20Team%20Inquiry";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const plan = searchParams.get('plan') || 'pro';
        
        // Grab the active session so we know who the purchaser is
        const { email, isGuest } = await getEffectiveUserId();

        // We do not allow guest checkouts for subscriptions since they have no persistent account 
        if (isGuest) {
            // Redirect to sign in if they aren't authenticated
            const loginUrl = new URL('/auth/login', req.url);
            loginUrl.searchParams.set('redirect', `/api/checkout/gumroad?plan=${plan}`);
            return NextResponse.redirect(loginUrl);
        }

        // Build Gumroad link
        let checkoutUrl = GUMROAD_PRO_URL;
        if (plan === 'elite') {
            checkoutUrl = GUMROAD_ELITE_URL;
        } else {
            // Append the user's email to the query string so Gumroad associates the purchase 
            // with this specific Aletheia account during the webhook Ping
            const urlConstructor = new URL(checkoutUrl);
            if (email) {
                urlConstructor.searchParams.set('email', email);
            }
            checkoutUrl = urlConstructor.toString();
        }

        // Redirect user to the checkout experience
        return NextResponse.redirect(checkoutUrl);
    } catch (err: any) {
        console.error('[Gumroad Checkout Error]:', err.message);
        return NextResponse.redirect(new URL('/pricing?error=checkout_failed', req.url));
    }
}
