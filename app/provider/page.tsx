import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, DollarSign } from "lucide-react";

// Mock data for jobs
const JOBS = [
    {
        id: 1,
        title: "Lawn Mowing & Edging",
        location: "452 Oak Lane, Springville",
        date: "Today, 2:00 PM",
        price: 60,
        distance: "1.2 mi",
        tags: ["Mowing", "Edging"],
    },
    {
        id: 2,
        title: "Weeding Flower Beds",
        location: "890 Pine Street, Springville",
        date: "Tomorrow, 10:00 AM",
        price: 45,
        distance: "2.5 mi",
        tags: ["Weeding"],
    },
    {
        id: 3,
        title: "Full Lawn Service",
        location: "123 Cedar Blvd, Mapleton",
        date: "Dec 24, 9:00 AM",
        price: 85,
        distance: "3.8 mi",
        tags: ["Mowing", "Edging", "Cleanup"],
    },
];

export default function ProviderDashboard() {
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
                    {JOBS.map((job) => (
                        <Card key={job.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{job.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {job.location}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                            ${job.price}
                                        </span>
                                        <p className="text-xs text-muted-foreground">{job.distance}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Calendar className="h-4 w-4" /> {job.date}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {job.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="font-normal">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 bg-slate-50 dark:bg-slate-900/50">
                                <Button className="w-full">Accept Job</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
