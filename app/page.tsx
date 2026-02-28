"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAllEvents } from "@/lib/events";
import { Calendar, MapPin } from "lucide-react";

export default function EventsHub() {
    const events = getAllEvents();

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <div className="flex justify-center mb-6">
                        <Image src="/images/logo.png" alt="BLK@ Logo" width={140} height={70} className="h-auto" priority />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-dakdo font-bold text-gray-900 mb-3">
                        BLK@ Events
                    </h1>
                    <p className="text-lg md:text-xl font-inter text-gray-500">
                        Discover and register for upcoming events
                    </p>
                </motion.div>

                {/* Event Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {events.map((event, index) => {
                        const isTHL = event.slug === "through-her-lens";
                        const isTIL = event.slug === "this-is-lagos";

                        if (isTHL) {
                            // THL — Active event with dramatic dark card styling
                            return (
                                <motion.div
                                    key={event.slug}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                                    className="md:order-first"
                                >
                                    <Link href={`/events/${event.slug}`}>
                                        <div className="group relative rounded-2xl border-2 border-[#333] p-8 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20 hover:-translate-y-1 hover:border-[#dc2626]/50 cursor-pointer h-full flex flex-col overflow-hidden bg-[#0a0a0a]">
                                            {/* Background flyer image with overlay */}
                                            <div className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500">
                                                <Image
                                                    src="/images/thl-flyer.jpg"
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

                                            <div className="relative z-10">
                                                <h2 className="text-2xl md:text-3xl font-dakdo font-bold mb-3 text-white">
                                                    {event.name}
                                                </h2>
                                                <p className="text-sm md:text-base font-inter mb-6 leading-relaxed text-gray-400 flex-1">
                                                    {event.tagline}
                                                </p>
                                                <div className="space-y-2 mb-6 text-sm font-inter text-gray-500">
                                                    <p className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 text-[#dc2626]" />
                                                        {event.date}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <MapPin className="w-3.5 h-3.5 text-[#dc2626]" />
                                                        {event.venue}
                                                    </p>
                                                </div>
                                                <div className="inline-flex items-center font-poppins font-semibold text-sm text-[#dc2626] group-hover:text-[#ef4444] transition-colors">
                                                    Register Now
                                                    <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        }

                        if (isTIL) {
                            // TIL — Past event, non-interactive, light card
                            return (
                                <motion.div
                                    key={event.slug}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                                >
                                    <div className="relative rounded-2xl border-2 border-gray-200 p-8 h-full flex flex-col bg-gray-50 opacity-80">
                                        {/* Past event ribbon */}
                                        <div className="absolute top-4 right-4 bg-gray-200 text-gray-500 text-[10px] font-poppins font-medium uppercase tracking-wider px-3 py-1 rounded-full">
                                            Event Concluded
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-dakdo font-bold mb-3 text-gray-500">
                                            {event.name}
                                        </h2>
                                        <p className="text-sm md:text-base font-inter mb-6 leading-relaxed text-gray-400 flex-1">
                                            {event.tagline}
                                        </p>
                                        <div className="space-y-2 mb-6 text-sm font-inter text-gray-400">
                                            <p className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {event.date}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {event.venue}
                                            </p>
                                        </div>
                                        <p className="text-xs font-inter text-gray-400">
                                            November 2024
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        }

                        // Default card for any future events
                        return (
                            <motion.div
                                key={event.slug}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                            >
                                <Link href={`/events/${event.slug}`}>
                                    <div className="group rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full flex flex-col bg-white border-gray-200 hover:border-[#ff0000]/50 hover:shadow-red-100">
                                        <h2 className="text-2xl md:text-3xl font-dakdo font-bold mb-3 text-gray-900">
                                            {event.name}
                                        </h2>
                                        <p className="text-sm md:text-base font-inter mb-6 leading-relaxed flex-1 text-gray-600">
                                            {event.tagline}
                                        </p>
                                        <div className="space-y-2 mb-6 text-sm font-inter text-gray-500">
                                            <p className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-[#ff0000]" />
                                                {event.date}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-[#ff0000]" />
                                                {event.venue}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center font-poppins font-semibold text-sm transition-colors text-[#ff0000] group-hover:text-[#cc0000]">
                                            Register Now
                                            <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
