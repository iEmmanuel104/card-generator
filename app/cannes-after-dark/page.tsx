"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const POSTER_URL =
    "https://res.cloudinary.com/drc6omjqc/image/upload/v1779395615/blkat/events/cannes-after-dark-poster.png";

export default function CannesAfterDarkPromo() {
    const blkatBase = process.env.NEXT_PUBLIC_BLKAT_URL || "http://localhost:5173";
    const blkatEventUrl = `${blkatBase.replace(/\/$/, "")}/events/cannes-after-dark`;

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#d4af37]/30 shadow-[0_0_60px_-15px_rgba(212,175,55,0.4)]">
                        <Image
                            src={POSTER_URL}
                            alt="Cannes After Dark with Obi House — Wednesday June 24 2026, Cannes France"
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <p className="text-xs uppercase tracking-[0.4em] text-[#d4af37]">
                            An Exclusive Night in the Heart of Cannes
                        </p>
                        <h1
                            className="text-5xl lg:text-6xl font-bold leading-[0.95]"
                            style={{ color: "#d4af37" }}
                        >
                            Cannes
                            <br />
                            After Dark
                        </h1>
                        <div className="space-y-4 text-base md:text-lg text-neutral-300 max-w-md leading-relaxed">
                            <p>
                                When the Croisette goes quiet,{" "}
                                <span className="text-white font-medium">Cannes After Dark</span>{" "}
                                begins. Step inside BlackAt's most exclusive night of Cannes Lions
                                2026 — a private, by-invitation gathering of the global creative
                                class, hosted at a secret location on the French Riviera.
                            </p>
                            <p>
                                Headlined by{" "}
                                <span className="text-white font-medium">Obi House</span>, the
                                night moves through Afro House, Amapiano, R&B and global grooves
                                until the sun comes up over the Mediterranean. Expect a curated
                                crowd of creatives, founders, brand leaders and culture-shapers —
                                the people behind the work that defines this year's festival.
                            </p>
                            <p className="text-sm text-neutral-400">
                                Doors open 10PM. Music 11PM till dawn. Dress to impress.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-md text-sm">
                            <div>
                                <p className="text-neutral-500 uppercase tracking-wider text-[10px]">
                                    Date
                                </p>
                                <p className="text-white">Wed, Jun 24, 2026</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 uppercase tracking-wider text-[10px]">
                                    Time
                                </p>
                                <p className="text-white">11PM till Dawn</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 uppercase tracking-wider text-[10px]">
                                    Location
                                </p>
                                <p className="text-white">Secret Location · Cannes</p>
                            </div>
                            <div>
                                <p className="text-neutral-500 uppercase tracking-wider text-[10px]">
                                    Hosted by
                                </p>
                                <p className="text-white">EventNoire × Naya Cannes</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Link
                                href={blkatEventUrl}
                                className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-semibold text-black transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: "#d4af37" }}
                            >
                                Register on BlackAt
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <p className="mt-3 text-xs text-neutral-500 max-w-sm">
                                Registration is exclusive to BlackAt members. Sign in or create
                                your account to RSVP — your username carries through to the
                                ticketing form.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
