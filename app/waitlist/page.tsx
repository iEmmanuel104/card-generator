"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const POSITION_OPTIONS = [
    "Developer",
    "Designer",
    "Founder / CEO",
    "Product Manager",
    "Content Creator",
    "Student",
    "Other",
];

function ConfettiPiece({ index }: { index: number }) {
    const colors = ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#ffffff", "#fbbf24"];
    const style = useMemo(() => ({
        "--confetti-x": `${(Math.random() - 0.5) * 300}px`,
        "--confetti-y": `${-Math.random() * 200 - 50}px`,
        "--confetti-r": `${Math.random() * 720 - 360}deg`,
    } as React.CSSProperties), []);

    return (
        <div
            className="absolute w-2 h-2 rounded-sm"
            style={{
                ...style,
                backgroundColor: colors[index % colors.length],
                left: "50%",
                top: "50%",
                animation: `confetti-burst ${0.8 + Math.random() * 0.4}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.2}s`,
            }}
        />
    );
}

export default function WaitlistPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        position: "",
        customPosition: "",
        expectation: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    position: formData.position === "Other" ? formData.customPosition : formData.position,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            setSuccess(true);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const particles = useMemo(
        () =>
            Array.from({ length: 7 }, (_, i) => ({
                id: i,
                size: Math.random() * 4 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                delay: Math.random() * 6,
                duration: 6 + Math.random() * 4,
            })),
        []
    );

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden grain-texture">
            {/* Floating particles */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full bg-[#dc2626]/30 pointer-events-none"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        top: p.top,
                        animation: `particle-float ${p.duration}s ease-in-out infinite`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl md:text-7xl font-dakdo font-bold text-white mb-2 tracking-tight">
                        BLK<span className="text-[#dc2626]">@</span>T
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-xl md:text-2xl font-playfair italic text-gray-300 mb-3 text-center"
                >
                    Join the waitlist
                </motion.p>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-sm md:text-base font-inter text-gray-500 mb-10 text-center max-w-md"
                >
                    Be among the first to know when the blkat platform launches.
                    Sign up and we&apos;ll notify you on launch day.
                </motion.p>

                {/* Form / Success */}
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                            className="relative bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 md:p-10 shadow-xl w-full max-w-lg text-center"
                        >
                            {/* Confetti */}
                            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <ConfettiPiece key={i} index={i} />
                                ))}
                            </div>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                                className="w-16 h-16 bg-[#dc2626] rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <Check className="w-8 h-8 text-white" strokeWidth={3} />
                            </motion.div>

                            <h2 className="text-3xl font-dakdo font-bold text-white mb-3">
                                You&apos;re on the list!
                            </h2>
                            <p className="font-inter text-gray-400">
                                We&apos;ll notify you when we launch.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            onSubmit={handleSubmit}
                            className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 md:p-10 shadow-xl w-full max-w-lg space-y-5"
                        >
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 font-inter"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Name */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 font-inter">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    placeholder="Your full name"
                                    className="input-red-accent w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-3 text-sm font-inter placeholder-gray-600 transition-all focus:outline-none"
                                />
                            </motion.div>

                            {/* Email */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 font-inter">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    placeholder="you@example.com"
                                    className="input-red-accent w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-3 text-sm font-inter placeholder-gray-600 transition-all focus:outline-none"
                                />
                            </motion.div>

                            {/* Position */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.9 }}
                            >
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 font-inter">
                                    Position / Status
                                </label>
                                <select
                                    required
                                    value={formData.position}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            position: e.target.value,
                                            customPosition: e.target.value !== "Other" ? "" : prev.customPosition,
                                        }))
                                    }
                                    className="input-red-accent w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-3 text-sm font-inter transition-all focus:outline-none appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "right 12px center",
                                    }}
                                >
                                    <option value="" disabled className="bg-[#111] text-gray-600">
                                        Select your position
                                    </option>
                                    {POSITION_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt} className="bg-[#111] text-white">
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                {formData.position === "Other" && (
                                    <input
                                        type="text"
                                        required
                                        value={formData.customPosition}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, customPosition: e.target.value }))
                                        }
                                        placeholder="Enter your position"
                                        className="input-red-accent w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-3 text-sm font-inter placeholder-gray-600 transition-all focus:outline-none mt-2"
                                    />
                                )}
                            </motion.div>

                            {/* Expectation */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.0 }}
                            >
                                <label className="block text-sm font-medium text-gray-400 mb-1.5 font-inter">
                                    What do you hope to get from blkat?
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.expectation}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            expectation: e.target.value,
                                        }))
                                    }
                                    placeholder="Tell us about your expectations..."
                                    className="input-red-accent w-full bg-[#111] border border-[#333] text-white rounded-lg px-4 py-3 text-sm font-inter placeholder-gray-600 transition-all focus:outline-none resize-none"
                                />
                            </motion.div>

                            {/* Submit */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.1 }}
                            >
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-streak w-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-poppins font-semibold rounded-lg px-6 py-3.5 text-sm transition-all duration-300"
                                    style={{
                                        animation: !submitting
                                            ? "glow-pulse 2s ease-in-out infinite"
                                            : "none",
                                    }}
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Joining...
                                        </span>
                                    ) : (
                                        "Join the Waitlist"
                                    )}
                                </button>
                            </motion.div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="mt-8 text-xs font-inter text-gray-600"
                >
                    You&apos;ll be the first to know
                </motion.p>
            </div>
        </div>
    );
}
