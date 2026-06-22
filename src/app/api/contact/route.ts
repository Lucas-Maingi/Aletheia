import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required." },
                { status: 400 }
            );
        }

        // 1. Save to the database as feedback of type "contact"
        const contactFeedback = await prisma.feedback.create({
            data: {
                name,
                email,
                content: message,
                type: `contact: ${subject || "general"}`,
                version: "1.0.0",
                status: "pending"
            }
        });

        // 2. Dispatch email notification to admin's inbox (without exposing it on UI)
        const adminEmailHtml = `
            <div style="font-family: monospace; background-color: #020617; color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
                <h2 style="color: #00f0ff; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">
                    [Aletheia Secure Uplink] new contact inquiry
                </h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px;">
                    <tr style="border-bottom: 1px solid #0f172a;">
                        <td style="padding: 8px 0; color: #94a3b8; width: 140px; font-weight: bold; text-transform: uppercase;">Sender Name:</td>
                        <td style="padding: 8px 0; color: #f8fafc;">${name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #0f172a;">
                        <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Uplink Email:</td>
                        <td style="padding: 8px 0; color: #00f0ff;"><a href="mailto:${email}" style="color: #00f0ff; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #0f172a;">
                        <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Target Route:</td>
                        <td style="padding: 8px 0; color: #e2e8f0; font-weight: bold;">${(subject || "general").toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; text-transform: uppercase; vertical-align: top;">Timestamp:</td>
                        <td style="padding: 8px 0; color: #64748b;">${new Date().toISOString()}</td>
                    </tr>
                </table>

                <div style="margin-top: 25px; padding: 20px; background-color: #0b1329; border-radius: 8px; border: 1px solid #1e293b; color: #cbd5e1; line-height: 1.6; font-size: 13px; white-space: pre-wrap;">
${message}
                </div>
                
                <div style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
                    Ticket ID: ${contactFeedback.id} • Secure Uplink Active
                </div>
            </div>
        `;

        await sendEmail({
            to: "lucasmaingi.tech@gmail.com",
            subject: `[Aletheia Secure Uplink] Contact from ${name} (${(subject || "general").toUpperCase()})`,
            html: adminEmailHtml
        });

        // 3. Notify existing admins via db notifications
        const admins = await prisma.user.findMany({
            where: { role: "admin" },
            select: { id: true }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: "New Contact Inquiry Received",
                    message: `New support uplink from ${name} (${email})`,
                    type: "info"
                }))
            });
        }

        return NextResponse.json({ success: true, feedback: contactFeedback });
    } catch (error) {
        console.error("[API:CONTACT] Error:", error);
        return NextResponse.json(
            { error: "Failed to dispatch uplink payload." },
            { status: 500 }
        );
    }
}
