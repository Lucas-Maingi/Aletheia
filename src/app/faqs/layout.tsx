import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Aletheia",
  description: "Get answers to common questions about Aletheia's OSINT engines, passive scanning, zero-knowledge privacy keys, and lifetime founding plans.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
