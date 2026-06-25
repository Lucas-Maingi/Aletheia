import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "A valid email address is required." },
                { status: 400 }
            );
        }

        // 1. Check if email already registered in feedback waitlist
        const existing = await prisma.feedback.findFirst({
            where: {
                email,
                type: "waitlist"
            }
        });

        if (existing) {
            return NextResponse.json({ success: true, message: "Already registered." });
        }

        // 2. Save to the database as feedback of type "waitlist"
        const waitlistFeedback = await prisma.feedback.create({
            data: {
                name: "Waitlist Subscriber",
                email,
                content: `Joined waitlist to get updates on Aletheia launch.`,
                type: "waitlist",
                version: "1.0.0",
                status: "pending"
            }
        });

        // 3. Send email to admin
        try {
            const adminEmailHtml = `
                <div style="font-family: monospace; background-color: #020617; color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
                    <h2 style="color: #00f0ff; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">
                        [Aletheia Secure Uplink] new waitlist subscriber
                    </h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
                        <tr style="border-bottom: 1px solid #0f172a;">
                            <td style="padding: 8px 0; color: #94a3b8; width: 140px; font-weight: bold; text-transform: uppercase;">Uplink Email:</td>
                            <td style="padding: 8px 0; color: #00f0ff;"><a href="mailto:${email}" style="color: #00f0ff; text-decoration: none;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; text-transform: uppercase; vertical-align: top;">Timestamp:</td>
                            <td style="padding: 8px 0; color: #64748b;">${new Date().toISOString()}</td>
                        </tr>
                    </table>
                </div>
            `;

            await sendEmail({
                to: "maingilucas0@gmail.com",
                subject: `[Aletheia Secure Uplink] Waitlist Join: ${email}`,
                html: adminEmailHtml
            });
        } catch (emailError) {
            console.error("[API:WAITLIST] Email sending failed:", emailError);
        }

        // 4. Notify admin in db dashboard
        const admins = await prisma.user.findMany({
            where: { role: "admin" },
            select: { id: true }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: "New Waitlist Signup",
                    message: `${email} joined the Aletheia waitlist.`,
                    type: "success"
                }))
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API:WAITLIST] Error:", error);
        return NextResponse.json(
            { error: "Failed to join waitlist." },
            { status: 500 }
        );
    }
}
