"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowLeft, Upload, User as UserIcon, Mail } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchUser = async () => {
            try {
                // Get user ID from token
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.user_id;

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const res = await fetch(`${apiUrl}/users/${userId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) return;

        setUploading(true);
        const token = localStorage.getItem("token");

        try {
            const formData = new FormData();
            formData.append("user[profile_picture]", selectedFile);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/users/${user.id}`, {
                method: "PUT", // or PATCH
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Note: Content-Type header is explicitly NOT set so browser sets the boundary for FormData
                },
                body: formData
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setSelectedFile(null);
                setPreviewUrl(null);
                // Force reload or just update state
                alert("Profile picture updated successfully!");
            } else {
                console.error("Upload failed");
                alert("Failed to upload image.");
            }
        } catch (error) {
            console.error("Error uploading", error);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!user) return <div className="p-8 text-center">User not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background p-4 md:p-8">
            <div className="max-w-md mx-auto">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" asChild>
                    <Link href="/provider" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Manage your account details and public profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="h-24 w-24 border-2 border-primary/10">
                                <AvatarImage src={previewUrl || user.profile_picture_url} alt={user.email} />
                                <AvatarFallback className="text-2xl bg-primary/5">
                                    {user.email?.[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="picture">Profile Picture</Label>
                                <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" />
                            </div>

                            {selectedFile && (
                                <Button onClick={handleUpload} disabled={uploading}>
                                    {uploading ? "Uploading..." : "Save New Picture"}
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 text-muted-foreground capitalize">
                                    <UserIcon className="h-4 w-4" />
                                    <span>{user.role}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between border-t pt-4">
                        <p className="text-xs text-muted-foreground">
                            Member since {new Date(user.created_at).toLocaleDateString()}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
