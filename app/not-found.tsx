import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-dakdo font-bold text-gray-900">404</h1>
                <p className="text-lg font-inter text-gray-600">Page not found</p>
                <Link
                    href="/"
                    className="inline-block mt-4 px-6 py-3 bg-[#ff0000] text-white font-poppins font-semibold rounded-lg hover:bg-[#cc0000] transition-colors"
                >
                    Back to Events
                </Link>
            </div>
        </div>
    );
}
