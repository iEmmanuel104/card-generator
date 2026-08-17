"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const POSTER_URL = "https://blkat.b-cdn.net/events/masterclass-detroit-poster.jpg";

const PRESENTED_BY = [
    "Design Core Detroit",
    "Detroit UNESCO City of Design",
    "Gilbert Family Foundation",
    "ProsperUs Detroit",
];

export default function MasterclassDetroitPromo() {
    const blkatBase = process.env.NEXT_PUBLIC_BLKAT_URL || "http://localhost:5173";
    const blkatEventUrl = `${blkatBase.replace(/\/$/, "")}/events/masterclass-detroit`;

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#e11d2e]/30 shadow-[0_0_60px_-15px_rgba(225,29,46,0.4)]">
                        <Image
                            src={POSTER_URL}
                            alt="Masterclass Detroit with Spike Lee — Wednesday September 9 2026, Detroit"
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <p className="text-xs uppercase tracking-[0.4em] text-[#e11d2e]">
                            BLKAT Masterclass &middot; Detroit
                        </p>
                        <h1 className="text-5xl lg:text-6xl font-bold leading-[0.95]">
                            Masterclass
                            <br />
                            <span style={{ color: "#e11d2e" }}>Detroit</span>
                        </h1>
                        <p className="text-xl font-medium text-white">Spike Lee</p>
                        <div className="space-y-4 text-base md:text-lg text-neutral-300 max-w-md leading-relaxed">
                            <p>
                                BLKAT Masterclass lands in Detroit with{" "}
                                <span className="text-white font-medium">Spike Lee</span> — a session
                                with the filmmaker whose work redefined what Black storytelling on
                                screen could be.
                            </p>
                            <p>
                                Expect a working session, not a panel: craft, career, ownership, and
                                what it takes to build a body of work that outlives the moment. Open
                                to creatives, filmmakers, founders and culture-builders across
                                Detroit and beyond.
                            </p>
                            <p className="text-sm text-neutral-400">
                                Venue and full schedule to be announced — RSVP on BLKAT to be first
                                to hear.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-md text-sm">
                            <div>
                                <p className="text-neutral-500 uppercase tracking-wider text-[10px]">
                                    Date
                                </p>
                                <p className="text-white">Wed, Sep 9, 2026</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 uppercase tracking-wider text-[10px]">
                                    Time
                                </p>
                                <p className="text-white">TBA</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 uppercase tracking-wider text-[10px]">
                                    Location
                                </p>
                                <p className="text-white">Detroit, MI</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 uppercase tracking-wider text-[10px]">
                                    Admission
                                </p>
                                <p className="text-white">Free &middot; RSVP required</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-neutral-500 uppercase tracking-wider text-[10px] mb-2">
                                Presented by
                            </p>
                            <p className="text-sm text-neutral-300 max-w-md leading-relaxed">
                                BLKAT in partnership with {PRESENTED_BY.join(", ")}
                            </p>
                        </div>

                        <div className="mt-4">
                            <Link
                                href={blkatEventUrl}
                                className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-semibold text-white transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: "#e11d2e" }}
                            >
                                Get tickets on BLKAT
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <p className="mt-3 text-xs text-neutral-500 max-w-sm">
                                Registration is exclusive to BLKAT members. Sign in or create your
                                account to RSVP.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
