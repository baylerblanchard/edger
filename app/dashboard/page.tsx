"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, CheckCircle2, Leaf, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReviewDialog } from "@/components/review-dialog";
import { PaymentModal } from "@/components/payment-modal";
import { ChatDialog } from "@/components/chat-dialog";
import { CreditCard, MessageCircle } from "lucide-react";

interface Request {
    id: number;
    service_type: string;
    address: string;
    scheduled_date: string;
    status: string;
    provider_id?: number;
    review?: {
        id: number;
        rating: number;
    };
    price?: string;
    payment_status?: 'pending' | 'paid';
}

// Helper to decode JWT to get user ID
const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export default function DashboardPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRequestId, setChatRequestId] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const handleChat = (requestId: number) => {
        setChatRequestId(requestId);
        setIsChatOpen(true);
    };

    const handlePay = async (request: Request) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        try {
            const res = await fetch(`${apiUrl}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ service_request_id: request.id })
            });

            if (res.ok) {
                const data = await res.json();
                setClientSecret(data.clientSecret);
                setIsPaymentModalOpen(true);
            } else {
                console.error("Failed to initiate payment");
            }
        } catch (err) {
            console.error("Error initiating payment:", err);
        }
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        setClientSecret(null);
        // Refresh requests to show paid status
        window.location.reload();
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const decoded = parseJwt(token);
        if (!decoded?.user_id) {
            router.push("/login");
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        fetch(`${apiUrl}/service_requests?user_id=${decoded.user_id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 401) {
                    router.push("/login");
                    return [];
                }
                return res.json();
            })
            .then((data) => {
                setRequests(data || []);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch requests:", err);
                setIsLoading(false);
            });

        // Set current user ID
        if (decoded?.user_id) setCurrentUserId(decoded.user_id);

    }, [router]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
            case 'accepted':
                return <Badge className="bg-blue-600 hover:bg-blue-700">Accepted</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background">
            <header className="bg-white dark:bg-card border-b sticky top-0 z-10">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <span>Edger</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/request">
                            <Button size="sm">New Request</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container py-8 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Requests</h1>

                {isLoading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {requests.length > 0 ? (
                            requests.map((req) => (
                                <Card key={req.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg capitalize flex items-center gap-2">
                                                    {req.service_type === 'mowing' ? <Leaf className="h-4 w-4 text-green-600" /> : null}
                                                    {req.service_type === 'mowing' ? 'Lawn Mowing' : req.service_type}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" /> {req.address}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold mb-1">${req.price || 45}</div>
                                                <div className="flex flex-col items-end gap-1">
                                                    {getStatusBadge(req.status)}
                                                    {req.payment_status === 'paid' && (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">Paid</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" /> {req.scheduled_date}
                                            </div>
                                            {req.status === 'accepted' && (
                                                <div className="flex items-center gap-1 text-blue-600">
                                                    <Clock className="h-4 w-4" /> Provider assigned
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-end gap-2 mt-4">
                                            {/* Chat Button (Visible for accepted/completed jobs) */}
                                            {(req.status === 'accepted' || req.status === 'completed') && (
                                                <Button size="sm" variant="secondary" onClick={() => handleChat(req.id)} className="gap-2">
                                                    <MessageCircle className="h-4 w-4" /> Message
                                                </Button>
                                            )}

                                            {/* Review Button */}
                                            {req.status === 'completed' && !req.review && (
                                                <ReviewDialog
                                                    serviceRequestId={req.id}
                                                    onReviewSubmitted={() => window.location.reload()}
                                                />
                                            )}
                                            {req.status === 'completed' && req.review && (
                                                <div className="mt-4 flex justify-end text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1 text-yellow-500">
                                                        <Star className="h-4 w-4 fill-yellow-500" /> {req.review.rating} Stars
                                                    </span>
                                                </div>
                                            )}
                                            {req.status === 'completed' && req.payment_status !== 'paid' && (
                                                <div className="mt-4 flex justify-end">
                                                    <Button onClick={() => handlePay(req)} className="gap-2">
                                                        <CreditCard className="h-4 w-4" /> Pay Now
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg border border-dashed">
                                <h3 className="text-lg font-medium">No requests yet</h3>
                                <p className="text-muted-foreground mb-4">Get started by booking your first service.</p>
                                <Link href="/request">
                                    <Button>Book Now</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )
                }
            </main >

            <PaymentModal
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
            />

            <ChatDialog
                open={isChatOpen}
                onOpenChange={setIsChatOpen}
                serviceRequestId={chatRequestId}
                currentUserId={currentUserId}
            />
        </div >
    );
}
