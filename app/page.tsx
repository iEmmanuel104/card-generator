"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";
import { Registration } from "@/lib/types";
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

export default function EventRegistration() {
    const isDevelopment = true;

    const [formData, setFormData] = useState<RegistrationData>({
        name: "",
        email: "",
        phoneNumber: "",
        photo: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const [imagePosition, setImagePosition] = useState<ImagePosition>({
        x: 0,
        y: 0,
        scale: 1,
    });
    const { uploadFile, isUploading } = useCloudinaryUpload();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [socialCardUrl, setSocialCardUrl] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadLoading(true);
            const uploadedUrl = await uploadFile(file);
            setFormData((prev) => ({ ...prev, photo: uploadedUrl }));
            toast.success("Photo uploaded successfully!");
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploadLoading(false);
        }
    };

    // Function to calculate dimensions maintaining aspect ratio
    const calculateDimensions = (originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number) => {
        const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
        return {
            width: originalWidth * ratio,
            height: originalHeight * ratio,
        };
    };

    // Function to redraw canvas with current position settings
    const updateCanvas = useCallback(() => {
        if (typeof window === "undefined") return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Load template
        const templateImg = new window.Image();
        templateImg.src = "/images/template.jpg";

        templateImg.onload = () => {
            canvas.width = 900;
            canvas.height = 1062;
            ctx.drawImage(templateImg, 0, 0);

            if (formData.photo) {
                const userImg = new window.Image();
                userImg.crossOrigin = "anonymous";
                userImg.src = formData.photo;

                userImg.onload = () => {
                    const profileWidth = 398;
                    const profileHeight = 488;
                    const sideSpacing = 251;
                    const profileY = Math.round((1062 - profileHeight) / 2) + 38;

                    // Draw user photo
                    ctx.save();
                    ctx.beginPath();
                    const radius = 20;
                    ctx.roundRect(sideSpacing, profileY, profileWidth, profileHeight, radius);
                    ctx.clip();

                    // Get dimensions that fill the entire space while maintaining aspect ratio
                    const { width: scaledWidth, height: scaledHeight } = calculateDimensions(
                        userImg.width,
                        userImg.height,
                        profileWidth,
                        profileHeight
                    );

                    // Calculate positioning to center the image
                    const x = sideSpacing + (profileWidth - scaledWidth) / 2 + imagePosition.x;
                    const y = profileY + (profileHeight - scaledHeight) / 2 + imagePosition.y;

                    // Draw the image with the calculated dimensions
                    ctx.drawImage(userImg, x, y, scaledWidth * imagePosition.scale, scaledHeight * imagePosition.scale);
                    ctx.restore();

                    if (isDevelopment) {
                        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.roundRect(sideSpacing, profileY, profileWidth, profileHeight, radius);
                        ctx.stroke();
                    }
                };
            }
        };
    }, [formData.photo, imagePosition, isDevelopment]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            updateCanvas();
        }
    }, [updateCanvas]);

    const uploadToCloudinary = async (dataUrl: string): Promise<string> => {
        try {
            // Convert base64 to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], "social-card.jpg", { type: "image/jpeg" });

            return await uploadFile(file);
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const canvas = canvasRef.current;
            if (!canvas) {
                throw new Error("Canvas not found");
            }

            // Make sure canvas is properly sized
            if (canvas.width !== 900 || canvas.height !== 1062) {
                canvas.width = 900;
                canvas.height = 1062;
                await updateCanvas(); // Wait for canvas to update
            }

            // Generate the social card
            toast.info("Generating your social card...");
            const dataUrl = canvas.toDataURL("image/jpeg", 1.0);

            // Upload social card to Cloudinary
            toast.info("Uploading social card...");
            const socialCardUrl = await uploadToCloudinary(dataUrl);

            // Prepare registration data
            const registrationData: Omit<Registration, "_id" | "createdAt"> = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                profilePhoto: formData.photo,
                socialCard: socialCardUrl,
            };

            // Submit registration to API
            toast.info("Completing registration...");
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registrationData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            // Show success modal with social card
            setSocialCardUrl(socialCardUrl);
            setShowSuccessModal(true);
            toast.success("Registration completed successfully!");
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Failed to complete registration. Please try again.");
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
        <div className="min-h-screen bg-white">
            <MarqueeText />
            <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center space-y-6">
                    <div className="flex justify-center mb-8">
                        <Image src="/images/logo.png" alt="Event Logo" width={180} height={180} priority className="h-auto" />
                    </div>
                    <h1 className="text-6xl font-dakdo font-bold text-[#ff0000] tracking-tight">THIS IS LAGOS</h1>
                    <div className="space-y-4">
                        <p className="text-2xl font-poppins font-semibold text-gray-800">
                            Blkat invites you to the pre seed launch of the African Creative Fund
                        </p>
                        <p className="text-xl font-inter text-gray-600">📅 Date: November 20th, 2024 | ⏰ Time: 9:00 AM - 3:00 PM</p>
                        <p className="text-xl font-inter text-gray-600">📍 Alliance Francaise, Ikoyi, Lagos</p>
                    </div>
                </div>
            </div>

            {/* Registration Form Section */}
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card className="shadow-xl border-2">
                            <CardContent className="p-10">
                                <div className="mb-10 text-center">
                                    <h2 className="text-3xl font-dakdo font-bold text-gray-900 mb-3">Registration Form</h2>
                                    <p className="text-lg font-inter text-gray-600">Fill in your details to secure your spot at the event</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Rest of your existing form code */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Left Column */}
                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-3"
                                            >
                                                <Label htmlFor="name" className="text-lg font-poppins font-medium">
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                                    required
                                                    className="h-12 text-lg font-inter"
                                                    placeholder="Enter your full name"
                                                />
                                            </motion.div>

                                            <motion.div
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor="email" className="text-lg font-poppins font-medium">
                                                    Email Address
                                                </Label>
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

                                            <motion.div
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor="phone" className="text-lg font-poppins font-medium">
                                                    Phone Number
                                                </Label>
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

                                        {/* Hidden file input */}
                                        <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                                        {/* Right Column */}
                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="space-y-4"
                                            >
                                                {!formData.photo ? (
                                                    <div
                                                        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer 
                                                        hover:border-gray-400 transition-colors relative
                                                        ${isUploadLoading ? "bg-gray-50" : ""}`}
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <div className="space-y-4">
                                                            <div className="mx-auto h-16 w-16 text-gray-400">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="w-16 h-16"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                                                    />
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
                                                    <div className={"space-y-4"}>
                                                        <div className="relative w-full aspect-[398/488] rounded-lg overflow-hidden shadow-lg">
                                                            <img
                                                                src={formData.photo}
                                                                alt="Preview"
                                                                className="object-cover w-full h-full rounded-lg"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={() => setFormData((prev) => ({ ...prev, photo: "" }))}
                                                            variant="secondary"
                                                            className="w-full"
                                                        >
                                                            Change Photo
                                                        </Button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Development Controls */}
                                    {/* {isDevelopment && formData.photo && (
                                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                                            <div className="space-y-4 border p-6 rounded-lg bg-gray-50">
                                                <h3 className="text-lg font-semibold">Image Position Controls</h3>
                                                <div className="grid gap-6">
                                                    <div className="space-y-2">
                                                        <Label>X Position ({imagePosition.x.toFixed(0)}px)</Label>
                                                        <Slider
                                                            value={[imagePosition.x]}
                                                            onValueChange={(value) =>
                                                                setImagePosition((prev) => ({
                                                                    ...prev,
                                                                    x: value[0],
                                                                }))
                                                            }
                                                            min={-100}
                                                            max={100}
                                                            step={1}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Y Position ({imagePosition.y.toFixed(0)}px)</Label>
                                                        <Slider
                                                            value={[imagePosition.y]}
                                                            onValueChange={(value) =>
                                                                setImagePosition((prev) => ({
                                                                    ...prev,
                                                                    y: value[0],
                                                                }))
                                                            }
                                                            min={-100}
                                                            max={100}
                                                            step={1}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Scale ({imagePosition.scale.toFixed(2)}x)</Label>
                                                        <Slider
                                                            value={[imagePosition.scale * 100]}
                                                            onValueChange={(value) =>
                                                                setImagePosition((prev) => ({
                                                                    ...prev,
                                                                    scale: value[0] / 100,
                                                                }))
                                                            }
                                                            min={80}
                                                            max={120}
                                                            step={1}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Canvas Preview</Label>
                                                <div className="border rounded-lg p-4 bg-white">
                                                    <canvas ref={canvasRef} className="w-full h-auto" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )} */}

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="pt-4"
                                    >
                                        <Button
                                            type="submit"
                                            className="w-full h-14 text-xl font-poppins font-semibold bg-[#ff0000] hover:bg-[#cc0000] text-white"
                                            disabled={isLoading || !formData.photo}
                                        >
                                            {isLoading ? "Processing..." : "Complete Registration"}
                                        </Button>
                                    </motion.div>
                                </form>
                                {/* Hidden canvas for generating social card */}
                                <canvas ref={canvasRef} className="hidden" />
                                {/* Add Success Modal */}
                                <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} socialCardUrl={socialCardUrl} />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
