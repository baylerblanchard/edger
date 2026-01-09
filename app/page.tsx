"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Leaf, Clock, Shield } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Leaf className="h-6 w-6" />
            <span>Edger</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="#how-it-works" className="hover:text-primary transition-colors">
              How it Works
            </Link>
            <Link href="#services" className="hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="/provider" className="hover:text-primary transition-colors">
              Become a Provider
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
            )}
            <Link href="/request">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6"
              >
                Lawncare, <span className="text-primary">simplified.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
              >
                Get your lawn mowed, edged, and looking perfect with just a few taps.
                Reliable local pros, transparent pricing, and instant booking.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/request">
                  <Button size="lg" className="w-full sm:w-auto gap-2 group">
                    Book a Service <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/provider">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Earn as a Provider
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
          {/* Decorative background blobs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </section>

        {/* Features / How it works */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-card">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How Edger Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Book Instantly</h3>
                <p className="text-muted-foreground">
                  Select your service, choose a time, and get matched with a pro in seconds.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col items-center text-center p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Vetted Pros</h3>
                <p className="text-muted-foreground">
                  Every provider is background checked and rated by neighbors like you.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col items-center text-center p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Satisfaction Guaranteed</h3>
                <p className="text-muted-foreground">
                  Payment is only released when you&apos;re 100% happy with the job.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to reclaim your weekend?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Stop sweating over your lawn. Let Edger handle the hard work while you enjoy your free time.
            </p>
            <Link href="/request">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Edger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
