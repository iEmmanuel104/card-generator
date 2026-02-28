// hooks/useCardGenerator.ts
import { useRef, useState, useCallback } from 'react';

export function useCardGenerator() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }, []);

    const generate = useCallback(
        async (renderFn: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => Promise<void>): Promise<string> => {
            const canvas = canvasRef.current;
            if (!canvas) throw new Error('Canvas not found');

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            setIsGenerating(true);
            try {
                await document.fonts.ready;
                await renderFn(canvas, ctx);
                return canvas.toDataURL('image/jpeg', 0.95);
            } finally {
                setIsGenerating(false);
            }
        },
        []
    );

    return { canvasRef, generate, isGenerating, loadImage };
}
