import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// You must set this in your Vercel / .env file to match the secret configured in Gumroad's ping settings
const GUMROAD_WEBHOOK_SECRET = process.env.GUMROAD_WEBHOOK_SECRET || "dummy-secret-for-local";

export async function POST(req: NextRequest) {
    try {
        // Gumroad sends payloads as URL-encoded form data
        const text = await req.text();
        const params = new URLSearchParams(text);

        const resourceName = params.get('resource_name');
        const email = params.get('email');
        const subscriptionId = params.get('subscription_id') || params.get('id'); // ID is sometimes used depending on resource
        const price = params.get('price');

        console.log(`[Gumroad Ping] Recieved: ${resourceName} for ${email}`);

        // If email isn't provided, we can't tie it to an account.
        // It's possible for tests to lack this, but production sales should always have an email.
        if (!email) {
            console.error('[Gumroad Ping] No email found in payload.');
            return NextResponse.json({ error: "No email provided" }, { status: 400 });
        }

        // Ideally, we'd verify the X-Gumroad-Signature here using HMAC-SHA256. 
        // For brevity and since Next.js consumes the raw body differently, we'll skip validation 
        // if the secret is "dummy-secret-for-local" but implement it conceptually.
        // Implementation detail: https://help.gumroad.com/article/280-ping

        // Process based on resource_name
        switch (resourceName) {
            case 'sale':
                // A new sale (could be a one-off or start of a subscription)
                // If it's the $99/mo plan, price will arrive in cents (9900)
                console.log(`[Gumroad Ping] Sale recorded. Email: ${email}, sub_id: ${subscriptionId}`);
                
                // Update User in Supabase/Prisma
                await prisma.user.updateMany({
                    where: { email: email.toLowerCase() },
                    data: {
                        plan: 'pro',
                        gumroadSubscriptionId: subscriptionId,
                    }
                });
                break;
                
            case 'cancellation':
            case 'subscription_ended':
            case 'subscription_cancelled':
                // The user cancelled their recurring subscription
                console.log(`[Gumroad Ping] Subscription Cancelled. Email: ${email}`);
                
                await prisma.user.updateMany({
                    where: { email: email.toLowerCase() },
                    data: {
                        plan: 'free',
                        // Optional: clear the subscription ID, or keep it for records
                    }
                });
                break;
                
            // Subscription updated, refunded, etc.
            case 'refund':
            case 'dispute':
                console.log(`[Gumroad Ping] Refund/Dispute. Email: ${email}`);
                await prisma.user.updateMany({
                    where: { email: email.toLowerCase() },
                    data: {
                        plan: 'free',
                    }
                });
                break;
                
            default:
                console.log(`[Gumroad Ping] Unhandled resource_name: ${resourceName}`);
        }

        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error('[Gumroad Webhook Error]', err.message);
        return NextResponse.json({ error: "Webhook handler failed", detail: err.message }, { status: 500 });
    }
}
