"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { CalendarDays, Check, Clock, Loader2, MapPin, Shirt } from "lucide-react";
import { getEventConfig } from "@/lib/events";

const EVENT_SLUG = "executive-dinner-lagos" as const;
const config = getEventConfig(EVENT_SLUG);
const POSTER_URL = config.cardTemplate.path;

const DETAILS = [
    { icon: CalendarDays, label: "Date", value: "Saturday, August 22, 2026" },
    { icon: Clock, label: "Time", value: "6:00 PM prompt" },
    { icon: MapPin, label: "Venue", value: "Knowhere Lagos — 17 Adeola Odeku Street, Lagos, Nigeria" },
    { icon: Shirt, label: "Dress code", value: "African Elegant Attire" },
];

export default function ExecutiveDinnerLagosPage() {
    const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", organization: "" });
    const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
    const [error, setError] = useState<string | null>(null);

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setStatus("submitting");
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: EVENT_SLUG, role: "attendee", ...form }),
            });
            const data = await res.json();
            if (!res.ok) {
                // 409 = already registered; treat as success so guests aren't confused.
                if (res.status === 409) {
                    setStatus("done");
                    return;
                }
                throw new Error(data?.message || "Something went wrong. Please try again.");
            }
            setStatus("done");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setStatus("idle");
        }
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
                    {/* Poster */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#e11d2e]/30 shadow-[0_0_60px_-15px_rgba(225,29,46,0.4)]">
                        <Image
                            src={POSTER_URL}
                            alt="The Executive Dinner Lagos — Saturday August 22 2026, 6:00 PM, Knowhere Lagos"
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
                            Strictly by invitation
                        </p>
                        <h1 className="mt-3 text-4xl font-bold leading-tight lg:text-5xl">
                            The Executive Dinner <span className="text-[#e11d2e]">/ Lagos</span>
                        </h1>
                        <p className="mt-4 text-lg text-white/70">{config.tagline}</p>

                        <div className="mt-8 space-y-4">
                            {DETAILS.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start gap-3">
                                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#e11d2e]" aria-hidden />
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
                                        <p className="text-sm text-white/90">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4 text-sm leading-relaxed text-white/70">
                            <p>
                                The Black At Executive Dinner is an exclusive evening bringing together Africa&rsquo;s
                                leading brand executives, the 2026 DARE Award recipients, and the 2027 Executive Cohort.
                            </p>
                            <p>
                                The evening is designed to foster meaningful conversations around the future of brands
                                and creativity, collaboration, and productivity.
                            </p>
                            <p>
                                Guests will enjoy a curated fine dining experience, live music by award-winning artist
                                Lira, and opportunities to connect with visionary leaders and decision-makers shaping
                                Africa&rsquo;s creative and business landscape.
                            </p>
                        </div>

                        {/* RSVP */}
                        <div id="rsvp" className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            {status === "done" ? (
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e11d2e]">
                                        <Check className="h-4 w-4" aria-hidden />
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-semibold">You&rsquo;re on the list</h2>
                                        <p className="mt-1 text-sm text-white/60">
                                            Thank you for confirming. We&rsquo;ll be in touch with the final details
                                            ahead of the evening.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-lg font-semibold">Confirm your attendance</h2>
                                    <p className="mt-1 text-sm text-white/50">
                                        Please RSVP so we can reserve your seat.
                                    </p>
                                    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                                        <input
                                            required
                                            value={form.name}
                                            onChange={set("name")}
                                            placeholder="Full name *"
                                            autoComplete="name"
                                            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-[#e11d2e]"
                                        />
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={set("email")}
                                            placeholder="Email address *"
                                            autoComplete="email"
                                            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-[#e11d2e]"
                                        />
                                        <input
                                            value={form.phoneNumber}
                                            onChange={set("phoneNumber")}
                                            placeholder="Phone number"
                                            autoComplete="tel"
                                            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-[#e11d2e]"
                                        />
                                        <input
                                            value={form.organization}
                                            onChange={set("organization")}
                                            placeholder="Company / organisation"
                                            autoComplete="organization"
                                            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-[#e11d2e]"
                                        />

                                        {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}

                                        <button
                                            type="submit"
                                            disabled={status === "submitting"}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e11d2e] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c4152a] disabled:opacity-60"
                                        >
                                            {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                                            {status === "submitting" ? "Confirming…" : "Confirm attendance"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
