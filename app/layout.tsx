import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Poppins, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

const dakdo = localFont({
    src: [
        {
            path: "./fonts/dakdo.regular.otf",
            weight: "600",
            style: "normal",
        },
    ],
    variable: "--font-dakdo",
});

const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

// Google Fonts
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const poppins = Poppins({
    weight: ["100", "200", "300", "400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-poppins",
});

const playfair = Playfair_Display({
    weight: ["400", "600", "700"],
    subsets: ["latin"],
    style: ["normal", "italic"],
    variable: "--font-playfair",
});

export const metadata: Metadata = {
    title: "BLK@ Events",
    description: "Register for upcoming BLK@ events",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${dakdo.variable} ${inter.variable} ${poppins.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} font-inter antialiased`}
            >
                {children}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 5000,
                        loading: {
                            duration: Infinity,
                        },
                        success: {
                            duration: 3000,
                        },
                        error: {
                            duration: 4000,
                        },
                        style: {
                            maxWidth: "500px",
                        },
                    }}
                />
            </body>
        </html>
    );
}
