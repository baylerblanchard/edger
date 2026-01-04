"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, CheckCircle2, Briefcase, Star, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatDialog } from "@/components/chat-dialog";

import { useRouter } from "next/navigation";

interface Job {
    id: number;
    service_type: string;
    address: string;
    scheduled_date: string;
    status: string;
    provider_id?: number;
    price?: string; // Optional if we add it later
}

// Helper to decode JWT to get user ID
const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export default function ProviderDashboard() {
    const router = useRouter();
    const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
    const [myJobs, setMyJobs] = useState<Job[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [earnings, setEarnings] = useState<number>(0);

    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRequestId, setChatRequestId] = useState<number | null>(null);

    const handleChat = (requestId: number) => {
        setChatRequestId(requestId);
        setIsChatOpen(true);
    };

    const fetchJobs = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const decoded = parseJwt(token);
        if (decoded?.user_id) {
            setUserId(decoded.user_id);
            setUserId(decoded.user_id);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            // Fetch user profile for rating and reviews
            fetch(`${apiUrl}/users/${decoded.user_id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.average_rating) setRating(data.average_rating);
                    if (data.total_earnings) setEarnings(data.total_earnings);
                    if (data.provided_reviews) setReviews(data.provided_reviews);
                });
        }

        try {
            // Fetch Available Jobs (pending)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const availableRes = await fetch(`${apiUrl}/service_requests?status=pending`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (availableRes.ok) {
                setAvailableJobs(await availableRes.json());
            }

            // Fetch My Jobs (where provider_id = me)
            // Note: We need the user ID from the token for this query
            if (decoded?.user_id) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const myJobsRes = await fetch(`${apiUrl}/service_requests?provider_id=${decoded.user_id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (myJobsRes.ok) {
                    setMyJobs(await myJobsRes.json());
                }
            }

        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const acceptJob = async (jobId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/service_requests/${jobId}`, {
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
                // Refresh lists
                fetchJobs();
            } else {
                console.error("Failed to accept job");
            }
        } catch (err) {
            console.error("Error accepting job:", err);
        }
    };

    const completeJob = async (jobId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/service_requests/${jobId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    service_request: { status: "completed" }
                })
            });

            if (res.ok) {
                fetchJobs();
            }
        } catch (err) {
            console.error("Error completing job:", err);
        }
    };



    interface JobCardProps {
        job: Job;
        isMyJob: boolean;
        onAccept: (id: number) => void;
        onComplete: (id: number) => void;
        onChat: (id: number) => void;
    }

    const JobCard = ({ job, isMyJob, onAccept, onComplete, onChat }: JobCardProps) => (
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
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
                                ${job.price || '45.00'}
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
                        <Badge variant={job.status === 'accepted' ? 'default' : (job.status === 'completed' ? 'secondary' : 'outline')} className={cn("font-normal capitalize", job.status === 'completed' && "bg-green-100 text-green-800 hover:bg-green-100")}>
                            {job.status}
                        </Badge>
                    </div>
                </CardContent>
                <CardFooter className="pt-2 bg-slate-50 dark:bg-slate-900/50">
                    {isMyJob ? (
                        job.status === 'completed' ? (
                            <Button className="w-full" variant="outline" disabled>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                            </Button>
                        ) : (
                            <div className="flex gap-2 w-full">
                                <Button className="flex-1" variant="default" onClick={() => onComplete(job.id)}>
                                    Mark Complete
                                </Button>
                                <Button variant="secondary" size="icon" onClick={() => onChat(job.id)}>
                                    <MessageCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        )
                    ) : (
                        <Button className="w-full" onClick={() => onAccept(job.id)}>Accept Job</Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background">
            <header className="bg-white dark:bg-card border-b sticky top-0 z-10">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <span>Edger</span> <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pro</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-medium text-muted-foreground">My Earnings: ${earnings.toFixed(2)}</div>
                            {rating > 0 && (
                                <div className="text-xs font-bold text-yellow-500 flex items-center justify-end gap-1">
                                    <Star className="h-3 w-3 fill-yellow-500" /> {rating} Rating
                                </div>
                            )}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/profile">
                                Profile
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-8 max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>

                <Tabs defaultValue="available" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="available" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Available Jobs
                        </TabsTrigger>
                        <TabsTrigger value="schedule" className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> My Schedule
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="flex items-center gap-2">
                            <Star className="h-4 w-4" /> Reviews
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="available" className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-48 w-full rounded-xl" />
                            </div>
                        ) : availableJobs.length > 0 ? (
                            <AnimatePresence>
                                {availableJobs.map((job, index) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <JobCard
                                            job={job}
                                            isMyJob={false}
                                            onAccept={acceptJob}
                                            onComplete={completeJob}
                                            onChat={handleChat}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>No new jobs available in your area.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-48 w-full rounded-xl" />
                            </div>
                        ) : myJobs.length > 0 ? (
                            <AnimatePresence>
                                {myJobs.map((job, index) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <JobCard
                                            job={job}
                                            isMyJob={true}
                                            onAccept={acceptJob}
                                            onComplete={completeJob}
                                            onChat={handleChat}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>You haven't accepted any jobs yet.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        ) : reviews.length > 0 ? (
                            <AnimatePresence>
                                {reviews.map((review, index) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-primary/10 p-2 rounded-full">
                                                            <Briefcase className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{review.reviewer?.email || "Homeowner"}</p>
                                                            <div className="flex items-center gap-1">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={cn(
                                                                            "h-3 w-3",
                                                                            i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">"{review.comment}"</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>No reviews yet. Complete jobs to earn reviews!</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <ChatDialog
                open={isChatOpen}
                onOpenChange={setIsChatOpen}
                serviceRequestId={chatRequestId}
                currentUserId={userId}
            />
        </div >
    );
}
