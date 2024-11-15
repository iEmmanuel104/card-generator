"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface QuestionResponse {
    thoughts: string;
    otherThoughts?: string;
    subsectors: string;
    otherSubsector?: string;
    challenges: string;
    otherChallenges?: string;
}

export default function ThisIsLagos() {
    const [responses, setResponses] = useState<QuestionResponse>({
        thoughts: "",
        subsectors: "",
        challenges: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/questionnaire", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(responses),
            });

            if (!response.ok) throw new Error("Failed to submit responses");

            toast.success("Thank you for your feedback!");
            setResponses({
                thoughts: "",
                subsectors: "",
                challenges: "",
            });
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to submit responses. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <div className="pt-16 md:pt-20 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center space-y-4 md:space-y-6">
                    <div className="flex justify-center mb-6 md:mb-8">
                        <Image src="/images/logo.png" alt="Event Logo" width={120} height={120} className="h-auto md:w-[180px]" priority />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-dakdo font-bold text-[#ff0000] tracking-tight">THIS IS LAGOS</h1>
                    <div className="space-y-3 md:space-y-4">
                        <p className="text-xl md:text-2xl font-poppins font-semibold text-gray-800">Martell Tour Feedback</p>
                    </div>
                </div>
            </div>

            <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-3xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card className="shadow-xl border-2">
                            <CardContent className="p-6 md:p-10">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Question 1 */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-primary font-medium">
                                            What are your thoughts about the Nigerian Creative Industry?
                                        </Label>
                                        <RadioGroup
                                            value={responses.thoughts}
                                            onValueChange={(value) => setResponses((prev) => ({ ...prev, thoughts: value }))}
                                            className="space-y-3 font-poppins"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="growing" id="growing" />
                                                <Label htmlFor="growing">Growing and promising</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="needs-support" id="needs-support" />
                                                <Label htmlFor="needs-support">Needs more support and investment</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="challenging" id="challenging" />
                                                <Label htmlFor="challenging">Facing significant challenges</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="other-thoughts" id="other-thoughts" />
                                                <Label htmlFor="other-thoughts">Other</Label>
                                            </div>
                                        </RadioGroup>
                                        {responses.thoughts === "other-thoughts" && (
                                            <Textarea
                                                placeholder="Please share your thoughts..."
                                                value={responses.otherThoughts}
                                                onChange={(e) => setResponses((prev) => ({ ...prev, otherThoughts: e.target.value }))}
                                                className="mt-2 font-poppins"
                                            />
                                        )}
                                    </div>

                                    {/* Question 2 */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-primary font-medium">
                                            Which subsectors in the Nigerian creative industry are you most interested in?
                                        </Label>
                                        <RadioGroup
                                            value={responses.subsectors}
                                            onValueChange={(value) => setResponses((prev) => ({ ...prev, subsectors: value }))}
                                            className="space-y-3 font-poppins"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="film" id="film" />
                                                <Label htmlFor="film">Film and Television</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="music" id="music" />
                                                <Label htmlFor="music">Music and Sound</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="fashion" id="fashion" />
                                                <Label htmlFor="fashion">Fashion and Design</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="tech" id="tech" />
                                                <Label htmlFor="tech">Creative Technology</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="other-subsector" id="other-subsector" />
                                                <Label htmlFor="other-subsector">Other</Label>
                                            </div>
                                        </RadioGroup>
                                        {responses.subsectors === "other-subsector" && (
                                            <Textarea
                                                placeholder="Please specify the subsector..."
                                                value={responses.otherSubsector}
                                                onChange={(e) => setResponses((prev) => ({ ...prev, otherSubsector: e.target.value }))}
                                                className="mt-2 font-poppins"
                                            />
                                        )}
                                    </div>

                                    {/* Question 3 */}
                                    <div className="space-y-4">
                                        <Label className="text-lg font-primary font-medium">
                                            What are the challenges in the industry, and how can we move forward?
                                        </Label>
                                        <RadioGroup
                                            value={responses.challenges}
                                            onValueChange={(value) => setResponses((prev) => ({ ...prev, challenges: value }))}
                                            className="space-y-3 font-poppins"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="funding" id="funding" />
                                                <Label htmlFor="funding">Lack of funding and investment</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="infrastructure" id="infrastructure" />
                                                <Label htmlFor="infrastructure">Infrastructure and technology gaps</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="policy" id="policy" />
                                                <Label htmlFor="policy">Policy and regulatory issues</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="other-challenges" id="other-challenges" />
                                                <Label htmlFor="other-challenges">Other</Label>
                                            </div>
                                        </RadioGroup>
                                        {responses.challenges === "other-challenges" && (
                                            <Textarea
                                                placeholder="Please describe the challenges and potential solutions..."
                                                value={responses.otherChallenges}
                                                onChange={(e) => setResponses((prev) => ({ ...prev, otherChallenges: e.target.value }))}
                                                className="mt-2 font-poppins"
                                            />
                                        )}
                                    </div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="pt-4"
                                    >
                                        <Button
                                            type="submit"
                                            className="w-full h-14 text-xl font-poppins font-semibold bg-[#ff0000] hover:bg-[#cc0000] text-white"
                                            disabled={isSubmitting || !responses.thoughts || !responses.subsectors || !responses.challenges}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Feedback"}
                                        </Button>
                                    </motion.div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
