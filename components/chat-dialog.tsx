"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: number;
    content: string;
    user_id: number;
    created_at: string;
    sender: {
        email: string;
    };
}

interface ChatDialogProps {
    serviceRequestId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: number | null;
}

export function ChatDialog({ serviceRequestId, open, onOpenChange, currentUserId }: ChatDialogProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial fetch to find/create conversation
    useEffect(() => {
        if (!open || !serviceRequestId) return;

        const initChat = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

            try {
                setIsLoading(true);
                // valid way to start or resume a chat: POST /conversations with request ID
                // The backend should find_or_create
                const res = await fetch(`${apiUrl}/conversations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ service_request_id: serviceRequestId })
                });

                if (res.ok) {
                    const data = await res.json();
                    setConversationId(data.id);
                    if (data.messages) setMessages(data.messages);
                }
            } catch (err) {
                console.error("Failed to init chat", err);
            } finally {
                setIsLoading(false);
            }
        };

        initChat();
    }, [open, serviceRequestId]);

    // Polling for new messages
    useEffect(() => {
        if (!open || !conversationId) return;

        const pollMessages = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

            try {
                const res = await fetch(`${apiUrl}/conversations/${conversationId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        };

        // Poll every 3 seconds
        const interval = setInterval(pollMessages, 3000);
        return () => clearInterval(interval);
    }, [open, conversationId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId) return;

        const token = localStorage.getItem("token");
        if (!token) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        try {
            const res = await fetch(`${apiUrl}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    content: newMessage
                })
            });

            if (res.ok) {
                setNewMessage("");
                // Immediate refresh will happen on next poll, but we could optimistic update here
                // For simplicity, just let the poll or re-fetch handle it, or fetch immediately
                const msgData = await res.json();
                setMessages(prev => [...prev, msgData]);
            }
        } catch (err) {
            console.error("Failed to send", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chat</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-md bg-slate-50 dark:bg-slate-900/50">
                    {isLoading ? (
                        <div className="text-center text-sm text-muted-foreground">Loading chat...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-10">No messages yet. Say hi!</div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.user_id === currentUserId;
                            return (
                                <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                        isMe ? "bg-primary text-primary-foreground" : "bg-white dark:bg-slate-800 border"
                                    )}>
                                        <p>{msg.content}</p>
                                        <span className="text-[10px] opacity-70 block text-right mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                <form onSubmit={sendMessage} className="flex gap-2 pt-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
