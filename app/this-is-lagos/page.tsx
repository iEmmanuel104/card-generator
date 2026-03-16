"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { SuccessModal } from "@/components/SuccessModal";

interface RegistrationData {
    name: string;
    email: string;
    phoneNumber: string;
    photo: string;
}

interface ImagePosition {
    x: number;
    y: number;
    scale: number;
}

export default function ThisIsLagosRegistration() {
    const initialFormData = {
        name: "",
        email: "",
        phoneNumber: "",
        photo: "",
    };

    const initialImagePosition = {
        x: 0,
        y: 0,
        scale: 1,
    };

    const [formData, setFormData] = useState<RegistrationData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const [imagePosition] = useState<ImagePosition>(initialImagePosition);
    const { uploadFile } = useCloudinaryUpload({ width: 398, height: 488 });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [socialCardUrl, setSocialCardUrl] = useState("");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setSocialCardUrl("");
        setIsLoading(false);
        setIsUploadLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);

    const handleModalClose = useCallback(() => {
        setShowSuccessModal(false);
        resetForm();
    }, [resetForm]);

    useEffect(() => {
        return () => {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setIsUploadLoading(true);
            const uploadedUrl = await uploadFile(file);
            setFormData((prev) => ({ ...prev, photo: uploadedUrl }));
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload photo. Please try again.");
        } finally {
            setIsUploadLoading(false);
        }
    };

    const calculateDimensions = (originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number) => {
        const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
        return {
            width: originalWidth * ratio,
            height: originalHeight * ratio,
        };
    };

    const getCanvasDimensions = useCallback(() => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        return {
            width: isMobile ? 450 : 900,
            height: isMobile ? 531 : 1062,
            profileWidth: isMobile ? 199 : 398,
            profileHeight: isMobile ? 244 : 488,
            sideSpacing: isMobile ? 125.5 : 251,
        };
    }, []);

    const updateCanvas = useCallback(() => {
        if (typeof window === "undefined") return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dims = getCanvasDimensions();
        canvas.width = dims.width;
        canvas.height = dims.height;

        const templateImg = new window.Image();
        templateImg.src = "/images/template2.jpg";

        templateImg.onload = () => {
            ctx.drawImage(templateImg, 0, 0, dims.width, dims.height);

            if (formData.photo) {
                const userImg = new window.Image();
                userImg.crossOrigin = "anonymous";
                userImg.src = formData.photo;

                userImg.onload = () => {
                    const profileY = Math.round((dims.height - dims.profileHeight) / 2) + dims.height * 0.036;

                    ctx.save();
                    ctx.beginPath();
                    const radius = dims.width * 0.022;
                    ctx.roundRect(dims.sideSpacing, profileY, dims.profileWidth, dims.profileHeight, radius);
                    ctx.clip();

                    const { width: scaledWidth, height: scaledHeight } = calculateDimensions(
                        userImg.width,
                        userImg.height,
                        dims.profileWidth,
                        dims.profileHeight
                    );

                    const x = dims.sideSpacing + (dims.profileWidth - scaledWidth) / 2 + imagePosition.x * (dims.width / 900);
                    const y = profileY + (dims.profileHeight - scaledHeight) / 2 + imagePosition.y * (dims.height / 1062);

                    ctx.drawImage(userImg, x, y, scaledWidth * imagePosition.scale, scaledHeight * imagePosition.scale);
                    ctx.restore();

                    if (formData.name) {
                        ctx.save();
                        const firstName = formData.name.split(" ")[0].toUpperCase();
                        const maxWidth = dims.width * 0.149;
                        const horizontalPadding = dims.width * 0.011;
                        let fontSize = dims.width * 0.071;

                        ctx.textAlign = "center";
                        ctx.fillStyle = "#FFFFFF";

                        do {
                            ctx.font = `${fontSize}px Poppins`;
                            fontSize--;
                        } while (ctx.measureText(firstName).width > maxWidth && fontSize > dims.width * 0.02);

                        const textHeight = fontSize * 1.2;
                        const textX = dims.width * 0.139 + horizontalPadding + maxWidth / 2;
                        const defaultY = dims.height - dims.height * 0.154;
                        const textY = defaultY - (textHeight - fontSize) / 2;

                        for (let i = 0; i < 3; i++) {
                            ctx.strokeText(firstName, textX, textY);
                        }
                        for (let i = 0; i < 2; i++) {
                            ctx.fillText(firstName, textX, textY);
                        }
                        ctx.restore();
                    }
                };
            }
        };
    }, [formData.photo, formData.name, imagePosition, getCanvasDimensions]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            updateCanvas();
            const handleResize = () => updateCanvas();
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, [updateCanvas]);

    const uploadToCloudinary = async (dataUrl: string): Promise<string> => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], "social-card.jpg", { type: "image/jpeg" });
        return await uploadFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const canvas = canvasRef.current;
            if (!canvas) throw new Error("Canvas not found");

            const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
            const socialCardUrl = await uploadToCloudinary(dataUrl);

            const registrationData = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                profilePhoto: formData.photo,
                socialCard: socialCardUrl,
                event: "this-is-lagos",
                role: "attendee",
            };

            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registrationData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            setSocialCardUrl(socialCardUrl);
            setShowSuccessModal(true);
            toast.success("Registration completed successfully!");
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to complete registration. Please try again.");
            resetForm();
        } finally {
            setIsLoading(false);
        }
    };

    const MarqueeText = useMemo(() => {
        return function MarqueeTextComponent() {
            return (
                <div className="fixed top-0 w-full pointer-events-none overflow-hidden z-0 bg-white/80 backdrop-blur-sm py-3">
                    <div className="animate-marquee whitespace-nowrap">
                        {Array(10)
                            .fill("THIS IS LAGOS")
                            .map((text, i) => (
                                <span key={i} className="mx-4 text-4xl font-dakdo font-bold text-[#ff0000] opacity-50">
                                    {text}
                                </span>
                            ))}
                    </div>
                </div>
            );
        };
    }, []);

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <MarqueeText />
            <div className="pt-16 md:pt-20 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center space-y-4 md:space-y-6">
                    <div className="flex justify-center mb-6 md:mb-8">
                        <Image src="/images/logo.png" alt="Event Logo" width={120} height={120} className="h-auto md:w-[180px]" priority />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-dakdo font-bold text-[#ff0000] tracking-tight">THIS IS LAGOS</h1>
                    <div className="space-y-3 md:space-y-4">
                        <p className="text-xl md:text-2xl font-poppins font-semibold text-gray-800">
                            Blkat invites you to the pre seed launch of the African Creative Fund
                        </p>
                        <p className="text-lg md:text-xl font-inter text-gray-600">📅 Date: November 20th, 2024 | ⏰ Time: 9:00 AM - 3:00 PM</p>
                        <p className="text-lg md:text-xl font-inter text-gray-600">📍 Alliance Francaise, Ikoyi, Lagos</p>
                    </div>
                </div>
            </div>

            <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card className="shadow-xl border-2">
                            <CardContent className="p-6 md:p-10">
                                <div className="mb-10 text-center">
                                    <h2 className="text-3xl font-dakdo font-bold text-gray-900 mb-3">Registration Form</h2>
                                    <p className="text-lg font-inter text-gray-600">Fill in your details to secure your spot at the event</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
                                                <Label htmlFor="name" className="text-lg font-poppins font-medium">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                                    required
                                                    className="h-12 text-lg font-inter"
                                                    placeholder="Enter your full name"
                                                />
                                            </motion.div>

                                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
                                                <Label htmlFor="email" className="text-lg font-poppins font-medium">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                                    required
                                                    className="h-12 text-lg font-inter"
                                                    placeholder="Enter your email address"
                                                />
                                            </motion.div>

                                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-2">
                                                <Label htmlFor="phone" className="text-lg font-poppins font-medium">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                                                    required
                                                    className="h-12 text-lg font-inter"
                                                    placeholder="Enter your phone number"
                                                />
                                            </motion.div>
                                        </div>

                                        <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                                        <div className="space-y-6">
                                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4">
                                                {!formData.photo ? (
                                                    <div
                                                        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors relative ${
                                                            isUploadLoading ? "bg-gray-50" : ""
                                                        }`}
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <div className="space-y-4">
                                                            <div className="mx-auto h-16 w-16 text-gray-400">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                                </svg>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-lg font-medium">Upload your photo</p>
                                                                <p className="text-sm text-gray-500">Click to browse</p>
                                                            </div>
                                                        </div>
                                                        {isUploadLoading && (
                                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="relative w-full aspect-[398/488] rounded-lg overflow-hidden shadow-lg">
                                                            <img src={formData.photo} alt="Preview" className="object-cover w-full h-full rounded-lg" />
                                                        </div>
                                                        <Button type="button" onClick={() => setFormData((prev) => ({ ...prev, photo: "" }))} variant="secondary" className="w-full">
                                                            Change Photo
                                                        </Button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </div>

                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full h-14 text-xl font-poppins font-semibold bg-[#ff0000] hover:bg-[#cc0000] text-white"
                                            disabled={isLoading || !formData.photo}
                                        >
                                            {isLoading ? "Processing..." : "Complete Registration"}
                                        </Button>
                                    </motion.div>
                                </form>
                                <canvas ref={canvasRef} className="hidden" />
                                <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} socialCardUrl={socialCardUrl} />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
