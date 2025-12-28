"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "", role: "homeowner" });
    const [error, setError] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({ email: data.username }));

                // Redirect based on role
                if (formData.role === "provider") {
                    router.push("/provider");
                } else {
                    router.push("/request");
                }
            } else {
                const errData = await res.json();
                setError(errData.errors ? errData.errors.join(", ") : "Signup failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Leaf className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>Enter your email below to create your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label>I am a...</Label>
                            <RadioGroup
                                defaultValue="homeowner"
                                value={formData.role}
                                onValueChange={(val: string) => setFormData({ ...formData, role: val })}
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="homeowner" id="r1" />
                                    <Label htmlFor="r1">Homeowner</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="provider" id="r2" />
                                    <Label htmlFor="r2">Service Provider</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                        <Button type="submit" className="w-full">
                            Sign Up
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
