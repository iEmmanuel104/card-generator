"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface SlideInfo {
    title: string;
    content: string;
    bgColor: string;
    textColor: string;
    titleFont: string;
    contentFont: string;
}

const infoSlides: SlideInfo[] = [
    {
        title: "Welcome to BLKAT",
        content:
            "Welcome to BlackAt Platform, where our mission is to revolutionize the way black executives and agencies connect, grow, and succeed in today's dynamic business world. We're creating a vibrant ecosystem where C-suite executives can thrive beyond traditional roles.",
        bgColor: "bg-black",
        textColor: "text-white",
        titleFont: "font-dakdo",
        contentFont: "font-poppins",
    },
    {
        title: "For Executives",
        content:
            "BlackAt is uniquely tailored for executives who are pivotal to their organizations. We provide structured pathways for development, including personal assistants, masterclasses led by experienced leaders, and opportunities for global mentorship.",
        bgColor: "bg-[#F04950]",
        textColor: "text-white",
        titleFont: "font-dakdo",
        contentFont: "font-poppins",
    },
    {
        title: "For Vendors & Creatives",
        content:
            "Create your business page to showcase capabilities and connect with top executives. Whether you're an established professional or emerging talent, BlackAt is your stage to access exclusive opportunities and build meaningful relationships.",
        bgColor: "bg-gray-900",
        textColor: "text-white",
        titleFont: "font-dakdo",
        contentFont: "font-poppins",
    },
    {
        title: "Join Our Movement",
        content:
            "We've long talked about access and opportunity. Now, we're making it a reality. Join us in creating a world where every black executive and agency can reach unparalleled heights of success. Together, we grow, succeed, and lead.",
        bgColor: "bg-black",
        textColor: "text-white",
        titleFont: "font-dakdo",
        contentFont: "font-poppins",
    },
];

