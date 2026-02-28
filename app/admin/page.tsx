"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Download, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

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

const EVENT_TABS = [
    { slug: "", label: "All Events" },
    { slug: "through-her-lens", label: "Through Her Lens" },
    { slug: "this-is-lagos", label: "This Is Lagos" },
] as const;

export default function AdminPage() {
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

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExport = () => {
        const params = new URLSearchParams();
        if (activeEvent) params.set("event", activeEvent);
        if (roleFilter) params.set("role", roleFilter);
        if (searchQuery) params.set("search", searchQuery);
        window.open(`/api/registrations/export?${params.toString()}`, "_blank");
    };

    const handleEventTab = (slug: string) => {
        setActiveEvent(slug);
        setPage(1);
    };

    const handleRoleChange = (value: string) => {
        setRoleFilter(value);
        setPage(1);
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
            case "through-her-lens": return "Through Her Lens";
            default: return slug;
        }
    };

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
            </main>
        </div>
    );
}
