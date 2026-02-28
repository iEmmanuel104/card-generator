"use client";

// components/SuccessModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    socialCardUrl: string;
    theme?: 'light' | 'dark';
    eventName?: string;
    emailSent?: boolean;
}

const confettiPieces = [
    { x: '-80px', y: '-120px', r: '180deg', size: 8, round: false, red: true },
    { x: '120px', y: '-180px', r: '-270deg', size: 6, round: true, red: false },
    { x: '-50px', y: '-100px', r: '360deg', size: 10, round: false, red: true },
    { x: '90px', y: '-150px', r: '-180deg', size: 7, round: true, red: false },
    { x: '-110px', y: '-140px', r: '270deg', size: 6, round: false, red: true },
    { x: '70px', y: '-170px', r: '-360deg', size: 8, round: true, red: true },
    { x: '-30px', y: '-190px', r: '180deg', size: 9, round: false, red: false },
    { x: '140px', y: '-110px', r: '-270deg', size: 6, round: true, red: true },
    { x: '-100px', y: '-160px', r: '360deg', size: 7, round: false, red: false },
    { x: '50px', y: '-130px', r: '-180deg', size: 10, round: true, red: true },
    { x: '-60px', y: '-185px', r: '270deg', size: 8, round: false, red: false },
    { x: '100px', y: '-145px', r: '-360deg', size: 6, round: true, red: true },
];

export function SuccessModal({
    isOpen,
    onClose,
    socialCardUrl,
    theme = 'light',
    eventName = 'this-is-lagos',
    emailSent = false,
}: SuccessModalProps) {
    const isDark = theme === 'dark';

    const handleDownload = async () => {
        try {
            const response = await fetch(socialCardUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${eventName}-social-card.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="w-[90vw] max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-[#111] border-[#333] text-white"
            >
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative p-4 md:p-6 overflow-y-auto max-h-[90vh]"
                        >
                            {/* Confetti celebration effect */}
                            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                                {confettiPieces.map((piece, i) => (
                                    <div
                                        key={i}
                                        className={`absolute ${piece.red ? 'bg-[#dc2626]' : 'bg-white'} ${piece.round ? 'rounded-full' : 'rounded-sm'}`}
                                        style={{
                                            top: '40%',
                                            left: '50%',
                                            width: `${piece.size}px`,
                                            height: `${piece.size}px`,
                                            '--confetti-x': piece.x,
                                            '--confetti-y': piece.y,
                                            '--confetti-r': piece.r,
                                            animation: 'confetti-burst 1s ease-out forwards',
                                            animationDelay: `${i * 0.05}s`,
                                        } as React.CSSProperties}
                                    />
                                ))}
                            </div>

                            {/* Header */}
                            <DialogHeader className="relative z-10">
                                <DialogTitle className="font-dakdo text-3xl text-center text-white">
                                    You&apos;re in!
                                </DialogTitle>
                                <p className="text-gray-400 text-sm font-inter text-center mt-1">
                                    See you on March 30th
                                </p>
                            </DialogHeader>

                            <div className="space-y-4 md:space-y-6 mt-4 md:mt-6 relative z-10">
                                {/* Email confirmation */}
                                {emailSent && (
                                    <motion.div
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.4 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 flex-shrink-0">
                                            <svg
                                                className="w-3 h-3 text-green-400"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M2.5 6L5 8.5L9.5 3.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                        <span className="text-green-400 text-sm">
                                            Confirmation email sent to your inbox
                                        </span>
                                    </motion.div>
                                )}

                                {/* Card display with 3D perspective */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    style={{ perspective: '1000px' }}
                                >
                                    <div
                                        className="relative w-full overflow-hidden rounded-lg"
                                        style={{
                                            transform: 'rotateY(2deg)',
                                            boxShadow: '0 0 30px rgba(220,38,38,0.2)',
                                        }}
                                    >
                                        <img
                                            src={socialCardUrl}
                                            alt="Your Social Card"
                                            className="w-full h-full object-contain"
                                            loading="lazy"
                                        />
                                    </div>
                                </motion.div>

                                {/* Download button */}
                                <div className="pt-2 md:pt-4">
                                    <Button
                                        onClick={handleDownload}
                                        className="w-full h-10 md:h-12 text-base md:text-lg font-poppins font-semibold text-white bg-[#dc2626] hover:bg-[#b91c1c] btn-streak animate-glow-pulse hover:scale-[1.02] transition-transform"
                                    >
                                        Download Social Card
                                    </Button>
                                    <p className="text-gray-500 text-xs text-center mt-2">
                                        Share your card on social media
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