const InfoSlider: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [touchStart, setTouchStart] = useState<number>(0);
    const slideInterval = 10000;

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;

        if (!isPaused) {
            timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % infoSlides.length);
            }, slideInterval);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [isPaused]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>): void => {
        const touchEnd = e.changedTouches[0].clientX;
        const touchDiff = touchStart - touchEnd;

        if (Math.abs(touchDiff) > 50) {
            if (touchDiff > 0) {
                // Swipe left
                setCurrentSlide((prev) => (prev + 1) % infoSlides.length);
            } else {
                // Swipe right
                setCurrentSlide((prev) => (prev - 1 + infoSlides.length) % infoSlides.length);
            }
        }
    };

    const goToSlide = (index: number): void => {
        setCurrentSlide(index);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 100);
    };

    return (
        <div className="relative w-full h-full">
            {/* Main slider container */}
            <div
                className="relative h-[350px] xs:h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden rounded-xl"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={`absolute inset-0 ${infoSlides[currentSlide].bgColor} ${infoSlides[currentSlide].textColor}`}
                    >
                        <div className="relative h-full flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
                            <div className="w-full max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
                                <h2
                                    className={`${infoSlides[currentSlide].titleFont} text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide px-2`}
                                >
                                    {infoSlides[currentSlide].title}
                                </h2>
                                <p
                                    className={`${infoSlides[currentSlide].contentFont} text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed px-2 sm:px-4 md:px-8 max-w-3xl mx-auto`}
                                >
                                    {infoSlides[currentSlide].content}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                <button
                    onClick={() => goToSlide((currentSlide - 1 + infoSlides.length) % infoSlides.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 hidden sm:block"
                    aria-label="Previous slide"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={() => goToSlide((currentSlide + 1) % infoSlides.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 hidden sm:block"
                    aria-label="Next slide"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Navigation dots */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-3 p-2">
                {infoSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`group relative p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded-full transition-all duration-300`}
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        <span
                            className={`block h-2 rounded-full transition-all duration-300 ${
                                index === currentSlide ? "w-8 bg-gray-800" : "w-2 bg-gray-400 group-hover:bg-gray-600"
                            }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function ThisIsLagos() {
    const [responses, setResponses] = useState<QuestionResponse>({
        platformFeedback: "",
        thoughts: "",
        subsectors: "",
        challenges: "",
        otherFeedback: "",
        otherThoughts: "",
        otherSubsector: "",
        otherChallenges: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/questionnaire", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(responses),
            });

            if (!response.ok) throw new Error("Failed to submit responses");

            toast.success("Thank you for your feedback!");
            setResponses({
                platformFeedback: "",
                thoughts: "",
                subsectors: "",
                challenges: "",
                otherFeedback: "",
                otherThoughts: "",
                otherSubsector: "",
                otherChallenges: "",
            });
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to submit responses. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white py-8 md:py-16 px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-7xl mx-auto">
                {/* Header Section - Keep centered */}
                <div className="text-center mb-8 md:mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center mb-4 md:mb-6"
                    >
                        <Image
                            src="/images/logo.png"
                            alt="Event Logo"
                            width={120}
                            height={120}
                            className="h-auto w-[100px] md:w-[180px] transform hover:scale-105 transition-transform duration-300"
                            priority
                        />
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl sm:text-4xl md:text-6xl font-dakdo font-bold text-[#ff0000] tracking-tight mb-2 md:mb-4 hover:text-[#cc0000] transition-colors duration-300"
                    >
                        THIS IS LAGOS
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg sm:text-xl md:text-2xl font-poppins font-semibold text-gray-800 max-w-2xl mx-auto"
                    >
                        Celebrating African Creativity & Innovation
                    </motion.p>
                </div>

                {/* Info Slider - Update height and padding */}
                <div className="relative h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden rounded-xl mx-auto max-w-4xl mb-8 md:mb-12">
                    <InfoSlider />
                </div>

                {/* Introduction Section - Left-aligned text for better readability */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="max-w-3xl mx-auto mb-8 md:mb-12 px-4 sm:px-6"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-dakdo text-[#F04950] mb-6 text-left">Share Your Voice</h2>
                    <div className="space-y-6 font-poppins text-gray-800">
                        <p className="text-base sm:text-lg md:text-xl text-left leading-relaxed">
                            At BLKAT, we believe in the power of collective growth and shared experiences. Your insights are invaluable in shaping how
                            we can better serve and empower our creative community.
                        </p>
                        <p className="text-sm sm:text-base md:text-lg text-left leading-relaxed text-gray-600">
                            Through this questionnaire, we aim to understand your perspective on the creative industry and how BLKAT can better
                            amplify Black voices and talents. Your feedback will directly influence our approach to fostering innovation,
                            collaboration, and success within our community.
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8">
                            <span className="inline-block px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-300">
                                Estimated time: 3-5 minutes
                            </span>
                            <span className="text-gray-600 text-sm italic">Your responses will help shape the future of Black creativity</span>
                        </div>
                    </div>
                </motion.div>

                {/* Questionnaire Section - Update card styling */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="max-w-3xl mx-auto"
                >
                    <Card className="shadow-2xl border-2 hover:shadow-3xl transition-shadow duration-300">
                        <CardContent className="p-4 sm:p-6 md:p-10">
                            {/* Update QuestionSection styling */}
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Platform Feedback Question */}
                                <QuestionSection
                                    label="How can BLKAT better support black creators in achieving global recognition?"
                                    name="platformFeedback"
                                    options={[
                                        { value: "networking", label: "Enhanced networking opportunities" },
                                        { value: "resources", label: "More creative resources and tools" },
                                        { value: "exposure", label: "Greater global exposure opportunities" },
                                        { value: "other-feedback", label: "Other" },
                                    ]}
                                    responses={responses}
                                    setResponses={setResponses}
                                    otherKey="otherFeedback"
                                />

                                {/* Industry Thoughts Question */}
                                <QuestionSection
                                    label="What are your thoughts about the Nigerian Creative Industry?"
                                    name="thoughts"
                                    options={[
                                        { value: "growing", label: "Growing and promising" },
                                        { value: "needs-support", label: "Needs more support and investment" },
                                        { value: "challenging", label: "Facing significant challenges" },
                                        { value: "other-thoughts", label: "Other" },
                                    ]}
                                    responses={responses}
                                    setResponses={setResponses}
                                    otherKey="otherThoughts"
                                />

                                {/* Subsectors Question */}
                                <QuestionSection
                                    label="Which subsectors in the Nigerian creative industry are you most interested in?"
                                    name="subsectors"
                                    options={[
                                        { value: "film", label: "Film and Television" },
                                        { value: "music", label: "Music and Sound" },
                                        { value: "fashion", label: "Fashion and Design" },
                                        { value: "tech", label: "Creative Technology" },
                                        { value: "other-subsector", label: "Other" },
                                    ]}
                                    responses={responses}
                                    setResponses={setResponses}
                                    otherKey="otherSubsector"
                                />

                                {/* Challenges Question */}
                                <QuestionSection
                                    label="What are the challenges in the industry, and how can we move forward?"
                                    name="challenges"
                                    options={[
                                        { value: "funding", label: "Lack of funding and investment" },
                                        { value: "infrastructure", label: "Infrastructure and technology gaps" },
                                        { value: "policy", label: "Policy and regulatory issues" },
                                        { value: "other-challenges", label: "Other" },
                                    ]}
                                    responses={responses}
                                    setResponses={setResponses}
                                    otherKey="otherChallenges"
                                />

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-xl font-poppins font-semibold bg-[#ff0000] hover:bg-[#cc0000] text-white"
                                        disabled={
                                            isSubmitting ||
                                            !responses.platformFeedback ||
                                            !responses.thoughts ||
                                            !responses.subsectors ||
                                            !responses.challenges
                                        }
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                                    </Button>
                                </motion.div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}

interface QuestionResponse {
    platformFeedback: string;
    thoughts: string;
    subsectors: string;
    challenges: string;
    otherFeedback?: string;
    otherThoughts?: string;
    otherSubsector?: string;
    otherChallenges?: string;
}

interface QuestionOption {
    value: string;
    label: string;
}

interface QuestionSectionProps {
    label: string;
    name: keyof QuestionResponse;
    options: QuestionOption[];
    responses: QuestionResponse;
    setResponses: React.Dispatch<React.SetStateAction<QuestionResponse>>;
    otherKey: keyof QuestionResponse;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ label, name, options, responses, setResponses, otherKey }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300"
    >
        <Label className="text-base sm:text-lg font-primary font-medium block text-left mb-4">{label}</Label>
        <RadioGroup
            value={responses[name]}
            onValueChange={(value) => setResponses((prev) => ({ ...prev, [name]: value }))}
            className="space-y-3 font-poppins"
        >
            {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                    <Label htmlFor={`${name}-${option.value}`} className="text-sm sm:text-base cursor-pointer">
                        {option.label}
                    </Label>
                </div>
            ))}
        </RadioGroup>
        {responses[name]?.includes("other") && (
            <Textarea
                placeholder="Please share your thoughts..."
                value={responses[otherKey]}
                onChange={(e) => setResponses((prev) => ({ ...prev, [otherKey]: e.target.value }))}
                className="mt-2 font-poppins w-full p-3 transition-colors duration-200 focus:ring-2 focus:ring-[#F04950]"
            />
        )}
    </motion.div>
);