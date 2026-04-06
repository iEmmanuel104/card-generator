"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { ScoreValue, RespondentType } from '@/lib/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type ScoreState = ScoreValue | undefined; // undefined = not yet answered

interface FormState {
    respondentType: RespondentType | null;
    isAnonymous: boolean | null;
    name: string;
    email: string;
    organization: string;
    belongingScore: ScoreState;
    fairTreatmentScore: ScoreState;
    supportScore: ScoreState;
    openFeedback: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCALE_OPTIONS = [
    { value: 1 as ScoreValue, label: 'Never' },
    { value: 2 as ScoreValue, label: 'Rarely' },
    { value: 3 as ScoreValue, label: 'Sometimes' },
    { value: 4 as ScoreValue, label: 'Often' },
    { value: 5 as ScoreValue, label: 'Always' },
] as const;

const confettiPieces = [
    { x: '-80px', y: '-120px', r: '180deg', size: 8, round: false, color: '#be185d' },
    { x: '120px', y: '-180px', r: '-270deg', size: 6, round: true, color: '#f9a8d4' },
    { x: '-50px', y: '-100px', r: '360deg', size: 10, round: false, color: '#fbcfe8' },
    { x: '90px', y: '-150px', r: '-180deg', size: 7, round: true, color: '#be185d' },
    { x: '-110px', y: '-140px', r: '270deg', size: 6, round: false, color: '#f9a8d4' },
    { x: '70px', y: '-170px', r: '-360deg', size: 8, round: true, color: '#be185d' },
    { x: '-30px', y: '-190px', r: '180deg', size: 9, round: false, color: '#fbcfe8' },
    { x: '140px', y: '-110px', r: '-270deg', size: 6, round: true, color: '#be185d' },
    { x: '-100px', y: '-160px', r: '360deg', size: 7, round: false, color: '#f9a8d4' },
    { x: '50px', y: '-130px', r: '-180deg', size: 10, round: true, color: '#be185d' },
    { x: '-60px', y: '-185px', r: '270deg', size: 8, round: false, color: '#fbcfe8' },
    { x: '100px', y: '-145px', r: '-360deg', size: 6, round: true, color: '#f9a8d4' },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const stepVariants = {
    enter: (dir: 'forward' | 'back') => ({
        x: dir === 'forward' ? 60 : -60,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'forward' | 'back') => ({
        x: dir === 'forward' ? -60 : 60,
        opacity: 0,
    }),
};

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Rating Card Group ────────────────────────────────────────────────────────

function RatingCardGroup({
    question,
    instruction,
    value,
    onChange,
}: {
    question: string;
    instruction?: string;
    value: ScoreState;
    onChange: (v: ScoreValue) => void;
}) {
    return (
        <motion.div variants={itemVariants} className="space-y-4">
            <div>
                <h3 className="font-playfair text-lg text-white leading-snug">{question}</h3>
                {instruction && (
                    <p className="text-sm text-gray-500 mt-1.5 italic font-poppins">{instruction}</p>
                )}
            </div>
            <div className="grid grid-cols-5 gap-2">
                {SCALE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`rounded-xl py-3 px-1 flex flex-col items-center gap-1.5 border transition-all duration-200 ${
                            value === opt.value
                                ? 'border-[#be185d] ring-2 ring-[#be185d]/40 bg-[#be185d]/10'
                                : 'border-[#333] bg-[#111] hover:border-[#be185d]/50 hover:bg-[#1f0a12]'
                        }`}
                    >
                        <span className={`text-xl font-bold font-inter ${value === opt.value ? 'text-[#be185d]' : 'text-white'}`}>
                            {opt.value}
                        </span>
                        <span className={`text-[10px] font-poppins leading-tight text-center ${value === opt.value ? 'text-[#be185d]' : 'text-gray-500'}`}>
                            {opt.label}
                        </span>
                    </button>
                ))}
            </div>
            <button
                type="button"
                onClick={() => onChange(null)}
                className={`w-full py-2.5 rounded-xl border text-sm font-poppins transition-all duration-200 ${
                    value === null
                        ? 'border-[#be185d]/60 bg-[#be185d]/10 text-[#be185d]'
                        : 'border-[#2a2a2a] text-gray-600 hover:border-[#be185d]/30 hover:text-gray-400'
                }`}
            >
                Prefer not to share
            </button>
        </motion.div>
    );
}

// ─── Selection Card ───────────────────────────────────────────────────────────

