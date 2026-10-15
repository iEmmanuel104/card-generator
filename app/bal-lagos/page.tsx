"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MapPin,
  Shirt,
} from "lucide-react";
import { getEventConfig } from "@/lib/events";

const EVENT_SLUG = "bal-lagos" as const;
const FLYER = getEventConfig(EVENT_SLUG).cardTemplate;

const DETAILS = [
  { icon: CalendarDays, label: "Date", value: "Thursday, November 5, 2026" },
  { icon: Clock, label: "Time", value: "7:00 PM prompt" },
  {
    icon: MapPin,
    label: "Venue",
    value: "Knowhere Restaurant",
    detail: "17 Adeola Odeku Street, Victoria Island, Lagos 106104, Nigeria",
  },
  { icon: Shirt, label: "Dress code", value: "Proudly African Elegance" },
];

const INPUT =
  "w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/35 outline-none focus:border-[#e11d2e]";

export default function BalLagosPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    organization: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
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
        // 409 = already on the list; treat as success so guests aren't confused.
        if (res.status === 409) {
          setStatus("done");
          return;
        }
        throw new Error(
          data?.message || "Something went wrong. Please try again.",
        );
      }
      setStatus("done");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Flyer */}
          <div
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#d4af37]/30 shadow-[0_0_60px_-15px_rgba(212,175,55,0.35)] lg:max-w-none"
            style={{ aspectRatio: `${FLYER.width} / ${FLYER.height}` }}
          >
            <Image
              src={FLYER.path}
              alt="Save the date: Networking Cocktail with RwandAir, BAL and Visit Rwanda. Thursday 5 November 2026, 7:00 PM, Knowhere Restaurant, 17 Adeola Odeku Street, Victoria Island, Lagos."
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            {/* Hero */}
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">
              Save the date &middot; Lagos
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              Networking <span className="text-[#e11d2e]">Cocktail</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              An exclusive evening celebrating the intersection of basketball,
              African culture, entertainment, tourism, and business.
            </p>
            <p className="mt-3 text-sm text-white/50">
              Jointly hosted by the Basketball Africa League (BAL), Visit
              Rwanda, and RwandAir &middot; taking place alongside CANEX
            </p>

            {/* Details */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {DETAILS.map(({ icon: Icon, label, value, detail }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#e11d2e]"
                    aria-hidden
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      {label}
                    </p>
                    <p className="text-sm text-white/90">{value}</p>
                    {detail && (
                      <p className="mt-0.5 text-xs text-white/50">{detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Copy */}
            <div className="mt-10 space-y-4 text-sm leading-relaxed text-white/70">
              <p>
                Join us for a special evening bringing together leaders,
                executives, creatives, and distinguished guests for an
                experience celebrating the intersection of basketball, African
                culture, entertainment, tourism, and business.
              </p>
              <p>
                The evening will feature entertainment, meaningful
                conversations, networking, and an opportunity to connect with
                leaders from across Africa and the global community.
              </p>
              <p className="text-white/50">
                This is an exclusive event with limited capacity. Please RSVP at
                your earliest convenience.
              </p>
            </div>

            {/* RSVP */}
            <div
              id="rsvp"
              className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              {status === "done" ? (
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e11d2e]">
                    <Check className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">
                      You&rsquo;re on the list
                    </h2>
                    <p className="mt-1 text-sm text-white/60">
                      Thank you for confirming. A confirmation has been sent to
                      your email, and we&rsquo;ll be in touch with final details
                      ahead of the evening.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">
                    Confirm your attendance
                  </h2>
                  <p className="mt-1 text-sm text-white/50">
                    RSVP required &middot; limited capacity.
                  </p>
                  <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <input
                      required
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Full name *"
                      autoComplete="name"
                      className={INPUT}
                    />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="Email address *"
                      autoComplete="email"
                      className={INPUT}
                    />
                    <input
                      value={form.phoneNumber}
                      onChange={set("phoneNumber")}
                      placeholder="Phone number"
                      autoComplete="tel"
                      className={INPUT}
                    />
                    <input
                      value={form.organization}
                      onChange={set("organization")}
                      placeholder="Company / organisation"
                      autoComplete="organization"
                      className={INPUT}
                    />

                    {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e11d2e] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c4152a] disabled:opacity-60"
                    >
                      {status === "submitting" && (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      )}
                      {status === "submitting"
                        ? "Confirming…"
                        : "Confirm attendance"}
                    </button>
                  </form>
                </>
              )}
            </div>

            <p className="mt-8 text-center text-xs text-white/30">
              RwandAir &middot; Basketball Africa League &middot; Visit Rwanda
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
