"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";

import { useRouter } from "next/navigation";

interface Job {
    id: number;
    service_type: string;
    address: string;
    scheduled_date: string;
    status: string;
}

export default function ProviderDashboard() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("http://localhost:3001/service_requests", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 401) {
                    router.push("/login"); // Token expired or invalid
                    return [];
                }
                return res.json();
            })
            .then((data) => setJobs(data || []))
            .catch((err) => console.error("Failed to fetch jobs:", err));
    }, [router]);

    const acceptJob = async (jobId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`http://localhost:3001/service_requests/${jobId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    service_request: { status: "accepted" }
                })
            });

            if (res.ok) {
                // Remove the job from the list or mark as accepted locally
                setJobs(prev => prev.map(job =>
                    job.id === jobId ? { ...job, status: "accepted" } : job
                ));
            } else {
                console.error("Failed to accept job");
            }
        } catch (err) {
            console.error("Error accepting job:", err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background">
            <header className="bg-white dark:bg-card border-b sticky top-0 z-10">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <span>Edger</span> <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pro</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Earnings: $1,240.50</span>
                        <Button size="sm" variant="outline">
                            Profile
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-8 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Nearby Jobs</h1>
                    <Button variant="ghost" size="sm" className="hidden">Filter</Button>
                </div>

                <div className="space-y-4">
                    {jobs.map((job: any) => (
                        <Card key={job.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg capitalize">
                                            {job.service_type === 'mowing' ? 'Lawn Mowing' : job.service_type}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {job.address}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                            $45
                                        </span>
                                        <p className="text-xs text-muted-foreground">1.2 mi</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Calendar className="h-4 w-4" /> {job.scheduled_date}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant={job.status === 'accepted' ? 'default' : 'secondary'} className="font-normal capitalize">
                                        {job.status}
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 bg-slate-50 dark:bg-slate-900/50">
                                {job.status === 'accepted' ? (
                                    <Button className="w-full" disabled>Accepted</Button>
                                ) : (
                                    <Button className="w-full" onClick={() => acceptJob(job.id)}>Accept Job</Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                    {jobs.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No jobs available right now.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
