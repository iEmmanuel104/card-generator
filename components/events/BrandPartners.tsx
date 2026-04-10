"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

interface Partner {
    name: string;
    logoPath: string;
    url?: string;
}

interface BrandPartnersProps {
    partners: Partner[];
    mediaPartners: Partner[];
    theme: "light" | "dark";
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
};

function DiamondDivider({ maxLineWidth = 120 }: { maxLineWidth?: number }) {
    return (
        <div className="flex items-center justify-center gap-3 mb-6">
            <div
                className="h-px bg-gradient-to-r from-transparent to-[#333] flex-1"
                style={{ maxWidth: `${maxLineWidth}px` }}
            />
            <span className="text-[#dc2626] text-xs">&#9670;</span>
            <div
                className="h-px bg-gradient-to-r from-[#333] to-transparent flex-1"
                style={{ maxWidth: `${maxLineWidth}px` }}
            />
        </div>
    );
}

export function BrandPartners({ partners, mediaPartners }: BrandPartnersProps) {
    const allPartners = [...partners, ...mediaPartners];

    return (
        <div className="space-y-6">
            <DiamondDivider maxLineWidth={120} />

            {/* Single-line layout: all partners together */}
            <div>
                <p className="text-xs tracking-[0.2em] uppercase text-gray-500 font-poppins font-light text-center mb-6">
                    {mediaPartners.length > 0 ? "Our Partners" : "Brand Partners"}
                </p>

                <motion.div
                    className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {allPartners.map((partner) => {
                        const isTelkom = partner.name === 'Telkom';
                        const isUnstereotype = partner.name === 'Unstereotype Alliance';
                        const sizeClass = isTelkom
                            ? "relative h-12 w-24 sm:h-16 sm:w-32 md:h-18 md:w-36"
                            : isUnstereotype
                            ? "relative h-10 w-28 sm:h-14 sm:w-36 md:h-16 md:w-44"
                            : "relative h-10 w-16 sm:h-12 sm:w-20 md:h-14 md:w-24";
                        return (
                            <motion.div
                                key={partner.name}
                                variants={itemVariants}
                                className={`${sizeClass} opacity-60 hover:opacity-100 hover:scale-[1.08] hover:brightness-[1.2] transition-all duration-300 ease-out flex-shrink-0`}
                            >
                                <Image
                                    src={partner.logoPath}
                                    alt={partner.name}
                                    fill
                                    className="object-contain"
                                    sizes={isTelkom ? "(max-width: 640px) 96px, (max-width: 768px) 128px, 144px" : isUnstereotype ? "(max-width: 640px) 112px, (max-width: 768px) 144px, 176px" : "(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"}
                                />
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