function SelectCard({
    selected,
    onClick,
    label,
    sublabel,
    icon,
}: {
    selected: boolean;
    onClick: () => void;
    label: string;
    sublabel?: string;
    icon?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                selected
                    ? 'border-[#be185d] ring-2 ring-[#be185d]/30 bg-[#be185d]/10'
                    : 'border-[#2a2a2a] bg-[#111] hover:border-[#be185d]/40 hover:bg-[#1a0a10]'
            }`}
        >
            <div className="flex items-start gap-3">
                {icon && <span className="text-xl">{icon}</span>}
                <div>
                    <p className={`font-medium font-poppins text-sm ${selected ? 'text-white' : 'text-gray-300'}`}>
                        {label}
                    </p>
                    {sublabel && (
                        <p className="text-xs text-gray-600 mt-0.5 font-poppins">{sublabel}</p>
                    )}
                </div>
                <div className="ml-auto flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selected ? 'border-[#be185d] bg-[#be185d]' : 'border-[#444]'
                    }`}>
                        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                </div>
            </div>
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FeedbackPage() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formState, setFormState] = useState<FormState>({
        respondentType: null,
        isAnonymous: null,
        name: '',
        email: '',
        organization: '',
        belongingScore: undefined,
        fairTreatmentScore: undefined,
        supportScore: undefined,
        openFeedback: '',
    });

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setFormState((prev) => ({ ...prev, [key]: value }));

    const goNext = () => {
        setDirection('forward');
        setStep((p) => (p + 1) as typeof step);
    };

    const goBack = () => {
        setDirection('back');
        setStep((p) => (p - 1) as typeof step);
    };

    // Step 1 validation
    const step1Valid =
        formState.respondentType !== null &&
        formState.isAnonymous !== null &&
        (formState.isAnonymous === true || formState.name.trim().length > 0);

    // Step 2 validation — belongingScore must have been explicitly set (not undefined)
    const step2Valid = formState.belongingScore !== undefined;

    // Step 3 validation
    const step3Valid =
        formState.fairTreatmentScore !== undefined &&
        formState.supportScore !== undefined;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                event: 'through-her-lens-joburg',
                respondentType: formState.respondentType,
                isAnonymous: formState.isAnonymous,
                belongingScore: formState.belongingScore ?? null,
                fairTreatmentScore: formState.fairTreatmentScore ?? null,
                supportScore: formState.supportScore ?? null,
            };

            if (formState.isAnonymous === false) {
                payload.name = formState.name.trim();
                if (formState.email.trim()) payload.email = formState.email.trim();
                if (formState.organization.trim()) payload.organization = formState.organization.trim();
            }

            if (formState.openFeedback.trim()) {
                payload.openFeedback = formState.openFeedback.trim();
            }

            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Submission failed');
            setIsSubmitted(true);
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-poppins overflow-x-hidden">
            <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' } }} />

            {/* Ambient background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at top left, rgba(190,24,93,0.06) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(190,24,93,0.04) 0%, transparent 55%)',
                }}
            />

            {/* Progress bar */}
            {!isSubmitted && (
                <div className="fixed top-0 left-0 w-full h-0.5 bg-[#1a1a1a] z-50">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#be185d] to-[#e11d48]"
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 max-w-lg mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Image
                        src="/images/thl-logo.png"
                        width={110}
                        height={55}
                        alt="Through Her Lens"
                        className="h-auto opacity-90"
                        onError={() => {}}
                    />
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full bg-[#131313] border border-[#222] rounded-2xl p-6 md:p-8 overflow-hidden"
                    style={{ boxShadow: '0 0 0 1px rgba(190,24,93,0.08), 0 24px 64px rgba(0,0,0,0.7)' }}
                >
                    {/* Step counter */}
                    {!isSubmitted && (
                        <p className="text-[11px] font-medium text-[#be185d]/60 tracking-widest uppercase mb-5 font-inter">
                            Step {step} of 4
                        </p>
                    )}

                    <AnimatePresence mode="wait" custom={direction}>
                        {isSubmitted ? (
                            /* ── Thank You Screen ── */
                            <motion.div
                                key="thankyou"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                                className="text-center py-4 relative"
                            >
                                {/* Confetti */}
                                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                                    {confettiPieces.map((piece, i) => (
                                        <div
                                            key={i}
                                            className={piece.round ? 'absolute rounded-full' : 'absolute rounded-sm'}
                                            style={{
                                                top: '30%',
                                                left: '50%',
                                                width: `${piece.size}px`,
                                                height: `${piece.size}px`,
                                                backgroundColor: piece.color,
                                                '--confetti-x': piece.x,
                                                '--confetti-y': piece.y,
                                                '--confetti-r': piece.r,
                                                animation: 'confetti-burst 1s ease-out forwards',
                                                animationDelay: `${i * 0.05}s`,
                                            } as React.CSSProperties}
                                        />
                                    ))}
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="w-16 h-16 rounded-full bg-[#be185d]/15 flex items-center justify-center">
                                            <Heart className="w-7 h-7 text-[#be185d]" fill="currentColor" />
                                        </div>
                                    </div>
                                    <h2 className="font-playfair text-3xl text-white mb-4 leading-snug">
                                        Thank you for sharing.
                                    </h2>
                                    <p className="text-gray-400 text-sm leading-relaxed font-poppins max-w-sm mx-auto mb-6">
                                        Your voice is a light. What you&apos;ve shared today contributes to a more honest, more human conversation about workplaces — and that takes courage. We see you.
                                    </p>
                                    <p className="text-[#be185d]/50 text-xs tracking-wider uppercase font-inter">
                                        Through Her Lens · Workplace Insights
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                {/* ── Step 1: Welcome + Identity ── */}
                                {step === 1 && (
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-6"
                                    >
                                        <motion.div variants={itemVariants}>
                                            <h1 className="font-playfair text-3xl italic text-white leading-tight mb-3">
                                                Your voice matters here.
                                            </h1>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                This is a safe space to share how you truly experience your workplace. Your answers are confidential and will help shape conversations that matter for women everywhere.
                                            </p>
                                        </motion.div>

                                        {/* Identity */}
                                        <motion.div variants={itemVariants} className="space-y-2">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-inter">
                                                Who are you in this conversation?
                                            </p>
                                            <SelectCard
                                                selected={formState.respondentType === 'woman'}
                                                onClick={() => update('respondentType', 'woman')}
                                                label="I identify as a woman"
                                                icon="♀"
                                            />
                                            <SelectCard
                                                selected={formState.respondentType === 'ally'}
                                                onClick={() => update('respondentType', 'ally')}
                                                label="I am an ally"
                                                sublabel="Supporting women's experiences and voices"
                                                icon="🤝"
                                            />
                                        </motion.div>

                                        {/* Privacy */}
                                        <motion.div variants={itemVariants} className="space-y-2">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-inter">
                                                How would you like to respond?
                                            </p>
                                            <SelectCard
                                                selected={formState.isAnonymous === true}
                                                onClick={() => update('isAnonymous', true)}
                                                label="I'd prefer to remain anonymous"
                                                sublabel="No identifying information will be collected."
                                                icon="🔒"
                                            />
                                            <SelectCard
                                                selected={formState.isAnonymous === false}
                                                onClick={() => update('isAnonymous', false)}
                                                label="I'd like to share my details"
                                                sublabel="Your details will only be used for reporting."
                                                icon="👤"
                                            />
                                        </motion.div>

                                        {/* Expanding details sub-form */}
                                        <AnimatePresence>
                                            {formState.isAnonymous === false && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-3 pt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Your name *"
                                                            value={formState.name}
                                                            onChange={(e) => update('name', e.target.value)}
                                                            className="w-full bg-[#0e0e0e] border border-[#2a2a2a] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm font-poppins focus:outline-none focus:border-[#be185d]/60 focus:ring-1 focus:ring-[#be185d]/30 transition-colors"
                                                        />
                                                        <input
                                                            type="email"
                                                            placeholder="Email address (optional)"
                                                            value={formState.email}
                                                            onChange={(e) => update('email', e.target.value)}
                                                            className="w-full bg-[#0e0e0e] border border-[#2a2a2a] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm font-poppins focus:outline-none focus:border-[#be185d]/60 focus:ring-1 focus:ring-[#be185d]/30 transition-colors"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Organization (optional)"
                                                            value={formState.organization}
                                                            onChange={(e) => update('organization', e.target.value)}
                                                            className="w-full bg-[#0e0e0e] border border-[#2a2a2a] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm font-poppins focus:outline-none focus:border-[#be185d]/60 focus:ring-1 focus:ring-[#be185d]/30 transition-colors"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button
                                            type="button"
                                            onClick={goNext}
                                            disabled={!step1Valid}
                                            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#be185d] to-[#e11d48] text-white font-semibold text-sm font-poppins transition-all duration-200 hover:from-[#9d174d] hover:to-[#be123c] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#be185d]/15"
                                        >
                                            Begin
                                        </button>
                                    </motion.div>
                                )}

                                {/* ── Step 2: Belonging ── */}
                                {step === 2 && (
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-6"
                                    >
                                        <motion.div variants={itemVariants}>
                                            <p className="text-xs text-[#be185d]/60 uppercase tracking-wider font-inter mb-1">
                                                Belonging & Inclusion
                                            </p>
                                            <p className="text-gray-500 text-xs italic font-poppins">
                                                There are no right or wrong answers — this is your safe space.
                                            </p>
                                        </motion.div>

                                        <RatingCardGroup
                                            question="I feel like I belong and am valued in my workplace."
                                            value={formState.belongingScore}
                                            onChange={(v) => update('belongingScore', v)}
                                        />

                                        <motion.div variants={itemVariants} className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={goBack}
                                                className="h-12 px-4 rounded-xl border border-[#2a2a2a] text-gray-500 hover:text-white hover:border-[#444] transition-colors flex items-center gap-1.5 text-sm font-poppins"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={goNext}
                                                disabled={!step2Valid}
                                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#be185d] to-[#e11d48] text-white font-semibold text-sm font-poppins transition-all duration-200 hover:from-[#9d174d] hover:to-[#be123c] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#be185d]/15"
                                            >
                                                Continue
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* ── Step 3: Experiences ── */}
                                {step === 3 && (
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-6"
                                    >
                                        <motion.div variants={itemVariants}>
                                            <p className="text-xs text-[#be185d]/60 uppercase tracking-wider font-inter mb-1">
                                                Fairness & Support
                                            </p>
                                            <p className="text-gray-500 text-xs italic font-poppins">
                                                Select the option that best reflects your honest experience.
                                            </p>
                                        </motion.div>

                                        <RatingCardGroup
                                            question="I experience fair treatment and equal opportunities regardless of my gender or background."
                                            value={formState.fairTreatmentScore}
                                            onChange={(v) => update('fairTreatmentScore', v)}
                                        />

                                        <motion.div variants={itemVariants}>
                                            <div className="h-px bg-gradient-to-r from-transparent via-[#be185d]/20 to-transparent" />
                                        </motion.div>

                                        <RatingCardGroup
                                            question="I have the support and resources I need to thrive at my workplace."
                                            value={formState.supportScore}
                                            onChange={(v) => update('supportScore', v)}
                                        />

                                        <motion.div variants={itemVariants} className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={goBack}
                                                className="h-12 px-4 rounded-xl border border-[#2a2a2a] text-gray-500 hover:text-white hover:border-[#444] transition-colors flex items-center gap-1.5 text-sm font-poppins"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={goNext}
                                                disabled={!step3Valid}
                                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#be185d] to-[#e11d48] text-white font-semibold text-sm font-poppins transition-all duration-200 hover:from-[#9d174d] hover:to-[#be123c] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#be185d]/15"
                                            >
                                                Continue
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* ── Step 4: Story + Submit ── */}
                                {step === 4 && (
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-6"
                                    >
                                        <motion.div variants={itemVariants}>
                                            <p className="text-xs text-[#be185d]/60 uppercase tracking-wider font-inter mb-2">
                                                Your Story
                                            </p>
                                            <h3 className="font-playfair text-xl text-white leading-snug mb-1.5">
                                                Would you like to share more?
                                            </h3>
                                            <p className="text-gray-500 text-sm leading-relaxed font-poppins">
                                                Is there a specific moment, pattern, or change that has shaped your workplace experience? What one thing would make the biggest difference for you?
                                            </p>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="space-y-1.5">
                                            <textarea
                                                rows={5}
                                                maxLength={300}
                                                placeholder="This is entirely optional — share only what feels right."
                                                value={formState.openFeedback}
                                                onChange={(e) => update('openFeedback', e.target.value)}
                                                className="w-full bg-[#0e0e0e] border border-[#2a2a2a] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm font-poppins resize-none focus:outline-none focus:border-[#be185d]/60 focus:ring-1 focus:ring-[#be185d]/30 transition-colors"
                                            />
                                            <p className={`text-right text-xs font-inter transition-colors ${
                                                formState.openFeedback.length > 270 ? 'text-[#be185d]' : 'text-gray-600'
                                            }`}>
                                                {formState.openFeedback.length} / 300
                                            </p>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={goBack}
                                                className="h-12 px-4 rounded-xl border border-[#2a2a2a] text-gray-500 hover:text-white hover:border-[#444] transition-colors flex items-center gap-1.5 text-sm font-poppins"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#be185d] to-[#e11d48] text-white font-semibold text-sm font-poppins transition-all duration-200 hover:from-[#9d174d] hover:to-[#be123c] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#be185d]/15 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit My Response'
                                                )}
                                            </button>
                                        </motion.div>

                                        <motion.p variants={itemVariants} className="text-center text-xs text-gray-600 font-poppins">
                                            Your response is {formState.isAnonymous ? 'anonymous and ' : ''}submitted securely. Thank you for your courage.
                                        </motion.p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center text-xs text-gray-700 font-inter"
                >
                    Through Her Lens · Workplace Insights · {new Date().getFullYear()}
                </motion.p>
            </div>
        </div>
    );
}
