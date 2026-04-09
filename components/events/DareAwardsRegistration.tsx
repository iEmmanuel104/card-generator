"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Calendar, Clock, MapPin, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEventConfig } from "@/lib/events";

const GOLD = "#d4af37";
const GOLD_LIGHT = "#e8c252";
const GOLD_DEEP = "#a8872a";

// Static decorative particles (hoisted for perf)
const PARTICLES = [
    { left: "10%", top: "20%", size: 3, delay: 0 },
    { left: "85%", top: "15%", size: 4, delay: 1.2 },
    { left: "70%", top: "80%", size: 3, delay: 2.4 },
    { left: "20%", top: "75%", size: 2, delay: 3.6 },
    { left: "50%", top: "30%", size: 2, delay: 4.8 },
    { left: "90%", top: "55%", size: 3, delay: 1.8 },
];

interface FormState {
    name: string;
    email: string;
    phoneNumber: string;
    organization: string;
}

const initialForm: FormState = {
    name: "",
    email: "",
    phoneNumber: "",
    organization: "",
};

export default function DareAwardsRegistration() {
    const event = getEventConfig("the-dare-awards");
    const [form, setForm] = useState<FormState>(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;

        if (!form.name.trim() || !form.email.trim()) {
            toast.error("Please enter your name and email");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event: "the-dare-awards",
                    role: "attendee",
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    phoneNumber: form.phoneNumber.trim() || undefined,
                    organization: form.organization.trim() || undefined,
                    profilePhoto: "",
                    socialCard: "",
                }),
            });

            const data = await res.json();

            if (res.status === 409) {
                setAlreadyRegistered(true);
                setSubmitted(true);
                toast.success("You're already on the list");
                return;
            }

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Registration failed");
            }

            setSubmitted(true);
            toast.success("RSVP confirmed — check your email");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Ambient gold particles */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
                {PARTICLES.map((p, i) => (
                    <motion.span
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            background: GOLD,
                            boxShadow: `0 0 ${p.size * 4}px ${GOLD}`,
                        }}
                        animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.5, 1] }}
                        transition={{ duration: 4, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>

            {/* Subtle radial gold glow */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                aria-hidden
                style={{
                    background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${GOLD}20 0%, transparent 60%)`,
                }}
            />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Top nav */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between mb-10 md:mb-16"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-inter text-gray-400 hover:text-[#d4af37] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to events
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-dakdo font-bold text-white tracking-wider">
                            BLK<span style={{ color: GOLD }}>@</span>
                        </span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
                    {/* Left — hero */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex flex-col"
                    >
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border w-fit mb-6"
                            style={{ borderColor: `${GOLD}40`, background: `${GOLD}10` }}
                        >
                            <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
                            <span className="text-xs font-poppins font-medium uppercase tracking-wider" style={{ color: GOLD }}>
                                An evening of excellence
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-dakdo font-bold leading-[0.9] mb-4">
                            <span className="block text-white text-3xl sm:text-4xl lg:text-5xl tracking-[0.2em] font-light mb-2">
                                THE
                            </span>
                            <span
                                className="block bg-clip-text text-transparent"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 45%, ${GOLD_DEEP} 100%)`,
                                }}
                            >
                                DARE
                            </span>
                            <span className="block text-white text-3xl sm:text-4xl lg:text-5xl tracking-[0.15em] font-light mt-2">
                                AWARDS
                            </span>
                        </h1>

                        <p className="text-base md:text-lg font-inter text-gray-400 leading-relaxed mb-8 max-w-md">
                            {event.tagline}.
                        </p>

                        {/* Poster */}
                        <div className="relative w-full aspect-[3/4] max-w-sm mb-8 rounded-xl overflow-hidden border-2 shadow-2xl" style={{ borderColor: `${GOLD}30`, boxShadow: `0 20px 60px ${GOLD}15` }}>
                            <Image
                                src="/images/dare-awards-poster.png"
                                alt="The Dare Awards"
                                fill
                                sizes="(max-width: 768px) 100vw, 400px"
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Event meta */}
                        <div className="space-y-4 text-sm font-inter">
                            <div className="flex items-start gap-3">
                                <div
                                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border"
                                    style={{ borderColor: `${GOLD}40`, background: `${GOLD}10` }}
                                >
                                    <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-poppins">Date</p>
                                    <p className="text-white font-medium">{event.date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div
                                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border"
                                    style={{ borderColor: `${GOLD}40`, background: `${GOLD}10` }}
                                >
                                    <Clock className="w-4 h-4" style={{ color: GOLD }} />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-poppins">Time</p>
                                    <p className="text-white font-medium">{event.time}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div
                                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border"
                                    style={{ borderColor: `${GOLD}40`, background: `${GOLD}10` }}
                                >
                                    <MapPin className="w-4 h-4" style={{ color: GOLD }} />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-poppins">Venue</p>
                                    <p className="text-white font-medium leading-snug">
                                        Emperors Palace Johannesburg
                                        <br />
                                        <span className="text-gray-400 text-xs">64 Jones Rd, Kempton Park, Johannesburg</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right — form or success */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="lg:sticky lg:top-8"
                    >
                        {submitted ? (
                            <SuccessState
                                name={form.name}
                                email={form.email}
                                alreadyRegistered={alreadyRegistered}
                                eventDate={event.date}
                                eventTime={event.time}
                            />
                        ) : (
                            <div
                                className="rounded-2xl border-2 p-6 md:p-8 backdrop-blur-sm"
                                style={{
                                    borderColor: `${GOLD}30`,
                                    background: "linear-gradient(180deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%)",
                                }}
                            >
                                <h2 className="text-2xl md:text-3xl font-dakdo font-bold text-white mb-2">
                                    Reserve your seat
                                </h2>
                                <p className="text-sm font-inter text-gray-400 mb-6">
                                    Fill in your details to RSVP for The Dare Awards.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-gray-300 text-xs uppercase tracking-wider font-poppins">
                                            Full Name <span style={{ color: GOLD }}>*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={form.name}
                                            onChange={handleChange("name")}
                                            placeholder="Ada Lovelace"
                                            required
                                            disabled={submitting}
                                            className="bg-black/50 border-neutral-800 text-white placeholder:text-gray-600 focus-visible:border-[#d4af37] focus-visible:ring-[#d4af37]/30 h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-300 text-xs uppercase tracking-wider font-poppins">
                                            Email <span style={{ color: GOLD }}>*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange("email")}
                                            placeholder="you@example.com"
                                            required
                                            disabled={submitting}
                                            className="bg-black/50 border-neutral-800 text-white placeholder:text-gray-600 focus-visible:border-[#d4af37] focus-visible:ring-[#d4af37]/30 h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber" className="text-gray-300 text-xs uppercase tracking-wider font-poppins">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            value={form.phoneNumber}
                                            onChange={handleChange("phoneNumber")}
                                            placeholder="+27 ..."
                                            disabled={submitting}
                                            className="bg-black/50 border-neutral-800 text-white placeholder:text-gray-600 focus-visible:border-[#d4af37] focus-visible:ring-[#d4af37]/30 h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="organization" className="text-gray-300 text-xs uppercase tracking-wider font-poppins">
                                            Organization
                                        </Label>
                                        <Input
                                            id="organization"
                                            type="text"
                                            value={form.organization}
                                            onChange={handleChange("organization")}
                                            placeholder="Company / brand"
                                            disabled={submitting}
                                            className="bg-black/50 border-neutral-800 text-white placeholder:text-gray-600 focus-visible:border-[#d4af37] focus-visible:ring-[#d4af37]/30 h-11"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 text-sm font-poppins font-semibold tracking-wider uppercase border-0 text-black hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                        style={{
                                            background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 45%, ${GOLD_DEEP} 100%)`,
                                            boxShadow: `0 10px 30px ${GOLD}40`,
                                        }}
                                    >
                                        {submitting ? "Reserving..." : "RSVP to The Dare Awards"}
                                    </Button>

                                    <p className="text-[11px] font-inter text-gray-500 text-center leading-relaxed">
                                        By registering you&apos;ll receive a confirmation email with event details. Seats are limited — please only RSVP if you intend to attend.
                                    </p>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// --- Success State ---

function SuccessState({
    name,
    email,
    alreadyRegistered,
    eventDate,
    eventTime,
}: {
    name: string;
    email: string;
    alreadyRegistered: boolean;
    eventDate: string;
    eventTime: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border-2 p-8 md:p-10 text-center"
            style={{
                borderColor: `${GOLD}40`,
                background: "linear-gradient(180deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)",
            }}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: GOLD, background: `${GOLD}15` }}
            >
                <CheckCircle2 className="w-8 h-8" style={{ color: GOLD }} />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-dakdo font-bold text-white mb-3">
                {alreadyRegistered ? "You're on the list" : "RSVP Confirmed"}
            </h2>

            <p className="text-base font-inter text-gray-300 mb-2">
                {alreadyRegistered
                    ? `${name || "Welcome back"} — you've already reserved your seat.`
                    : `Thank you${name ? `, ${name}` : ""}.`}
            </p>
            <p className="text-sm font-inter text-gray-500 mb-8">
                A confirmation has been sent to{" "}
                <span className="text-white">{email}</span>
            </p>

            <div
                className="rounded-xl border p-5 mb-6 text-left space-y-3"
                style={{ borderColor: `${GOLD}25`, background: "rgba(0,0,0,0.4)" }}
            >
                <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                    <span className="text-gray-300">
                        <span className="text-white font-medium">{eventDate}</span> · {eventTime}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                    <span className="text-gray-300">Emperors Palace, Johannesburg</span>
                </div>
            </div>

            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-poppins font-semibold transition-colors hover:brightness-125"
                style={{ color: GOLD }}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to events
            </Link>
        </motion.div>
    );
}
