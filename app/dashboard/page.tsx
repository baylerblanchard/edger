"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, CheckCircle2, Leaf, Star, User as UserIcon, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReviewDialog } from "@/components/review-dialog";
import { PaymentModal } from "@/components/payment-modal";
import { ChatDialog } from "@/components/chat-dialog";
import { NotificationsMenu } from "@/components/notifications-menu";
import { CreditCard, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    const [payingRequestId, setPayingRequestId] = useState<number | null>(null);

    // Active tab and profile states
    const [activeTab, setActiveTab] = useState("requests");
    const [profileUser, setProfileUser] = useState<any>(null);
    const [profileUploading, setProfileUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatRequestId, setChatRequestId] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const handleChat = (requestId: number) => {
        setChatRequestId(requestId);
        setIsChatOpen(true);
    };

    const handlePay = async (request: Request) => {
        setPayingRequestId(request.id);
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

    const handlePaymentSuccess = async () => {
        if (!payingRequestId) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        try {
            const res = await fetch(`${apiUrl}/payments/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ service_request_id: payingRequestId })
            });

            if (res.ok) {
                setIsPaymentModalOpen(false);
                setClientSecret(null);
                setPayingRequestId(null);
                window.location.reload();
            } else {
                console.error("Failed to confirm payment on backend");
            }
        } catch (err) {
            console.error("Error confirming payment:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !profileUser) return;

        setProfileUploading(true);
        const token = localStorage.getItem("token");

        try {
            const formData = new FormData();
            formData.append("user[profile_picture]", selectedFile);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/users/${profileUser.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setProfileUser(updatedUser);
                setSelectedFile(null);
                setPreviewUrl(null);
                alert("Profile picture updated successfully!");
            } else {
                console.error("Upload failed");
                alert("Failed to upload image.");
            }
        } catch (error) {
            console.error("Error uploading", error);
        } finally {
            setProfileUploading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role === "provider") {
            router.push("/provider");
            return;
        }

        const decoded = parseJwt(token);
        if (!decoded?.user_id) {
            router.push("/login");
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        // Fetch service requests
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

        // Fetch user profile
        fetch(`${apiUrl}/users/${decoded.user_id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setProfileUser(data);
            })
            .catch(err => console.error("Failed to fetch profile user:", err));

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
                        <NotificationsMenu />
                        <Button size="sm" variant="ghost" onClick={() => setActiveTab("profile")}>
                            Profile
                        </Button>
                        <Link href="/request">
                            <Button size="sm">New Request</Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={handleLogout}>
                            Log out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-8 max-w-4xl mx-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="requests">My Requests</TabsTrigger>
                        <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="requests">
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
                                    <div className="text-center py-16 bg-white dark:bg-card rounded-lg border border-dashed">
                                        <h3 className="text-lg font-medium">No requests yet</h3>
                                        <p className="text-muted-foreground mb-4">Get started by booking your first service.</p>
                                        <Link href="/request">
                                            <Button>Book Now</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="profile" className="max-w-md mx-auto">
                        {profileUser ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Settings</CardTitle>
                                    <CardDescription>Manage your account details and public profile.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <Avatar className="h-24 w-24 border-2 border-primary/10">
                                            <AvatarImage src={previewUrl || profileUser.profile_picture_url} alt={profileUser.email} />
                                            <AvatarFallback className="text-2xl bg-primary/5">
                                                {profileUser.email?.[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="picture">Profile Picture</Label>
                                            <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" />
                                        </div>

                                        {selectedFile && (
                                            <Button onClick={handleUpload} disabled={profileUploading}>
                                                {profileUploading ? "Uploading..." : "Save New Picture"}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="grid gap-2">
                                            <Label>Email</Label>
                                            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span>{profileUser.email}</span>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Role</Label>
                                            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 text-muted-foreground capitalize">
                                                <UserIcon className="h-4 w-4" />
                                                <span>{profileUser.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="border-t p-4 flex justify-between items-center text-xs text-muted-foreground">
                                    <span>
                                        Member since {new Date(profileUser.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </Card>
                        ) : (
                            <div className="text-center py-10">Loading profile...</div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

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
