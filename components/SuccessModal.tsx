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
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-dakdo text-center mb-4">Registration Successful!</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <p className="text-center text-gray-600">Your social card is ready. Click the button below to download it.</p>
                    <div className="relative aspect-[900/1062] w-full overflow-hidden rounded-lg shadow-lg">
                        <img src={socialCardUrl} alt="Your Social Card" className="w-full h-full object-contain" />
                    </div>
                    <Button
                        onClick={handleDownload}
                        className="w-full h-12 text-lg font-poppins font-semibold bg-[#ff0000] hover:bg-[#cc0000] text-white"
                    >
                        Download Social Card
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
