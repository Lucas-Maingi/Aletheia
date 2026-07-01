import crypto from 'crypto';

export interface WebhookPayload {
    event: 'investigation.completed' | 'ping';
    timestamp: string;
    data: any;
}

/**
 * Dispatches a webhook payload to the user's SIEM/SOAR integration.
 * Signs the payload using HMAC SHA-256 if a secret is provided.
 */
export async function dispatchWebhook(url: string, secret: string | null | undefined, payload: WebhookPayload) {
    if (!url) return;

    try {
        const body = JSON.stringify(payload);
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Aletheia-SIEM-Webhook/1.0',
        };

        if (secret) {
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(body);
            const signature = hmac.digest('hex');
            headers['X-Aletheia-Signature'] = `sha256=${signature}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body,
            // Timeout after 5 seconds to prevent hanging the scan process
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            console.error(`[Webhook] Failed to dispatch. Status: ${response.status} ${response.statusText}`);
        } else {
            console.log(`[Webhook] Successfully dispatched event: ${payload.event}`);
        }
    } catch (error) {
        console.error(`[Webhook] Dispatch error:`, error);
    }
}
