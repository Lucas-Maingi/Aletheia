/**
 * Shared Email Dispatch Utility
 * Communicates with the Resend API using native fetch.
 * Falls back to server log recording if RESEND_API_KEY is not configured in .env.
 */
export async function sendEmail({
    to,
    subject,
    html
}: {
    to: string;
    subject: string;
    html: string;
}) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

    if (!apiKey) {
        console.log("==================================================");
        console.log(`[MOCK EMAIL DISPATCH] (Configure RESEND_API_KEY in .env to send for real)`);
        console.log(`From:    ${fromAddress}`);
        console.log(`To:      ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:`);
        console.log(html);
        console.log("==================================================");
        return { success: true, mock: true };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: fromAddress,
                to,
                subject,
                html
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log(`[Email Dispatch Success] Message sent to ${to}. MessageID: ${data.id}`);
            return { success: true, id: data.id };
        } else {
            console.error(`[Email Dispatch Failure] Resend API Error:`, data);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error(`[Email Dispatch Exception] Failed to send email to ${to}:`, error);
        return { success: false, error };
    }
}
