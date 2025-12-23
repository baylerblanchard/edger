"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, MapPin, Check, Leaf, Scissors, Shovel } from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES = [
    {
        id: "mowing",
        title: "Lawn Mowing",
        description: "Standard cut, trim, and cleanup.",
        icon: Leaf,
        price: "$45",
    },
    {
        id: "edging",
        title: "Detail Edging",
        description: "Crisp lines along driveways and beds.",
        icon: Scissors,
        price: "+$15",
    },
    {
        id: "weeding",
        title: "Weeding",
        description: "Removal of weeds from flower beds.",
        icon: Shovel,
        price: "+$25",
    },
];

export default function RequestServicePage() {
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        address: "",
        date: "",
    });

    const toggleService = (id: string) => {
        setSelectedServices((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background py-8">
            <div className="container max-w-lg mx-auto">
                <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Book a Service</CardTitle>
                        <CardDescription>
                            Step {step} of 2: {step === 1 ? "Choose Services" : "Details"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {step === 1 && (
                            <div className="grid gap-4">
                                {SERVICES.map((service) => {
                                    const Icon = service.icon;
                                    const isSelected = selectedServices.includes(service.id);
                                    return (
                                        <div
                                            key={service.id}
                                            onClick={() => toggleService(service.id)}
                                            className={cn(
                                                "flex items-start space-x-4 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent",
                                                isSelected ? "border-primary bg-green-50 dark:bg-green-900/10" : "bg-card"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-full", isSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium leading-none">{service.title}</p>
                                                    <span className="text-sm font-semibold">{service.price}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {service.description}
                                                </p>
                                            </div>
                                            {isSelected && <Check className="h-5 w-5 text-primary" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Property Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            placeholder="e.g. 123 Maple Ave"
                                            className="pl-9"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Preferred Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="date"
                                            type="date"
                                            className="pl-9"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        {step > 1 ? (
                            <Button variant="outline" onClick={handleBack}>Back</Button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        {step < 2 ? (
                            <Button onClick={handleNext} disabled={selectedServices.length === 0}>
                                Next Step
                            </Button>
                        ) : (
                            <Button onClick={() => {
                                const token = localStorage.getItem("token");
                                if (!token) {
                                    alert("Please log in to book a service");
                                    // In a real app, router.push("/login")
                                    return;
                                }

                                fetch("http://localhost:3001/service_requests", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        service_request: {
                                            service_type: selectedServices[0],
                                            address: formData.address,
                                            scheduled_date: formData.date,
                                            status: "pending"
                                        }
                                    })
                                })
                                    .then(async res => {
                                        if (res.ok) {
                                            alert("Booking Confirmed!");
                                            // Reset form or redirect
                                            setStep(1);
                                            setSelectedServices([]);
                                            setFormData({ address: "", date: "" });
                                        } else {
                                            const data = await res.json();
                                            alert("Error booking service: " + JSON.stringify(data));
                                        }
                                    })
                                    .catch(err => alert("Error: " + err));
                            }}>
                                Confirm Booking
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
