"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock, MapPin, Camera, ChevronDown, Sun, Moon } from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { SuccessModal } from "@/components/SuccessModal";
import { BrandPartners } from "@/components/events/BrandPartners";
import { getEventConfig } from "@/lib/events";
import type { RegistrationRole, SpeakerFormData } from "@/lib/types";

const eventConfig = getEventConfig("through-her-lens");

// Floating particle positions
const particles = [
    { left: "15%", top: "20%", size: 4, delay: 0 },
    { left: "85%", top: "35%", size: 3, delay: 1.5 },
    { left: "70%", top: "15%", size: 5, delay: 3 },
    { left: "25%", top: "65%", size: 3, delay: 4.5 },
];

// ─── Card Drawing Helpers ───

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = words[0] || '';
    for (let i = 1; i < words.length; i++) {
        const test = current + ' ' + words[i];
        if (ctx.measureText(test).width > maxWidth) {
            lines.push(current);
            current = words[i];
        } else {
            current = test;
        }
    }
    lines.push(current);
    if (lines.length > 2) {
        lines[1] = lines[1].slice(0, -3) + '...';
        lines.length = 2;
    }
    return lines;
}

function drawPSDBackground(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0e0e0e');
    grad.addColorStop(0.5, '#0a0a0a');
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
}

function drawWavePattern(
    ctx: CanvasRenderingContext2D,
    W: number,
    patternImg: HTMLImageElement,
) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    const drawW = W * 2.83;
    const drawH = patternImg.height * (drawW / patternImg.width);
    const drawX = (W - drawW) / 2;
    const drawY = 380 - drawH / 2;
    ctx.drawImage(patternImg, drawX, drawY, drawW, drawH);
    ctx.restore();
}

function drawPSDPhoto(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    userImg: HTMLImageElement | null,
    waveImg: HTMLImageElement,
    radius: number,
    photoCenterY: number,
    arcCenterY: number,
) {
    const photoCX = W / 2;
    const arcCX = 540;
    const PI = Math.PI;

    // Helper to draw both arc paths
    const drawArcPaths = (offCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
        // Outer thick arc — gap at upper-left (~10:30 to 12:30 clock)
        offCtx.beginPath();
        offCtx.arc(arcCX, arcCenterY, radius + 66, PI * 1.583, PI * 1.25, false);
        offCtx.lineWidth = 27;
        offCtx.lineCap = 'round';
        offCtx.stroke();
        // Inner thinner arc — gap at lower-right (~4:30 to 6:30 clock)
        offCtx.beginPath();
        offCtx.arc(arcCX, arcCenterY, radius + 16, PI * 0.583, PI * 0.25, false);
        offCtx.lineWidth = 15;
        offCtx.lineCap = 'round';
        offCtx.stroke();
    };

    // Draw base red arcs (slightly darker base for wave texture contrast)
    ctx.save();
    ctx.strokeStyle = '#991b1b';
    drawArcPaths(ctx);
    ctx.restore();

    // Wave texture on rings: compose on offscreen canvas
    try {
        const offscreen = new OffscreenCanvas(W, H);
        const offCtx = offscreen.getContext('2d');
        if (offCtx) {
            // Draw arc shapes in white on offscreen
            offCtx.strokeStyle = 'white';
            offCtx.lineCap = 'round';
            drawArcPaths(offCtx);

            // Intersect with wave pattern using source-in
            offCtx.globalCompositeOperation = 'source-in';
            const drawW = W * 2.83;
            const drawH = waveImg.height * (drawW / waveImg.width);
            const drawX = (W - drawW) / 2;
            const drawY = 380 - drawH / 2;
            offCtx.drawImage(waveImg, drawX, drawY, drawW, drawH);

            // Tint the wave texture red: multiply with red
            offCtx.globalCompositeOperation = 'source-in';
            offCtx.fillStyle = '#dc2626';
            offCtx.fillRect(0, 0, W, H);

            // Draw textured rings onto main canvas (brighter red wave lines on top of darker base)
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(offscreen, 0, 0);
            ctx.restore();
        }
    } catch {
        // Fallback: draw solid arcs if OffscreenCanvas not available
        ctx.save();
        ctx.strokeStyle = '#dc2626';
        drawArcPaths(ctx);
        ctx.restore();
    }

    // Thin dark border ring around photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(photoCX, photoCenterY, radius + 3, 0, PI * 2);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Clip and draw B&W photo
    if (userImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoCX, photoCenterY, radius, 0, PI * 2);
        ctx.clip();
        ctx.filter = 'grayscale(100%)';

        const photoSize = radius * 2;
        const imgAspect = userImg.width / userImg.height;
        let drawW: number, drawH: number;
        if (imgAspect > 1) {
            drawH = photoSize;
            drawW = photoSize * imgAspect;
        } else {
            drawW = photoSize;
            drawH = photoSize / imgAspect;
        }
        ctx.drawImage(userImg, photoCX - drawW / 2, photoCenterY - drawH / 2, drawW, drawH);
        ctx.restore();
    }
}

