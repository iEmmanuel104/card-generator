// components/SuccessModal.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    socialCardUrl: string;
}

export function SuccessModal({ isOpen, onClose, socialCardUrl }: SuccessModalProps) {
    const handleDownload = async () => {
        try {
            const response = await fetch(socialCardUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "this-is-lagos-social-card.jpg";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            // toast.error("Failed to download social card. Please try again.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl font-dakdo text-center mb-2 md:mb-4">Registration Successful!</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 md:space-y-6">
                    <p className="text-sm md:text-base text-center text-gray-600">
                        Your social card is ready. Click the button below to download it.
                    </p>
                    <div className="relative aspect-[900/1062] w-full overflow-hidden rounded-lg shadow-lg">
                        <img src={socialCardUrl} alt="Your Social Card" className="w-full h-full object-contain bg-white" loading="lazy" />
                    </div>
                    <div className="pt-2 md:pt-4">
                        <Button
                            onClick={handleDownload}
                            className="w-full h-10 md:h-12 text-base md:text-lg font-poppins font-semibold bg-[#ff0000] hover:bg-[#cc0000] text-white"
                        >
                            Download Social Card
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
