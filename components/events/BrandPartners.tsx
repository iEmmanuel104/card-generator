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
    return (
        <div className="space-y-12">
            {/* Diamond divider */}
            <DiamondDivider maxLineWidth={120} />

            {/* Brand Partners section */}
            <div>
                <p className="text-xs tracking-[0.2em] uppercase text-gray-500 font-poppins font-light text-center mb-8">
                    Brand Partners
                </p>

                {/* Desktop: horizontal strip */}
                <motion.div
                    className="hidden md:flex items-center justify-center gap-8 md:gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {partners.map((partner) => (
                        <motion.div
                            key={partner.name}
                            variants={itemVariants}
                            className="relative h-12 md:h-16 w-20 md:w-28 opacity-60 hover:opacity-100 hover:scale-[1.08] hover:brightness-[1.2] transition-all duration-300 ease-out"
                        >
                            <Image
                                src={partner.logoPath}
                                alt={partner.name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 80px, 112px"
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mobile: 2-column grid */}
                <motion.div
                    className="grid grid-cols-2 gap-6 md:hidden"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {partners.map((partner) => (
                        <motion.div
                            key={partner.name}
                            variants={itemVariants}
                            className="flex items-center justify-center"
                        >
                            <div className="relative h-14 w-full opacity-60 hover:opacity-100 hover:scale-[1.08] hover:brightness-[1.2] transition-all duration-300 ease-out">
                                <Image
                                    src={partner.logoPath}
                                    alt={partner.name}
                                    fill
                                    className="object-contain"
                                    sizes="50vw"
                                />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Media Partners section */}
            {mediaPartners.length > 0 && (
                <div>
                    <DiamondDivider maxLineWidth={80} />

                    <p className="text-xs tracking-[0.2em] uppercase text-gray-500 font-poppins font-light text-center mb-8">
                        Media Partner
                    </p>

                    <motion.div
                        className="flex items-center justify-center"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {mediaPartners.map((partner) => (
                            <motion.div
                                key={partner.name}
                                variants={itemVariants}
                                className="relative h-12 md:h-16 w-20 md:w-28 opacity-60 hover:opacity-100 hover:scale-[1.08] hover:brightness-[1.2] transition-all duration-300 ease-out"
                            >
                                <Image
                                    src={partner.logoPath}
                                    alt={partner.name}
                                    fill
                                    className="object-contain"
                                    sizes="112px"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