function drawBottomGradient(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const gradStart = H * 0.78;
    const grad = ctx.createLinearGradient(0, gradStart, 0, H);
    grad.addColorStop(0, 'rgba(5,5,5,0)');
    grad.addColorStop(0.15, 'rgba(5,5,5,0.45)');
    grad.addColorStop(0.35, 'rgba(5,5,5,0.8)');
    grad.addColorStop(0.6, 'rgba(5,5,5,0.95)');
    grad.addColorStop(1, 'rgba(5,5,5,0.99)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, gradStart, W, H - gradStart);
}

function drawLogoBlock(ctx: CanvasRenderingContext2D, logoImg: HTMLImageElement) {
    const targetW = 268;
    const targetH = logoImg.height * (targetW / logoImg.width);
    ctx.drawImage(logoImg, 76, 72, targetW, targetH);
}

function drawDateVenue(ctx: CanvasRenderingContext2D, W: number) {
    ctx.save();
    ctx.textAlign = 'right';
    const rightEdge = W - 66;

    ctx.fillStyle = '#dc2626';
    ctx.font = '700 78px "Playfair Display"';
    ctx.fillText('March 30', rightEdge, 192);

    ctx.fillStyle = '#888888';
    ctx.font = 'italic 700 37px "Playfair Display"';
    ctx.fillText('Alliance Francaise de Lagos.', rightEdge, 242);

    ctx.restore();
}

function drawNameAndRole(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    name: string,
    roleText: string,
) {
    ctx.textAlign = 'center';

    const displayName = name.toUpperCase();
    let fontSize = 80;
    do {
        ctx.font = `700 ${fontSize}px "Poppins"`;
        fontSize--;
    } while (ctx.measureText(displayName).width > W * 0.82 && fontSize > 24);

    ctx.letterSpacing = '0.08em';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(displayName, W / 2, 1230);
    ctx.letterSpacing = '0px';

    if (roleText) {
        ctx.font = 'italic 700 37px "Playfair Display"';
        ctx.fillStyle = '#999999';
        const roleLines = wrapText(ctx, roleText, W * 0.75);
        let roleY = 1300;
        for (const line of roleLines) {
            ctx.fillText(line, W / 2, roleY);
            roleY += 46;
        }
    }
}

interface ThroughHerLensRegistrationProps {
    role: RegistrationRole;
}

export default function ThroughHerLensRegistration({ role }: ThroughHerLensRegistrationProps) {
    const [formData, setFormData] = useState<SpeakerFormData>({
        name: "",
        email: "",
        phoneNumber: "",
        photo: "",
        organization: "",
        talkTitle: "",
        bio: "",
    });
    const [pageTheme, setPageTheme] = useState<'dark' | 'light'>('dark');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [socialCardUrl, setSocialCardUrl] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [existingCard, setExistingCard] = useState<{ socialCard: string; name: string } | null>(null);

    const isDark = pageTheme === 'dark';

    // Profile photos — 500x500 face-crop is correct
    const { uploadFile: uploadProfilePhoto } = useCloudinaryUpload({ width: 500, height: 500 });

    // Social cards — preserve full 1080x1485 resolution
    const { uploadFile: uploadSocialCard } = useCloudinaryUpload({
        width: 1080, height: 1485, crop: 'limit', gravity: 'center', quality: 100,
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = useCallback(() => {
        setFormData({
            name: "",
            email: "",
            phoneNumber: "",
            photo: "",
            organization: "",
            talkTitle: "",
            bio: "",
        });
        setSocialCardUrl("");
        setEmailSent(false);
        setIsLoading(false);
        setIsUploadLoading(false);
        setExistingCard(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleModalClose = useCallback(() => {
        setShowSuccessModal(false);
        resetForm();
    }, [resetForm]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setIsUploadLoading(true);
            const uploadedUrl = await uploadProfilePhoto(file);
            setFormData((prev) => ({ ...prev, photo: uploadedUrl }));
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload photo. Please try again.");
        } finally {
            setIsUploadLoading(false);
        }
    };

    const checkExistingRegistration = async (email: string) => {
        if (!email.trim()) return;
        try {
            const res = await fetch(`/api/register?email=${encodeURIComponent(email)}&event=through-her-lens`);
            const data = await res.json();
            if (data.registered) {
                setExistingCard({ socialCard: data.socialCard, name: data.name });
            } else {
                setExistingCard(null);
            }
        } catch {
            // Silently fail — not critical
        }
    };

    const handleDownloadExisting = async () => {
        if (!existingCard) return;
        const response = await fetch(existingCard.socialCard);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "thl-social-card.png";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const generateCard = useCallback(async (): Promise<string> => {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas not found");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        const W = 1080;
        const H = 1485;
        canvas.width = W;
        canvas.height = H;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        await document.fonts.ready;

        // Load all assets in parallel
        const [userImg, wavePatternImg, logoImg] = await Promise.all([
            formData.photo ? loadImage(formData.photo) : Promise.resolve(null),
            loadImage('/images/thl-wave-pattern.png'),
            loadImage('/images/thl-logo.png'),
        ]);

        const photoRadius = 290;
        const photoCenterY = 658;
        const arcCenterY = 694;

        // 1. Dark background
        drawPSDBackground(ctx, W, H);

        // 2. Wave pattern behind photo
        drawWavePattern(ctx, W, wavePatternImg);

        // 3. B&W photo with wave-textured red arc rings
        drawPSDPhoto(ctx, W, H, userImg, wavePatternImg, photoRadius, photoCenterY, arcCenterY);

        // 4. Bottom gradient fade
        drawBottomGradient(ctx, W, H);

        // 5. Logo block (top-left)
        drawLogoBlock(ctx, logoImg);

        // 6. Date + venue (top-right)
        drawDateVenue(ctx, W);

        // 7. Name + role (bottom)
        const roleText = role === 'speaker'
            ? (formData.talkTitle || formData.organization || '')
            : (formData.organization || 'Registered Attendee');
        drawNameAndRole(ctx, W, H, formData.name, roleText);

        return canvas.toDataURL("image/png");
    }, [formData.photo, formData.name, formData.talkTitle, formData.organization, role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const cardDataUrl = await generateCard();
            const response = await fetch(cardDataUrl);
            const blob = await response.blob();
            const file = new File([blob], "thl-social-card.png", { type: "image/png" });
            const cardUrl = await uploadSocialCard(file);

            const registrationData = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber || undefined,
                profilePhoto: formData.photo,
                socialCard: cardUrl,
                event: "through-her-lens",
                role,
                organization: formData.organization || undefined,
                ...(role === "speaker" ? { talkTitle: formData.talkTitle, bio: formData.bio } : {}),
            };

            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registrationData),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            setSocialCardUrl(cardUrl);
            setEmailSent(result.emailSent || false);
            setShowSuccessModal(true);
            toast.success("Registration completed successfully!");
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to complete registration.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = (field: keyof SpeakerFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#faf7f2]'} overflow-x-hidden transition-colors duration-300`}>
            {/* Floating theme toggle */}
            <button
                onClick={() => setPageTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className={`fixed top-4 right-4 z-50 p-2.5 rounded-full backdrop-blur-sm border transition-all ${
                    isDark
                        ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                        : 'border-black/10 bg-black/5 text-gray-700 hover:bg-black/10'
                }`}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24 grain-texture overflow-hidden">
                {/* Layered background gradients */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at center top, rgba(220,38,38,${isDark ? '0.15' : '0.08'}) 0%, transparent 55%)`,
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at bottom left, rgba(220,38,38,${isDark ? '0.06' : '0.03'}) 0%, transparent 50%)`,
                    }}
                />

                {/* Animated diagonal red line */}
                <div
                    className="absolute top-[20%] left-0 w-full h-[2px] pointer-events-none animate-diagonal-slide"
                    style={{
                        background: "linear-gradient(90deg, transparent, #dc2626, transparent)",
                        transform: "rotate(-3deg)",
                        transformOrigin: "left center",
                    }}
                />

                {/* Floating red particles */}
                {particles.map((p, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-[#dc2626] pointer-events-none animate-particle-float"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${5 + i}s`,
                        }}
                    />
                ))}

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center mb-6"
                    >
                        <Image
                            src="/images/logo.png"
                            alt="BLK@ Logo"
                            width={120}
                            height={60}
                            className="h-auto"
                            priority
                        />
                    </motion.div>

                    {/* "Presents" */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-xs md:text-sm tracking-[0.3em] text-gray-500 font-poppins font-light uppercase mb-6"
                    >
                        Presents
                    </motion.p>

                    {/* Title — each word animated independently */}
                    <div className="space-y-1 mb-8">
                        <motion.p
                            initial={{ opacity: 0, x: -30, letterSpacing: "0.6em" }}
                            animate={{ opacity: 1, x: 0, letterSpacing: "0.3em" }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                            className={`text-2xl md:text-4xl ${isDark ? 'text-white' : 'text-gray-800'} font-poppins font-light uppercase`}
                        >
                            THROUGH
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 200 }}
                            className="text-7xl md:text-9xl font-playfair font-bold text-[#dc2626] leading-none"
                            style={{ textShadow: "0 0 60px rgba(220,38,38,0.3)" }}
                        >
                            HER
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, skewX: -5 }}
                            animate={{ opacity: 1, skewX: 0 }}
                            transition={{ delay: 1.1, duration: 0.6 }}
                            className={`text-5xl md:text-7xl font-playfair italic ${isDark ? 'text-white' : 'text-gray-700'} leading-tight`}
                        >
                            Lens
                        </motion.p>
                    </div>

                    {/* Tagline */}
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.5 }}
                        className={`text-sm md:text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'} font-inter max-w-xl mx-auto mb-10 leading-relaxed`}
                    >
                        {eventConfig.tagline}
                    </motion.p>

                    {/* Event details — frosted glass bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className={`inline-flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base font-inter backdrop-blur-sm rounded-full px-6 md:px-8 py-3 ${
                            isDark
                                ? 'text-gray-300 bg-white/5 border border-white/10'
                                : 'text-gray-600 bg-black/5 border border-black/10'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#dc2626]" />
                            {eventConfig.date}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#dc2626]" />
                            {eventConfig.time}
                        </span>
                        <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#dc2626]" />
                            {eventConfig.venue}
                        </span>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2, duration: 0.5 }}
                        className="mt-12 flex justify-center"
                    >
                        <ChevronDown className="w-6 h-6 text-gray-500 animate-bounce-subtle" />
                    </motion.div>
                </div>
            </section>

            {/* Brand Partners Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="max-w-3xl mx-auto">
                    <BrandPartners
                        partners={eventConfig.partners}
                        mediaPartners={eventConfig.mediaPartners}
                        theme={pageTheme}
                    />
                </div>
            </section>

            {/* Registration Form Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Section header with diamond rule */}
                        <div className="text-center mb-8">
                            <h2 className={`text-3xl md:text-4xl font-poppins font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                                Register Now
                            </h2>
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#dc2626]" />
                                <span className="text-[#dc2626] text-xs">&#9670;</span>
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#dc2626]" />
                            </div>
                            <p className="text-gray-500 font-inter text-sm">
                                Join us on March 30th
                            </p>
                        </div>

                        {/* Form Card with top border gradient */}
                        <Card
                            className={`shadow-2xl ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'}`}
                            style={{
                                borderTopWidth: 2,
                                borderImage: "linear-gradient(to right, transparent, #dc2626, transparent) 1",
                                boxShadow: "inset 0 1px 0 0 rgba(220,38,38,0.1)",
                            }}
                        >
                            <CardContent className="p-6 md:p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className={`text-sm font-poppins font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <span className="text-[#dc2626] mr-1">&#8226;</span>
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                            required
                                            className={`h-12 font-inter input-red-accent transition-all duration-200 ${
                                                isDark
                                                    ? 'bg-[#111] border-[#333] text-white placeholder-gray-500'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                            }`}
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className={`text-sm font-poppins font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <span className="text-[#dc2626] mr-1">&#8226;</span>
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateField("email", e.target.value)}
                                            onBlur={() => checkExistingRegistration(formData.email)}
                                            required
                                            className={`h-12 font-inter input-red-accent transition-all duration-200 ${
                                                isDark
                                                    ? 'bg-[#111] border-[#333] text-white placeholder-gray-500'
                                                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                            }`}
                                            placeholder="Enter your email address"
                                        />
                                    </div>

                                    {/* Existing card display OR rest of form */}
                                    {existingCard ? (
                                        <div className="space-y-4 text-center py-6">
                                            <p className={`text-sm font-inter ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                You&apos;re already registered! Here&apos;s your social card:
                                            </p>
                                            <div className={`rounded-lg overflow-hidden border mx-auto max-w-sm ${isDark ? 'border-[#333]' : 'border-gray-200'}`}>
                                                <img src={existingCard.socialCard} alt="Your Social Card" className="w-full" />
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleDownloadExisting}
                                                variant="secondary"
                                                className={`${
                                                    isDark
                                                        ? 'bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white'
                                                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                                                }`}
                                            >
                                                Download Card
                                            </Button>
                                            <button
                                                type="button"
                                                onClick={() => setExistingCard(null)}
                                                className="block mx-auto text-xs text-gray-500 underline"
                                            >
                                                Register with a different email
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Phone */}
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className={`text-sm font-poppins font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                                                    className={`h-12 font-inter input-red-accent transition-all duration-200 ${
                                                        isDark
                                                            ? 'bg-[#111] border-[#333] text-white placeholder-gray-500'
                                                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                                    }`}
                                                    placeholder="Enter your phone number"
                                                />
                                            </div>

                                            {/* Organization/Brand Affiliation */}
                                            <div className="space-y-2">
                                                <Label htmlFor="org" className={`text-sm font-poppins font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    <span className="text-[#dc2626] mr-1">&#8226;</span>
                                                    Organization/Brand Affiliation
                                                </Label>
                                                <Input
                                                    id="org"
                                                    value={formData.organization}
                                                    onChange={(e) => updateField("organization", e.target.value)}
                                                    required
                                                    className={`h-12 font-inter input-red-accent transition-all duration-200 ${
                                                        isDark
                                                            ? 'bg-[#111] border-[#333] text-white placeholder-gray-500'
                                                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                                    }`}
                                                    placeholder="Your company/brand affiliation"
                                                />
                                            </div>

                                            {/* Speaker-only fields */}
                                            {role === "speaker" && (
                                                <div className="space-y-6 pt-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="talk" className={`text-sm font-poppins font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            <span className="text-[#dc2626] mr-1">&#8226;</span>
                                                            Panel Topic
                                                        </Label>
                                                        <Input
                                                            id="talk"
                                                            value={formData.talkTitle}
                                                            onChange={(e) => updateField("talkTitle", e.target.value)}
                                                            required
                                                            className={`h-12 font-inter input-red-accent transition-all duration-200 ${
                                                                isDark
                                                                    ? 'bg-[#111] border-[#333] text-white placeholder-gray-500'
                                                                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                                            }`}
                                                            placeholder="Topic of your panel discussion"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="bio" className={`text-sm font-poppins font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            <span className="text-[#dc2626] mr-1">&#8226;</span>
                                                            Bio
                                                        </Label>
                                                        <Textarea
                                                            id="bio"
                                                            value={formData.bio}
                                                            onChange={(e) => updateField("bio", e.target.value)}
                                                            required
                                                            className={`min-h-[100px] font-inter input-red-accent transition-all duration-200 resize-none ${
                                                                isDark
                                                                    ? 'bg-[#111] border-[#333] text-white placeholder-gray-500'
                                                                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                                                            }`}
                                                            placeholder="Tell us about yourself..."
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Photo Upload */}
                                            <div className="space-y-2">
                                                <Label className={`text-sm font-poppins font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    <span className="text-[#dc2626] mr-1">&#8226;</span>
                                                    Profile Photo
                                                </Label>
                                                <Input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                                {!formData.photo ? (
                                                    <div
                                                        className={`group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[#dc2626] transition-all duration-300 relative ${
                                                            isDark ? 'border-[#444]' : 'border-gray-300'
                                                        } ${isUploadLoading ? (isDark ? 'bg-[#111]' : 'bg-gray-50') : ''}`}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        style={{
                                                            boxShadow: "inset 0 0 0 0 rgba(220,38,38,0)",
                                                            transition: "box-shadow 0.3s ease",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(220,38,38,0.05)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.boxShadow = "inset 0 0 0 0 rgba(220,38,38,0)";
                                                        }}
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="mx-auto h-12 w-12 text-gray-500 group-hover:text-[#dc2626] transition-colors">
                                                                <Camera className="w-12 h-12" strokeWidth={1.5} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Upload your photo</p>
                                                                <p className="text-xs text-gray-600">Click to browse</p>
                                                            </div>
                                                        </div>
                                                        {isUploadLoading && (
                                                            <div className={`absolute inset-0 flex items-center justify-center rounded-xl ${isDark ? 'bg-[#0a0a0a]/60' : 'bg-white/60'}`}>
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <motion.div
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                        className="space-y-3"
                                                    >
                                                        <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-[#dc2626] shadow-lg shadow-red-900/20 animate-ring-pulse">
                                                            <img
                                                                src={formData.photo}
                                                                alt="Preview"
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, photo: "" }));
                                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                                            }}
                                                            variant="secondary"
                                                            className={`w-full ${
                                                                isDark
                                                                    ? 'bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white'
                                                                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                                                            }`}
                                                        >
                                                            Change Photo
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Submit */}
                                            <Button
                                                type="submit"
                                                className="w-full h-14 text-lg font-poppins font-semibold text-white bg-gradient-to-r from-[#dc2626] to-[#991b1b] hover:from-[#ef4444] hover:to-[#b91c1c] shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:scale-[1.02] transition-all duration-300 btn-streak"
                                                disabled={isLoading || !formData.photo}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    "Complete Registration"
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Hidden canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleModalClose}
                socialCardUrl={socialCardUrl}
                theme={pageTheme}
                eventName="through-her-lens"
                emailSent={emailSent}
            />
        </div>
    );
}
