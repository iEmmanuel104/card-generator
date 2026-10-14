import type { Metadata } from "next";

// Private, link-only invitation: keep it out of search engines and link previews
// that could surface it to people who were not sent the link.
export const metadata: Metadata = {
    title: "BAL Lagos · Private Invitation",
    description:
        "An exclusive Basketball Africa League evening in Lagos. Thursday, November 5, 2026 · 7:00 PM. RSVP required.",
    robots: { index: false, follow: false, nocache: true },
};

export default function BalLagosLayout({ children }: { children: React.ReactNode }) {
    return children;
}
