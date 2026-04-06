"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Download, ChevronLeft, ChevronRight, ArrowLeft, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Registration {
    _id: string;
    event: string;
    role: "attendee" | "speaker";
    name: string;
    email: string;
    phoneNumber: string;
    organization?: string;
    profilePhoto: string;
    socialCard: string;
    emailSent: boolean;
    createdAt: string;
    talkTitle?: string;
    bio?: string;
}

interface Stats {
    total: number;
    speakers: number;
    attendees: number;
    emailsSent: number;
}

interface ApiResponse {
    data: Registration[];
    total: number;
    page: number;
    totalPages: number;
    stats: Stats;
}

interface WaitlistEntry {
    _id: string;
    name: string;
    email: string;
    position: string;
    expectation: string;
    createdAt: string;
}

interface WaitlistStats {
    total: number;
    byPosition: Record<string, number>;
}

interface WaitlistApiResponse {
    data: WaitlistEntry[];
    total: number;
    page: number;
    totalPages: number;
    stats: WaitlistStats;
}

interface FeedbackEntry {
    _id: string;
    respondentType: 'woman' | 'ally';
    isAnonymous: boolean;
    name?: string;
    email?: string;
    organization?: string;
    belongingScore: number | null;
    fairTreatmentScore: number | null;
    supportScore: number | null;
    openFeedback?: string;
    createdAt: string;
}

interface FeedbackStats {
    total: number;
    womenCount: number;
    allyCount: number;
    anonymousCount: number;
    avgBelonging: number | null;
    avgFairTreatment: number | null;
    avgSupport: number | null;
}

interface FeedbackApiResponse {
    data: FeedbackEntry[];
    total: number;
    page: number;
    totalPages: number;
    stats: FeedbackStats;
}

const EVENT_TABS = [
    { slug: "", label: "All Events" },
    { slug: "through-her-lens", label: "THL Lagos" },
    { slug: "through-her-lens-joburg", label: "THL Johannesburg" },
    { slug: "this-is-lagos", label: "This Is Lagos" },
] as const;

const POSITION_OPTIONS = [
    "Developer",
    "Designer",
    "Founder / CEO",
    "Product Manager",
    "Content Creator",
    "Student",
    "Other",
];

const POSITION_COLORS: Record<string, string> = {
    "Developer": "bg-blue-50 text-blue-600",
    "Designer": "bg-purple-50 text-purple-600",
    "Founder / CEO": "bg-amber-50 text-amber-700",
    "Product Manager": "bg-green-50 text-green-600",
    "Content Creator": "bg-pink-50 text-pink-600",
    "Student": "bg-teal-50 text-teal-600",
    "Other": "bg-gray-100 text-gray-600",
};

