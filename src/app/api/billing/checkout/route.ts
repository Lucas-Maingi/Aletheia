import { NextRequest, NextResponse } from "next/server";
import { getEffectiveUserId } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
    try {
        const user = await getEffectiveUserId();
        const body = await req.json();
        const variantId = body?.variantId;

        if (!user || user.isGuest) {
            return NextResponse.json({ error: "Authentication required to subscribe" }, { status: 401 });
        }

        if (!variantId) {
            return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
        }

        const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
        const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

        // Secure handling during pre-flight build:
        // Returns a safe fallback URL so the UI button wiring can be verified 
        // without crashing before Lemon Squeezy approval.
        if (!apiKey || !storeId) {
            console.warn("[BILLING] Missing API keys. Returning mock URL for pre-flight testing.");
            return NextResponse.json({ url: "https://app.lemonsqueezy.com/checkout/mock" });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aletheia.software";

        const checkoutPayload = {
            data: {
                type: "checkouts",
                attributes: {
                    checkout_data: {
                        custom: {
                            user_id: user.id
                        }
                    },
                    product_options: {
                        redirect_url: `${appUrl}/dashboard?upgrade=success`
                    }
                },
                relationships: {
                    store: {
                        data: {
                            type: "stores",
                            id: String(storeId)
                        }
                    },
                    variant: {
                        data: {
                            type: "variants",
                            id: String(variantId)
                        }
                    }
                }
            }
        };

        const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
            method: "POST",
            headers: {
                "Accept": "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(checkoutPayload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`[BILLING] Lemon Squeezy API error (${response.status}):`, errorData);
            return NextResponse.json({ error: "Failed to generate checkout session" }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json({ url: data.data.attributes.url });

    } catch (error: any) {
        console.error("[BILLING] Checkout creation failed:", error.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
