"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, User, Briefcase, CheckCircle, DollarSign, Activity } from "lucide-react";
import { StatsCard } from "@/components/stats-card";

interface DashboardStats {
    total_users: number;
    total_providers: number;
    total_homeowners: number;
    total_requests: number;
    active_requests: number;
    completed_requests: number;
    total_revenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:3001/admin/stats", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else {
                    if (res.status === 401 || res.status === 403) {
                        // double check auth failure
                    }
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (!stats) {
        return <div>Failed to load stats.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of platform performance and metrics.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    description="All registered accounts"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.total_revenue.toFixed(2)}`}
                    icon={DollarSign}
                    description="Total value of completed jobs"
                />
                <StatsCard
                    title="Active Requests"
                    value={stats.active_requests}
                    icon={Activity}
                    description="Jobs currently in progress or pending"
                />
                <StatsCard
                    title="Completed Requests"
                    value={stats.completed_requests}
                    icon={CheckCircle}
                    description="Successfully completed jobs"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Homeowners"
                    value={stats.total_homeowners}
                    icon={User}
                />
                <StatsCard
                    title="Providers"
                    value={stats.total_providers}
                    icon={Briefcase}
                />
                <StatsCard
                    title="Total Requests"
                    value={stats.total_requests}
                    icon={FileText}
                    description="All time requests"
                />
            </div>
        </div>
    );
}

import { FileText } from "lucide-react";