export default function AdminPage() {
    const [adminView, setAdminView] = useState<"registrations" | "waitlist" | "insights">("registrations");

    // Registration state
    const [data, setData] = useState<Registration[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, speakers: 0, attendees: 0, emailsSent: 0 });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [activeEvent, setActiveEvent] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Waitlist state
    const [waitlistData, setWaitlistData] = useState<WaitlistEntry[]>([]);
    const [waitlistStats, setWaitlistStats] = useState<WaitlistStats>({ total: 0, byPosition: {} });
    const [waitlistPage, setWaitlistPage] = useState(1);
    const [waitlistTotalPages, setWaitlistTotalPages] = useState(1);
    const [waitlistTotal, setWaitlistTotal] = useState(0);
    const [waitlistPosition, setWaitlistPosition] = useState("");
    const [waitlistSearchInput, setWaitlistSearchInput] = useState("");
    const [waitlistSearchQuery, setWaitlistSearchQuery] = useState("");
    const [waitlistLoading, setWaitlistLoading] = useState(true);

    // Insights (feedback) state
    const [feedbackData, setFeedbackData] = useState<FeedbackEntry[]>([]);
    const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({ total: 0, womenCount: 0, allyCount: 0, anonymousCount: 0, avgBelonging: null, avgFairTreatment: null, avgSupport: null });
    const [feedbackPage, setFeedbackPage] = useState(1);
    const [feedbackTotalPages, setFeedbackTotalPages] = useState(1);
    const [feedbackTotal, setFeedbackTotal] = useState(0);
    const [feedbackLoading, setFeedbackLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);

    // Detail modal state
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState<WaitlistEntry | null>(null);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const waitlistDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Registration search debounce
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setSearchQuery(searchInput);
            setPage(1);
        }, 300);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchInput]);

    // Waitlist search debounce
    useEffect(() => {
        if (waitlistDebounceTimer.current) clearTimeout(waitlistDebounceTimer.current);
        waitlistDebounceTimer.current = setTimeout(() => {
            setWaitlistSearchQuery(waitlistSearchInput);
            setWaitlistPage(1);
        }, 300);
        return () => {
            if (waitlistDebounceTimer.current) clearTimeout(waitlistDebounceTimer.current);
        };
    }, [waitlistSearchInput]);

    // Fetch registrations
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeEvent) params.set("event", activeEvent);
            if (roleFilter) params.set("role", roleFilter);
            if (searchQuery) params.set("search", searchQuery);
            params.set("page", String(page));
            params.set("limit", "20");

            const res = await fetch(`/api/registrations?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");

            const json: ApiResponse = await res.json();
            setData(json.data);
            setStats(json.stats);
            setTotal(json.total);
            setTotalPages(json.totalPages);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [activeEvent, roleFilter, searchQuery, page]);

    // Fetch waitlist
    const fetchWaitlist = useCallback(async () => {
        setWaitlistLoading(true);
        try {
            const params = new URLSearchParams();
            if (waitlistPosition) params.set("position", waitlistPosition);
            if (waitlistSearchQuery) params.set("search", waitlistSearchQuery);
            params.set("page", String(waitlistPage));
            params.set("limit", "20");

            const res = await fetch(`/api/waitlist?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");

            const json: WaitlistApiResponse = await res.json();
            setWaitlistData(json.data);
            setWaitlistStats(json.stats);
            setWaitlistTotal(json.total);
            setWaitlistTotalPages(json.totalPages);
        } catch (error) {
            console.error("Error fetching waitlist:", error);
        } finally {
            setWaitlistLoading(false);
        }
    }, [waitlistPosition, waitlistSearchQuery, waitlistPage]);

    useEffect(() => {
        if (adminView === "registrations") fetchData();
    }, [fetchData, adminView]);

    // Fetch feedback (insights)
    const fetchFeedback = useCallback(async () => {
        setFeedbackLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", String(feedbackPage));
            params.set("limit", "20");
            const res = await fetch(`/api/feedback?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const json: FeedbackApiResponse = await res.json();
            setFeedbackData(json.data);
            setFeedbackStats(json.stats);
            setFeedbackTotal(json.total);
            setFeedbackTotalPages(json.totalPages);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setFeedbackLoading(false);
        }
    }, [feedbackPage]);

    useEffect(() => {
        if (adminView === "waitlist") fetchWaitlist();
    }, [fetchWaitlist, adminView]);

    useEffect(() => {
        if (adminView === "insights") fetchFeedback();
    }, [fetchFeedback, adminView]);

    const handleFeedbackExport = () => {
        window.open("/api/feedback/export", "_blank");
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (activeEvent) params.set("event", activeEvent);
        if (roleFilter) params.set("role", roleFilter);
        if (searchQuery) params.set("search", searchQuery);
        window.open(`/api/registrations/export?${params.toString()}`, "_blank");
    };

    const handleWaitlistExport = () => {
        const params = new URLSearchParams();
        if (waitlistPosition) params.set("position", waitlistPosition);
        if (waitlistSearchQuery) params.set("search", waitlistSearchQuery);
        window.open(`/api/waitlist/export?${params.toString()}`, "_blank");
    };

    const handleEventTab = (slug: string) => {
        setActiveEvent(slug);
        setPage(1);
    };

    const handleRoleChange = (value: string) => {
        setRoleFilter(value);
        setPage(1);
    };

    const handleWaitlistPositionChange = (value: string) => {
        setWaitlistPosition(value);
        setWaitlistPage(1);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatEventName = (slug: string) => {
        switch (slug) {
            case "this-is-lagos": return "This Is Lagos";
            case "through-her-lens": return "THL Lagos";
            case "through-her-lens-joburg": return "THL Johannesburg";
            default: return slug;
        }
    };

    const handleCardDownload = async (socialCardUrl: string, name: string) => {
        try {
            const response = await fetch(socialCardUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${name.replace(/\s+/g, "-").toLowerCase()}-social-card.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const topPositions = Object.entries(waitlistStats.byPosition)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-poppins">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/images/logo.png" alt="BLK@ Logo" width={80} height={40} className="h-auto" />
                        <span className="text-gray-400 text-sm font-inter">/ Admin</span>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors font-inter"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to site
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Primary View Toggle */}
                <div className="flex items-center gap-1 mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setAdminView("registrations")}
                        className={`px-5 py-3 text-sm font-semibold font-inter whitespace-nowrap transition-colors border-b-2 -mb-px ${
                            adminView === "registrations"
                                ? "border-[#dc2626] text-[#dc2626]"
                                : "border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-300"
                        }`}
                    >
                        Registrations
                    </button>
                    <button
                        onClick={() => setAdminView("waitlist")}
                        className={`px-5 py-3 text-sm font-semibold font-inter whitespace-nowrap transition-colors border-b-2 -mb-px ${
                            adminView === "waitlist"
                                ? "border-[#dc2626] text-[#dc2626]"
                                : "border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-300"
                        }`}
                    >
                        Waitlist
                    </button>
                    <button
                        onClick={() => setAdminView("insights")}
                        className={`px-5 py-3 text-sm font-semibold font-inter whitespace-nowrap transition-colors border-b-2 -mb-px ${
                            adminView === "insights"
                                ? "border-[#dc2626] text-[#dc2626]"
                                : "border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-300"
                        }`}
                    >
                        Insights
                    </button>
                </div>

                {adminView === "registrations" ? (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{stats.total}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Total Registrations</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{stats.speakers}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Speakers</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{stats.attendees}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Attendees</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{stats.emailsSent}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Emails Sent</p>
                            </div>
                        </div>

                        {/* Event Tabs */}
                        <div className="flex items-center gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
                            {EVENT_TABS.map((tab) => (
                                <button
                                    key={tab.slug}
                                    onClick={() => handleEventTab(tab.slug)}
                                    className={`px-4 py-3 text-sm font-medium font-inter whitespace-nowrap transition-colors border-b-2 -mb-px ${
                                        activeEvent === tab.slug
                                            ? "border-[#dc2626] text-[#dc2626]"
                                            : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                            <select
                                value={roleFilter}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                            >
                                <option value="">All Roles</option>
                                <option value="attendee">Attendee</option>
                                <option value="speaker">Speaker</option>
                            </select>

                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-gray-400 font-inter focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                                />
                            </div>

                            <button
                                onClick={handleExport}
                                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg px-4 py-2 text-sm font-medium font-inter flex items-center justify-center gap-2 transition-colors shrink-0"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>

                        {/* Data Table */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-20 border border-gray-200 rounded-xl bg-gray-50">
                                <p className="text-gray-400 text-lg font-inter">No registrations found</p>
                                <p className="text-gray-400 text-sm mt-2 font-inter">
                                    Try adjusting your filters or search query.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                    <table className="w-full min-w-[800px] font-inter">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Name
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Email
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Phone
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Organization
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Role
                                                </th>
                                                {!activeEvent && (
                                                    <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                        Event
                                                    </th>
                                                )}
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Email Sent
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Date
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((registration, index) => (
                                                <tr
                                                    key={registration._id}
                                                    className={`border-b border-gray-100 ${
                                                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                                    } hover:bg-gray-50 transition-colors`}
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                        {registration.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {registration.email}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {registration.phoneNumber}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-400">
                                                        {registration.organization || "\u2014"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                                                registration.role === "speaker"
                                                                    ? "bg-[#dc2626]/10 text-[#dc2626]"
                                                                    : "bg-blue-50 text-blue-600"
                                                            }`}
                                                        >
                                                            {registration.role}
                                                        </span>
                                                    </td>
                                                    {!activeEvent && (
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {formatEventName(registration.event)}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`w-2 h-2 rounded-full inline-block ${
                                                                registration.emailSent ? "bg-green-500" : "bg-red-400"
                                                            }`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-400">
                                                        {formatDate(registration.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => setSelectedRegistration(registration)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#dc2626] hover:bg-red-50 transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-gray-500 font-inter">
                                        Showing {(page - 1) * 20 + 1}
                                        {"\u2013"}
                                        {Math.min(page * 20, total)} of {total} results
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1 font-inter"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Prev
                                        </button>
                                        <span className="text-sm text-gray-500 px-2 font-inter">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1 font-inter"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                ) : adminView === "insights" ? (
                    /* ── Insights (Workplace Feedback) ── */
                    <>
                        {/* Insights Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{feedbackStats.total}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Total Responses</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{feedbackStats.womenCount}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Women</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{feedbackStats.allyCount}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Allies</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{feedbackStats.anonymousCount}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Anonymous</p>
                            </div>
                        </div>

                        {/* Average Score Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            {[
                                { label: 'Avg Belonging (Q1)', value: feedbackStats.avgBelonging },
                                { label: 'Avg Fair Treatment (Q2)', value: feedbackStats.avgFairTreatment },
                                { label: 'Avg Support (Q3)', value: feedbackStats.avgSupport },
                            ].map((item) => (
                                <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                    <p className="text-2xl font-bold text-[#dc2626] font-inter">
                                        {item.value !== null ? item.value.toFixed(1) : '—'}
                                        {item.value !== null && <span className="text-sm text-gray-400 font-normal"> / 5</span>}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1 font-inter">{item.label}</p>
                                    {item.value !== null && (
                                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#dc2626] rounded-full transition-all"
                                                style={{ width: `${(item.value / 5) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Export bar */}
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={handleFeedbackExport}
                                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg px-4 py-2 text-sm font-medium font-inter flex items-center gap-2 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Insights CSV
                            </button>
                        </div>

                        {/* Feedback Table */}
                        {feedbackLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : feedbackData.length === 0 ? (
                            <div className="text-center py-20 border border-gray-200 rounded-xl bg-gray-50">
                                <p className="text-gray-400 text-lg font-inter">No feedback responses yet</p>
                                <p className="text-gray-400 text-sm mt-2 font-inter">
                                    Responses will appear here once people complete the feedback form.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                    <table className="w-full min-w-[800px] font-inter">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Date</th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Type</th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Anon?</th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Name</th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Organization</th>
                                                <th className="text-center text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Q1</th>
                                                <th className="text-center text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Q2</th>
                                                <th className="text-center text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Q3</th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Story</th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feedbackData.map((entry, index) => (
                                                <tr
                                                    key={entry._id}
                                                    className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-gray-50 transition-colors`}
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-400">{formatDate(entry.createdAt)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${entry.respondentType === 'woman' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {entry.respondentType}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`w-2 h-2 rounded-full inline-block ${entry.isAnonymous ? 'bg-gray-400' : 'bg-green-500'}`} />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                        {entry.isAnonymous ? <span className="text-gray-400 italic">Anonymous</span> : entry.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{entry.organization || '—'}</td>
                                                    {[entry.belongingScore, entry.fairTreatmentScore, entry.supportScore].map((score, si) => (
                                                        <td key={si} className="px-4 py-3 text-center">
                                                            {score === null ? (
                                                                <span className="text-gray-300 text-sm">—</span>
                                                            ) : (
                                                                <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center mx-auto ${score <= 2 ? 'bg-red-400' : score === 3 ? 'bg-amber-400' : 'bg-green-500'}`}>
                                                                    {score}
                                                                </span>
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs ${entry.openFeedback ? 'text-[#dc2626]' : 'text-gray-300'}`}>
                                                            {entry.openFeedback ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => setSelectedFeedback(entry)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#dc2626] hover:bg-red-50 transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Feedback Pagination */}
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-gray-500 font-inter">
                                        Showing {(feedbackPage - 1) * 20 + 1}{"\u2013"}{Math.min(feedbackPage * 20, feedbackTotal)} of {feedbackTotal} results
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setFeedbackPage((p) => Math.max(1, p - 1))}
                                            disabled={feedbackPage <= 1}
                                            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1 font-inter"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Prev
                                        </button>
                                        <span className="text-sm text-gray-500 px-2 font-inter">
                                            Page {feedbackPage} of {feedbackTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setFeedbackPage((p) => Math.min(feedbackTotalPages, p + 1))}
                                            disabled={feedbackPage >= feedbackTotalPages}
                                            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1 font-inter"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* Waitlist Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <p className="text-3xl font-bold text-[#dc2626] font-inter">{waitlistStats.total}</p>
                                <p className="text-gray-500 text-sm mt-1 font-inter">Total Signups</p>
                            </div>
                            {topPositions.map(([position, count]) => (
                                <div key={position} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                    <p className="text-3xl font-bold text-[#dc2626] font-inter">{count}</p>
                                    <p className="text-gray-500 text-sm mt-1 font-inter truncate">{position}</p>
                                </div>
                            ))}
                        </div>

                        {/* Waitlist Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                            <select
                                value={waitlistPosition}
                                onChange={(e) => handleWaitlistPositionChange(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm font-inter focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                            >
                                <option value="">All Positions</option>
                                {POSITION_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>

                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={waitlistSearchInput}
                                    onChange={(e) => setWaitlistSearchInput(e.target.value)}
                                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-gray-400 font-inter focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
                                />
                            </div>

                            <button
                                onClick={handleWaitlistExport}
                                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg px-4 py-2 text-sm font-medium font-inter flex items-center justify-center gap-2 transition-colors shrink-0"
                            >
                                <Download className="w-4 h-4" />
                                Export Waitlist CSV
                            </button>
                        </div>

                        {/* Waitlist Table */}
                        {waitlistLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : waitlistData.length === 0 ? (
                            <div className="text-center py-20 border border-gray-200 rounded-xl bg-gray-50">
                                <p className="text-gray-400 text-lg font-inter">No waitlist entries found</p>
                                <p className="text-gray-400 text-sm mt-2 font-inter">
                                    Try adjusting your filters or search query.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                    <table className="w-full min-w-[700px] font-inter">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Name
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Email
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Position
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Expectation
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Date
                                                </th>
                                                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {waitlistData.map((entry, index) => (
                                                <tr
                                                    key={entry._id}
                                                    className={`border-b border-gray-100 ${
                                                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                                    } hover:bg-gray-50 transition-colors`}
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                        {entry.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {entry.email}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                POSITION_COLORS[entry.position] || POSITION_COLORS["Other"]
                                                            }`}
                                                        >
                                                            {entry.position}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[250px] truncate">
                                                        {entry.expectation}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-400">
                                                        {formatDate(entry.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => setSelectedWaitlistEntry(entry)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#dc2626] hover:bg-red-50 transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Waitlist Pagination */}
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-gray-500 font-inter">
                                        Showing {(waitlistPage - 1) * 20 + 1}
                                        {"\u2013"}
                                        {Math.min(waitlistPage * 20, waitlistTotal)} of {waitlistTotal} results
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setWaitlistPage((p) => Math.max(1, p - 1))}
                                            disabled={waitlistPage <= 1}
                                            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1 font-inter"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Prev
                                        </button>
                                        <span className="text-sm text-gray-500 px-2 font-inter">
                                            Page {waitlistPage} of {waitlistTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setWaitlistPage((p) => Math.min(waitlistTotalPages, p + 1))}
                                            disabled={waitlistPage >= waitlistTotalPages}
                                            className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1 font-inter"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>

            {/* Registration Detail Modal */}
            <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
                <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
                    {selectedRegistration && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-4">
                                    {selectedRegistration.profilePhoto ? (
                                        <img
                                            src={selectedRegistration.profilePhoto}
                                            alt={selectedRegistration.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold font-inter">
                                            {selectedRegistration.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <DialogTitle className="text-xl font-bold text-gray-900 font-inter">
                                            {selectedRegistration.name}
                                        </DialogTitle>
                                        <DialogDescription className="flex items-center gap-2 mt-1">
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                                    selectedRegistration.role === "speaker"
                                                        ? "bg-[#dc2626]/10 text-[#dc2626]"
                                                        : "bg-blue-50 text-blue-600"
                                                }`}
                                            >
                                                {selectedRegistration.role}
                                            </span>
                                            <span className="text-sm text-gray-500 font-inter">
                                                {formatEventName(selectedRegistration.event)}
                                            </span>
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-5 mt-4">
                                {/* Contact Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Email</p>
                                        <p className="text-sm text-gray-900 font-inter">{selectedRegistration.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Phone</p>
                                        <p className="text-sm text-gray-900 font-inter">{selectedRegistration.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Organization</p>
                                        <p className="text-sm text-gray-900 font-inter">{selectedRegistration.organization || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Registered</p>
                                        <p className="text-sm text-gray-900 font-inter">{formatDate(selectedRegistration.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Speaker Info */}
                                {selectedRegistration.role === "speaker" && (
                                    <div className="border-t border-gray-100 pt-4 space-y-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Panel Topic</p>
                                            <p className="text-sm text-gray-900 font-inter">{selectedRegistration.talkTitle || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Bio</p>
                                            <p className="text-sm text-gray-700 font-inter whitespace-pre-wrap">{selectedRegistration.bio || "—"}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Email Status */}
                                <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            selectedRegistration.emailSent ? "bg-green-500" : "bg-red-400"
                                        }`}
                                    />
                                    <span className="text-sm text-gray-500 font-inter">
                                        {selectedRegistration.emailSent ? "Confirmation email sent" : "Email not sent"}
                                    </span>
                                </div>

                                {/* Social Card */}
                                {selectedRegistration.socialCard && (
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-3">Social Card</p>
                                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                            <img
                                                src={selectedRegistration.socialCard}
                                                alt={`${selectedRegistration.name}'s social card`}
                                                className="w-full h-auto"
                                                loading="lazy"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleCardDownload(selectedRegistration.socialCard, selectedRegistration.name)}
                                            className="mt-3 w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg px-4 py-2.5 text-sm font-medium font-inter flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Social Card
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Feedback Detail Modal */}
            <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
                <DialogContent className="w-[90vw] max-w-lg max-h-[90vh] overflow-y-auto bg-white border-gray-200">
                    {selectedFeedback && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 text-lg font-bold font-inter">
                                        {selectedFeedback.isAnonymous ? '?' : (selectedFeedback.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-bold text-gray-900 font-inter">
                                            {selectedFeedback.isAnonymous ? 'Anonymous Respondent' : (selectedFeedback.name || 'Unknown')}
                                        </DialogTitle>
                                        <DialogDescription className="flex items-center gap-2 mt-1">
                                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${selectedFeedback.respondentType === 'woman' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {selectedFeedback.respondentType}
                                            </span>
                                            <span className="text-sm text-gray-500 font-inter">{formatDate(selectedFeedback.createdAt)}</span>
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                {!selectedFeedback.isAnonymous && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedFeedback.email && (
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Email</p>
                                                <p className="text-sm text-gray-900 font-inter">{selectedFeedback.email}</p>
                                            </div>
                                        )}
                                        {selectedFeedback.organization && (
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Organization</p>
                                                <p className="text-sm text-gray-900 font-inter">{selectedFeedback.organization}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-3">Scores</p>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Belonging (Q1)', value: selectedFeedback.belongingScore },
                                            { label: 'Fair Treatment (Q2)', value: selectedFeedback.fairTreatmentScore },
                                            { label: 'Support (Q3)', value: selectedFeedback.supportScore },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 font-inter">{item.label}</span>
                                                {item.value === null ? (
                                                    <span className="text-xs text-gray-400 font-inter italic">Prefer not to share</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${item.value <= 2 ? 'bg-red-400' : item.value === 3 ? 'bg-amber-400' : 'bg-green-500'}`}
                                                                style={{ width: `${(item.value / 5) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900 font-inter w-6 text-right">{item.value}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {selectedFeedback.openFeedback && (
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-2">Their Story</p>
                                        <p className="text-sm text-gray-700 font-inter whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">
                                            {selectedFeedback.openFeedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Waitlist Detail Modal */}
            <Dialog open={!!selectedWaitlistEntry} onOpenChange={() => setSelectedWaitlistEntry(null)}>
                <DialogContent className="w-[90vw] max-w-lg max-h-[90vh] overflow-y-auto bg-white border-gray-200">
                    {selectedWaitlistEntry && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold font-inter">
                                        {selectedWaitlistEntry.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-bold text-gray-900 font-inter">
                                            {selectedWaitlistEntry.name}
                                        </DialogTitle>
                                        <DialogDescription>
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${
                                                    POSITION_COLORS[selectedWaitlistEntry.position] || POSITION_COLORS["Other"]
                                                }`}
                                            >
                                                {selectedWaitlistEntry.position}
                                            </span>
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Email</p>
                                    <p className="text-sm text-gray-900 font-inter">{selectedWaitlistEntry.email}</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Expectation</p>
                                    <p className="text-sm text-gray-700 font-inter whitespace-pre-wrap">{selectedWaitlistEntry.expectation}</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-inter mb-1">Signed Up</p>
                                    <p className="text-sm text-gray-900 font-inter">{formatDate(selectedWaitlistEntry.createdAt)}</p>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
